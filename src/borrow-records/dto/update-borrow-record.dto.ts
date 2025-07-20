import { PartialType } from '@nestjs/swagger';
import { CreateBorrowRecordDto } from './create-borrow-record.dto';

export class UpdateBorrowRecordDto extends PartialType(CreateBorrowRecordDto) {}
