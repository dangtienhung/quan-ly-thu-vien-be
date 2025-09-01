import * as XLSX from 'xlsx';

import { AccountStatus, UserRole } from './entities/user.entity';
import { BadRequestException, Injectable } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { Gender } from '../readers/entities/reader.entity';
import { ReaderTypeName } from '../reader-types/entities/reader-type.entity';
import { UploadExcelResponseDto } from './dto/upload-excel.dto';
import { UsersService } from './users.service';

@Injectable()
export class ExcelService {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Đọc và parse file Excel
   */
  async parseExcelFile(
    file: Express.Multer.File,
  ): Promise<UploadExcelResponseDto> {
    try {
      // Kiểm tra định dạng file
      if (!this.isValidExcelFile(file)) {
        throw new BadRequestException('Chỉ chấp nhận file Excel (.xlsx, .xls)');
      }

      // Đọc file Excel
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });

      // Lấy sheet đầu tiên
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new BadRequestException('File Excel không có sheet nào');
      }

      const worksheet = workbook.Sheets[sheetName];

      // Chuyển đổi thành JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        throw new BadRequestException(
          'File Excel phải có ít nhất 1 dòng header và 1 dòng dữ liệu',
        );
      }

      // Lấy header (dòng đầu tiên)
      const headers = jsonData[0] as string[];
      console.log('Headers:', headers);

      // Chuyển đổi dữ liệu thành object
      const processedData = jsonData
        .slice(1)
        .map((row: any, index: number) => {
          const rowData: any = {};
          headers.forEach((header, colIndex) => {
            if (header && row[colIndex] !== undefined) {
              let value = row[colIndex];

              // Xử lý các trường ngày tháng
              const dateFields = ['dob', 'cardIssueDate', 'cardExpriryDate'];
              if (dateFields.includes(header.trim())) {
                value = this.formatExcelDate(value);
              }

              rowData[header.trim()] = value;
            }
          });
          return {
            ...rowData,
            _rowIndex: index + 2, // +2 vì index bắt đầu từ 0 và có header
          };
        })
        .filter((row) => {
          // Lọc bỏ các dòng trống
          return Object.values(row).some(
            (value) => value !== undefined && value !== null && value !== '',
          );
        });

      // Validate dữ liệu
      const validationResult = this.validateExcelData(processedData);

      // tạo mới người dùng
      const createUsersFromExcel =
        await this.createUsersFromExcel(processedData);

      // trả về kết quả

      return {
        message: 'File Excel đã được upload và đọc thành công',
        filename: file.originalname,
        size: file.size,
        totalRows: processedData.length,
        validRows: validationResult.validRows,
        invalidRows: validationResult.invalidRows,
        errors:
          validationResult.errors.length > 0
            ? validationResult.errors
            : undefined,
        data: processedData,
      };
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      throw new BadRequestException(
        `Không thể đọc file Excel: ${error.message}`,
      );
    }
  }

  /**
   * Tạo user và reader từ dữ liệu Excel
   */
  async createUsersFromExcel(excelData: any[]): Promise<any> {
    const results: any[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];
      try {
        // Transform dữ liệu Excel sang CreateUserDto
        const createUserDto: CreateUserDto = {
          userCode: row['useCode'] || '',
          username: row['username'] || '',
          password: String(row['password']) || '123456', // Default password
          email: row['email'] || '',
          role: this.mapRoleToUserRole(row['role'] || 'reader'),
          accountStatus: this.mapStatusToAccountStatus(
            row['accountStatus'] || 'active',
          ),
        };

        // Tạo user
        const user = await this.usersService.create(createUserDto);

        // Tạo reader từ user vừa tạo
        const readerData = {
          userId: user.id,
          fullName: row['username'] || '', // Sử dụng username làm fullName
          dob: row['dob'] ? new Date(row['dob']) : null,
          gender: this.mapGenderToEnum(row['gender'] || 'male'),
          address: row['address'] || '',
          phone: row['phone'] || '',
          cardNumber: row['useCode'] || '',
          cardIssueDate: row['cardIssueDate']
            ? new Date(row['cardIssueDate'])
            : null,
          cardExpiryDate: row['cardExpriryDate']
            ? new Date(row['cardExpriryDate'])
            : null,
          readerTypeName: this.mapReaderTypeToEnum(
            row['readerType'] || 'student',
          ),
        };

        // Tạo reader (sẽ được xử lý trong UsersService.create)
        const reader = await this.usersService.createReaderForUser(
          user.id,
          readerData,
        );

        results.push({
          status: 'success',
          user: {
            id: user.id,
            userCode: user.userCode,
            username: user.username,
            email: user.email,
          },
          reader: {
            id: reader.id,
            fullName: reader.fullName,
            cardNumber: reader.cardNumber,
          },
          rowIndex: i + 1,
        });

        successCount++;
      } catch (error) {
        console.error(`Lỗi tạo user ở dòng ${i + 1}:`, error.message);
        results.push({
          status: 'error',
          error: error.message,
          rowIndex: i + 1,
        });
        errorCount++;
      }
    }

    return {
      totalRows: excelData.length,
      successCount,
      errorCount,
      results,
    };
  }

  /**
   * Sync userCode từ User sang cardNumber của Reader
   */
  async syncUserCodeToCardNumber(): Promise<any> {
    try {
      // Lấy tất cả users có userCode
      const users = await this.usersService.findAllWithUserCode();

      let successCount = 0;
      let errorCount = 0;
      const results: any[] = [];

      for (const user of users) {
        try {
          // Tìm reader của user này
          const reader = await this.usersService.findReaderByUserId(user.id);

          if (reader) {
            // Cập nhật cardNumber = userCode
            if (user.userCode) {
              await this.usersService.updateReaderCardNumber(
                reader.id,
                user.userCode,
              );

              results.push({
                status: 'success',
                userId: user.id,
                userCode: user.userCode,
                readerId: reader.id,
                oldCardNumber: reader.cardNumber,
                newCardNumber: user.userCode,
              });

              successCount++;
            } else {
              results.push({
                status: 'error',
                userId: user.id,
                userCode: user.userCode,
                error: 'User không có userCode',
              });
              errorCount++;
            }
          } else {
            results.push({
              status: 'error',
              userId: user.id,
              userCode: user.userCode,
              error: 'Không tìm thấy reader cho user này',
            });
            errorCount++;
          }
        } catch (error) {
          console.error(`Lỗi sync user ${user.id}:`, error.message);
          results.push({
            status: 'error',
            userId: user.id,
            userCode: user.userCode,
            error: error.message,
          });
          errorCount++;
        }
      }

      return {
        message: 'Sync userCode sang cardNumber hoàn tất',
        totalUsers: users.length,
        successCount,
        errorCount,
        results,
      };
    } catch (error) {
      console.error('Error syncing userCode to cardNumber:', error);
      throw new BadRequestException(
        `Không thể sync userCode: ${error.message}`,
      );
    }
  }

  /**
   * Kiểm tra file có phải là Excel không
   */
  private isValidExcelFile(file: Express.Multer.File): boolean {
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];

    const allowedExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.originalname
      .toLowerCase()
      .substring(file.originalname.lastIndexOf('.'));

    return (
      allowedMimeTypes.includes(file.mimetype) ||
      allowedExtensions.includes(fileExtension)
    );
  }

  /**
   * Format ngày từ Excel
   */
  private formatExcelDate(value: any): string {
    if (typeof value === 'number') {
      // Excel serial number - chuyển đổi sang Date
      const excelDate = new Date((value - 25569) * 86400 * 1000);
      return excelDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    } else if (value instanceof Date) {
      // Date object
      return value.toISOString().split('T')[0];
    } else if (typeof value === 'string') {
      // String - giữ nguyên
      return value;
    }
    return '';
  }

  /**
   * Validate dữ liệu Excel
   */
  private validateExcelData(data: any[]): {
    validRows: number;
    invalidRows: number;
    errors: string[];
  } {
    const errors: string[] = [];
    let validRows = 0;
    let invalidRows = 0;

    data.forEach((row, index) => {
      let hasError = false;

      // Validate các trường bắt buộc
      if (!row['useCode']) {
        errors.push(`Dòng ${index + 1}: Thiếu mã người dùng (useCode)`);
        hasError = true;
      }

      if (!row['username']) {
        errors.push(`Dòng ${index + 1}: Thiếu tên đăng nhập (username)`);
        hasError = true;
      }

      if (!row['email']) {
        errors.push(`Dòng ${index + 1}: Thiếu email`);
        hasError = true;
      }

      if (!row['password']) {
        errors.push(`Dòng ${index + 1}: Thiếu mật khẩu (password)`);
        hasError = true;
      }

      if (!row['role']) {
        errors.push(`Dòng ${index + 1}: Thiếu vai trò (role)`);
        hasError = true;
      }

      if (!row['accountStatus']) {
        errors.push(
          `Dòng ${index + 1}: Thiếu trạng thái tài khoản (accountStatus)`,
        );
        hasError = true;
      }

      if (!row['gender']) {
        errors.push(`Dòng ${index + 1}: Thiếu giới tính (gender)`);
        hasError = true;
      }

      if (!row['address']) {
        errors.push(`Dòng ${index + 1}: Thiếu địa chỉ (address)`);
        hasError = true;
      }

      if (!row['phone']) {
        errors.push(`Dòng ${index + 1}: Thiếu số điện thoại (phone)`);
        hasError = true;
      }

      if (!row['readerType']) {
        errors.push(`Dòng ${index + 1}: Thiếu loại độc giả (readerType)`);
        hasError = true;
      }

      // Validate các trường enum
      if (row['role'] && !['Độc giả', 'Admin'].includes(row['role'])) {
        errors.push(
          `Dòng ${index + 1}: Vai trò phải là 'Độc giả' hoặc 'Admin'`,
        );
        hasError = true;
      }

      if (
        row['accountStatus'] &&
        !['Hoạt động', 'Không hoạt động'].includes(row['accountStatus'])
      ) {
        errors.push(
          `Dòng ${index + 1}: Trạng thái phải là 'Hoạt động' hoặc 'Không hoạt động'`,
        );
        hasError = true;
      }

      if (row['gender'] && !['Khác', 'Nam', 'Nữ'].includes(row['gender'])) {
        errors.push(
          `Dòng ${index + 1}: Giới tính phải là 'Nam', 'Nữ', hoặc 'Khác'`,
        );
        hasError = true;
      }

      // Validate password length
      if (row['password']) {
        if (row['password'].length < 6) {
          errors.push(`Dòng ${index + 1}: Mật khẩu phải có ít nhất 6 ký tự`);
          hasError = true;
        }
        if (row['password'].length > 255) {
          errors.push(`Dòng ${index + 1}: Mật khẩu không được quá 255 ký tự`);
          hasError = true;
        }
      }

      if (hasError) {
        invalidRows++;
      } else {
        validRows++;
      }
    });

    return {
      validRows,
      invalidRows,
      errors: errors.slice(0, 20), // Giới hạn 20 lỗi đầu tiên
    };
  }

  /**
   * Map role Excel sang UserRole enum
   */
  private mapRoleToUserRole(role: string): UserRole {
    if (role === 'Admin') return UserRole.ADMIN;
    return UserRole.READER;
  }

  /**
   * Map status Excel sang AccountStatus enum
   */
  private mapStatusToAccountStatus(status: string): AccountStatus {
    if (status === 'Không hoạt động') return AccountStatus.SUSPENDED;
    if (status === 'Bị cấm') return AccountStatus.BANNED;
    return AccountStatus.ACTIVE;
  }

  /**
   * Map gender Excel sang Gender enum
   */
  private mapGenderToEnum(gender: string): Gender {
    if (gender === 'Nữ') return Gender.FEMALE;
    if (gender === 'Khác') return Gender.OTHER;
    return Gender.MALE;
  }

  /**
   * Map readerType Excel sang ReaderTypeName enum
   */
  private mapReaderTypeToEnum(readerType: string): ReaderTypeName {
    if (readerType === 'teacher') return ReaderTypeName.TEACHER;
    if (readerType === 'staff') return ReaderTypeName.STAFF;
    return ReaderTypeName.STUDENT;
  }

  /**
   * Generate card number
   */
  private async generateCardNumber(): Promise<string> {
    const prefix = 'LIB';
    const year = new Date().getFullYear();
    const baseNumber = `${prefix}${year}`;

    // Tìm số thẻ cuối cùng trong năm
    const lastCard = await this.usersService.findLastCardNumber(baseNumber);

    let nextNumber = 1;
    if (lastCard) {
      const lastNumber = parseInt(lastCard.replace(baseNumber, ''));
      nextNumber = lastNumber + 1;
    }

    return `${baseNumber}${nextNumber.toString().padStart(3, '0')}`;
  }
}
