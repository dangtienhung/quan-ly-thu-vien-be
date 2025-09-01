import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, IsNull, Not, QueryRunner, Repository } from 'typeorm';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import {
  ReaderType,
  ReaderTypeName,
} from '../reader-types/entities/reader-type.entity';
import { Reader } from '../readers/entities/reader.entity';
import {
  CreateMultipleUsersResponseDto,
  CreateUserResultDto,
} from './dto/create-multiple-users-response.dto';
import {
  CreateMultipleUsersDto,
  CreateUserItemDto,
} from './dto/create-multiple-users.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { FilterUsersDto } from './dto/filter-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AccountStatus, User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Reader)
    private readonly readerRepository: Repository<Reader>,
    @InjectRepository(ReaderType)
    private readonly readerTypeRepository: Repository<ReaderType>,
    private readonly dataSource: DataSource,
  ) {}

  // CREATE - Tạo user mới
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  // READ ALL - Danh sách users với pagination
  async findAll(
    filterQuery: FilterUsersDto,
  ): Promise<PaginatedResponseDto<User>> {
    const { page = 1, limit = 10, type, search } = filterQuery;
    const skip = (page - 1) * limit;

    // Tạo query builder để hỗ trợ lọc theo type và search
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Thêm điều kiện lọc theo type nếu có
    if (type) {
      queryBuilder.where('user.role = :role', { role: type });
    }

    // Thêm điều kiện search nếu có
    if (search) {
      if (type) {
        // Nếu có cả type và search, sử dụng andWhere
        queryBuilder.andWhere(
          '(user.username ILIKE :search OR user.email ILIKE :search OR user.userCode ILIKE :search)',
          { search: `%${search}%` },
        );
      } else {
        // Nếu chỉ có search, sử dụng where
        queryBuilder.where(
          '(user.username ILIKE :search OR user.email ILIKE :search OR user.userCode ILIKE :search)',
          { search: `%${search}%` },
        );
      }
    }

    const [data, totalItems] = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const meta: PaginationMetaDto = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };

    return { data, meta };
  }

  // READ ONE - Tìm user theo ID
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      // relations: ['reader'], // TODO: Uncomment when Reader entity relationships are stable
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // READ ONE - Tìm user theo username
  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username },
      // relations: ['reader'], // TODO: Uncomment when Reader entity relationships are stable
    });
    if (!user) {
      throw new NotFoundException(`User with username '${username}' not found`);
    }
    return user;
  }

  // READ ONE - Tìm user theo email
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      // relations: ['reader'], // TODO: Uncomment when Reader entity relationships are stable
    });
    if (!user) {
      throw new NotFoundException(`User with email '${email}' not found`);
    }
    return user;
  }

  // UPDATE - Cập nhật user
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if new username conflicts with existing users
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUsername = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (existingUsername) {
        throw new ConflictException('Username already exists');
      }
    }

    // Check if new email conflicts with existing users
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password if provided
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  // DELETE - Xóa user
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  // UTILITY - Suspend user account
  async suspendUser(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.accountStatus = AccountStatus.SUSPENDED;
    return await this.userRepository.save(user);
  }

  // UTILITY - Reactivate user account
  async reactivateUser(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.accountStatus = AccountStatus.ACTIVE;
    return await this.userRepository.save(user);
  }

  // UTILITY - Ban user account
  async banUser(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.accountStatus = AccountStatus.BANNED;
    return await this.userRepository.save(user);
  }

  // UTILITY - Update last login
  async updateLastLogin(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.lastLogin = new Date();
    return await this.userRepository.save(user);
  }

  // UTILITY - Get users by role
  async findByRole(
    role: UserRole,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<User>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.userRepository.findAndCount({
      where: { role },
      // relations: ['reader'], // TODO: Uncomment when Reader entity relationships are stable
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const meta: PaginationMetaDto = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };

    return { data, meta };
  }

  // UTILITY - Get users by account status
  async findByAccountStatus(
    accountStatus: AccountStatus,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<User>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.userRepository.findAndCount({
      where: { accountStatus },
      // relations: ['reader'], // TODO: Uncomment when Reader entity relationships are stable
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const meta: PaginationMetaDto = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };

    return { data, meta };
  }

  // SEARCH - Tìm kiếm users
  async search(
    query: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<User>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.userRepository
      .createQueryBuilder('user')
      // .leftJoinAndSelect('user.reader', 'reader') // TODO: Uncomment when Reader entity relationships are stable
      .where('user.username ILIKE :query', { query: `%${query}%` })
      .orWhere('user.email ILIKE :query', { query: `%${query}%` })
      // .orWhere('reader.fullName ILIKE :query', { query: `%${query}%` }) // TODO: Uncomment when Reader entity relationships are stable
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const meta: PaginationMetaDto = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };

    return { data, meta };
  }

  // CREATE MULTIPLE - Tạo nhiều user cùng lúc
  async createMultiple(
    createMultipleUsersDto: CreateMultipleUsersDto,
  ): Promise<CreateMultipleUsersResponseDto> {
    const results: CreateUserResultDto[] = [];
    let successCount = 0;
    let errorCount = 0;

    // Xử lý theo batch để tránh quá tải memory
    const batchSize = 50; // Giảm batch size để tránh timeout transaction
    const totalUsers = createMultipleUsersDto.users.length;

    console.log(`🚀 Bắt đầu import ${totalUsers} users`);

    for (let batchStart = 0; batchStart < totalUsers; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, totalUsers);
      const batch = createMultipleUsersDto.users.slice(batchStart, batchEnd);

      console.log(
        `📦 Xử lý batch ${Math.floor(batchStart / batchSize) + 1}: users ${batchStart + 1}-${batchEnd}`,
      );

      // Xử lý batch trong transaction
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Xử lý từng user trong batch
        for (let i = 0; i < batch.length; i++) {
          const userData = batch[i];
          const globalIndex = batchStart + i;

          try {
            // Chuyển đổi vai trò từ tiếng Việt sang enum
            const userRole = this.mapVaiTroToUserRole(userData.vaiTro);
            const accountStatus = this.mapTrangThaiToAccountStatus(
              userData.trangThaiHoatDong,
            );
            const readerTypeName = this.mapLoaiDocGiaToReaderType(
              userData.loaiDocGia,
            );

            // Tạo user trong transaction
            const user = await this.createUserFromDataWithTransaction(
              userData,
              userRole,
              accountStatus,
              queryRunner,
            );

            // Tạo reader trong transaction
            const reader = await this.createReaderFromDataWithTransaction(
              userData,
              user.id,
              readerTypeName,
              queryRunner,
            );

            results.push({
              status: 'success',
              user: {
                id: user.id,
                userCode: user.userCode || '',
                username: user.username,
                email: user.email,
              },
              reader: {
                id: reader.id,
                fullName: reader.fullName,
                cardNumber: reader.cardNumber,
              },
              index: globalIndex,
            });

            successCount++;
          } catch (error) {
            console.error(`❌ Lỗi tại user ${globalIndex + 1}:`, error.message);
            results.push({
              status: 'error',
              error: error.message || 'Lỗi không xác định',
              index: globalIndex,
            });
            errorCount++;
          }
        }

        // Commit transaction nếu thành công
        await queryRunner.commitTransaction();
      } catch (error) {
        // Rollback transaction nếu có lỗi
        await queryRunner.rollbackTransaction();
        console.error(
          `❌ Lỗi batch ${Math.floor(batchStart / batchSize) + 1}:`,
          error.message,
        );

        // Đánh dấu tất cả users trong batch này là lỗi
        for (let i = 0; i < batch.length; i++) {
          const globalIndex = batchStart + i;
          results.push({
            status: 'error',
            error: 'Lỗi transaction batch',
            index: globalIndex,
          });
          errorCount++;
        }
      } finally {
        await queryRunner.release();
      }

      // Gọi garbage collection sau mỗi batch để giải phóng memory
      if (global.gc) {
        global.gc();
      }

      console.log(
        `✅ Hoàn thành batch ${Math.floor(batchStart / batchSize) + 1}: ${successCount} thành công, ${errorCount} lỗi`,
      );
    }

    console.log(
      `🎉 Hoàn thành import: ${successCount}/${totalUsers} users thành công`,
    );

    return {
      totalUsers: createMultipleUsersDto.users.length,
      successCount,
      errorCount,
      results,
      message: `Đã tạo thành công ${successCount}/${createMultipleUsersDto.users.length} user`,
    };
  }

  // CREATE READER FOR USER - Tạo reader cho user đã tồn tại
  async createReaderForUser(userId: string, readerData: any): Promise<Reader> {
    // Kiểm tra user có tồn tại không
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Kiểm tra user đã có reader chưa
    const existingReader = await this.readerRepository.findOne({
      where: { userId: userId },
    });
    if (existingReader) {
      throw new ConflictException('User đã có reader');
    }

    // Lấy reader type
    const readerType = await this.readerTypeRepository.findOne({
      where: { typeName: readerData.readerTypeName },
    });
    if (!readerType) {
      throw new NotFoundException(
        `Không tìm thấy loại độc giả: ${readerData.readerTypeName}`,
      );
    }

    // Tạo reader
    const reader = this.readerRepository.create({
      userId: userId,
      readerTypeId: readerType.id,
      fullName: readerData.fullName,
      dob: readerData.dob,
      gender: readerData.gender,
      address: readerData.address,
      phone: readerData.phone,
      cardNumber: readerData.cardNumber,
      cardIssueDate: readerData.cardIssueDate,
      cardExpiryDate: readerData.cardExpiryDate,
      isActive: true,
    });

    return await this.readerRepository.save(reader);
  }

  // FIND LAST CARD NUMBER - Tìm số thẻ cuối cùng
  async findLastCardNumber(baseNumber: string): Promise<string | null> {
    const lastCard = await this.readerRepository
      .createQueryBuilder('reader')
      .where('reader.cardNumber LIKE :pattern', { pattern: `${baseNumber}%` })
      .orderBy('reader.cardNumber', 'DESC')
      .getOne();

    return lastCard ? lastCard.cardNumber : null;
  }

  // GET READER TYPES - Lấy danh sách loại độc giả
  async getReaderTypes(): Promise<any> {
    const readerTypes = await this.readerTypeRepository.find({
      order: { typeName: 'ASC' },
    });

    return {
      data: readerTypes,
      total: readerTypes.length,
    };
  }

  // FIND ALL USERS WITH USERCODE - Lấy tất cả users có userCode
  async findAllWithUserCode(): Promise<User[]> {
    return this.userRepository.find({
      where: {
        userCode: Not(IsNull()),
      },
    });
  }

  // FIND READER BY USER ID - Tìm reader theo userId
  async findReaderByUserId(userId: string): Promise<Reader | null> {
    return this.readerRepository.findOne({
      where: { userId: userId },
    });
  }

  // UPDATE READER CARD NUMBER - Cập nhật cardNumber của reader
  async updateReaderCardNumber(
    readerId: string,
    cardNumber: string,
  ): Promise<Reader | null> {
    await this.readerRepository.update(readerId, { cardNumber });
    return this.readerRepository.findOne({ where: { id: readerId } });
  }

  // Helper methods
  private mapVaiTroToUserRole(vaiTro: string): UserRole {
    switch (vaiTro) {
      case 'học sinh':
        return UserRole.READER;
      case 'nhân viên':
      case 'giáo viên':
        return UserRole.ADMIN;
      default:
        throw new Error(`Vai trò không hợp lệ: ${vaiTro}`);
    }
  }

  private mapTrangThaiToAccountStatus(trangThai: string): AccountStatus {
    switch (trangThai) {
      case 'hoạt động':
        return AccountStatus.ACTIVE;
      case 'bị cấm':
        return AccountStatus.BANNED;
      default:
        return AccountStatus.ACTIVE;
    }
  }

  private mapLoaiDocGiaToReaderType(loaiDocGia: string): ReaderTypeName {
    switch (loaiDocGia) {
      case 'học sinh':
        return ReaderTypeName.STUDENT;
      case 'giáo viên':
        return ReaderTypeName.TEACHER;
      case 'nhân viên':
        return ReaderTypeName.STAFF;
      default:
        throw new Error(`Loại độc giả không hợp lệ: ${loaiDocGia}`);
    }
  }

  private parseDate(dateString: string): Date {
    const [day, month, year] = dateString.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  private async createUserFromData(
    userData: CreateUserItemDto,
    userRole: UserRole,
    accountStatus: AccountStatus,
  ): Promise<User> {
    // Check if email already exists
    const existingEmail = await this.userRepository.findOne({
      where: { email: userData.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email đã tồn tại');
    }

    // Check if username already exists
    const existingUsername = await this.userRepository.findOne({
      where: { username: userData.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username đã tồn tại');
    }

    // Check if userCode already exists
    if (userData.userCode) {
      const existingUserCode = await this.userRepository.findOne({
        where: { userCode: userData.userCode },
      });
      if (existingUserCode) {
        throw new ConflictException('Mã người dùng đã tồn tại');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = this.userRepository.create({
      userCode: userData.userCode,
      username: userData.username,
      password: hashedPassword,
      email: userData.email,
      role: userRole,
      accountStatus: accountStatus,
    });

    return await this.userRepository.save(user);
  }

  private async createReaderFromData(
    userData: CreateUserItemDto,
    userId: string,
    readerTypeName: ReaderTypeName,
  ): Promise<Reader> {
    // Get reader type
    const readerType = await this.readerTypeRepository.findOne({
      where: { typeName: readerTypeName },
    });
    if (!readerType) {
      throw new Error(`Không tìm thấy loại độc giả: ${readerTypeName}`);
    }

    // Generate card number
    const cardNumber = await this.generateCardNumber();

    // Parse dates
    const dob = this.parseDate(userData.ngaySinh);
    const cardIssueDate = this.parseDate(userData.ngayBatDau);
    const cardExpiryDate = this.parseDate(userData.ngayKetThuc);

    // Validate card dates
    if (cardExpiryDate <= cardIssueDate) {
      throw new Error('Ngày kết thúc thẻ phải sau ngày bắt đầu');
    }

    const reader = this.readerRepository.create({
      userId: userId,
      readerTypeId: readerType.id,
      fullName: userData.username, // Sử dụng username làm fullName tạm thời
      dob: dob,
      gender: userData.gioiTinh,
      address: userData.diaChi,
      phone: userData.soDienThoai,
      cardNumber: cardNumber,
      cardIssueDate: cardIssueDate,
      cardExpiryDate: cardExpiryDate,
      isActive: true,
    });

    return await this.readerRepository.save(reader);
  }

  private async generateCardNumber(): Promise<string> {
    const prefix = 'LIB';
    const year = new Date().getFullYear();
    const baseNumber = `${prefix}${year}`;

    // Tìm số thẻ cuối cùng trong năm
    const lastCard = await this.readerRepository
      .createQueryBuilder('reader')
      .where('reader.cardNumber LIKE :pattern', { pattern: `${baseNumber}%` })
      .orderBy('reader.cardNumber', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastCard) {
      const lastNumber = parseInt(lastCard.cardNumber.replace(baseNumber, ''));
      nextNumber = lastNumber + 1;
    }

    return `${baseNumber}${nextNumber.toString().padStart(3, '0')}`;
  }

  private async createUserFromDataWithTransaction(
    userData: CreateUserItemDto,
    userRole: UserRole,
    accountStatus: AccountStatus,
    queryRunner: QueryRunner,
  ): Promise<User> {
    // Check if email already exists
    const existingEmail = await queryRunner.manager.findOne(User, {
      where: { email: userData.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email đã tồn tại');
    }

    // Check if username already exists
    const existingUsername = await queryRunner.manager.findOne(User, {
      where: { username: userData.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username đã tồn tại');
    }

    // Check if userCode already exists
    if (userData.userCode) {
      const existingUserCode = await queryRunner.manager.findOne(User, {
        where: { userCode: userData.userCode },
      });
      if (existingUserCode) {
        throw new ConflictException('Mã người dùng đã tồn tại');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = queryRunner.manager.create(User, {
      userCode: userData.userCode,
      username: userData.username,
      password: hashedPassword,
      email: userData.email,
      role: userRole,
      accountStatus: accountStatus,
    });

    return await queryRunner.manager.save(user);
  }

  private async createReaderFromDataWithTransaction(
    userData: CreateUserItemDto,
    userId: string,
    readerTypeName: ReaderTypeName,
    queryRunner: QueryRunner,
  ): Promise<Reader> {
    // Get reader type
    const readerType = await queryRunner.manager.findOne(ReaderType, {
      where: { typeName: readerTypeName },
    });
    if (!readerType) {
      throw new Error(`Không tìm thấy loại độc giả: ${readerTypeName}`);
    }

    // Generate card number
    const cardNumber =
      await this.generateCardNumberWithTransaction(queryRunner);

    // Parse dates
    const dob = this.parseDate(userData.ngaySinh);
    const cardIssueDate = this.parseDate(userData.ngayBatDau);
    const cardExpiryDate = this.parseDate(userData.ngayKetThuc);

    // Validate card dates
    if (cardExpiryDate <= cardIssueDate) {
      throw new Error('Ngày kết thúc thẻ phải sau ngày bắt đầu');
    }

    const reader = queryRunner.manager.create(Reader, {
      userId: userId,
      readerTypeId: readerType.id,
      fullName: userData.username, // Sử dụng username làm fullName tạm thời
      dob: dob,
      gender: userData.gioiTinh,
      address: userData.diaChi,
      phone: userData.soDienThoai,
      cardNumber: cardNumber,
      cardIssueDate: cardIssueDate,
      cardExpiryDate: cardExpiryDate,
      isActive: true,
    });

    return await queryRunner.manager.save(reader);
  }

  private async generateCardNumberWithTransaction(
    queryRunner: QueryRunner,
  ): Promise<string> {
    const prefix = 'LIB';
    const year = new Date().getFullYear();
    const baseNumber = `${prefix}${year}`;

    // Tìm số thẻ cuối cùng trong năm
    const lastCard = await queryRunner.manager
      .createQueryBuilder(Reader, 'reader')
      .where('reader.cardNumber LIKE :pattern', { pattern: `${baseNumber}%` })
      .orderBy('reader.cardNumber', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastCard) {
      const lastNumber = parseInt(lastCard.cardNumber.replace(baseNumber, ''));
      nextNumber = lastNumber + 1;
    }

    return `${baseNumber}${nextNumber.toString().padStart(3, '0')}`;
  }
}
