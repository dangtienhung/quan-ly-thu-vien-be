import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum ViewUpdateType {
  INCREMENT = 'increment',
  SET = 'set',
}

export class UpdateBookViewDto {
  @ApiProperty({
    description: 'Loại cập nhật số lượt xem',
    enum: ViewUpdateType,
    example: ViewUpdateType.INCREMENT,
    default: ViewUpdateType.INCREMENT,
  })
  @IsEnum(ViewUpdateType)
  @IsOptional()
  type?: ViewUpdateType = ViewUpdateType.INCREMENT;

  @ApiProperty({
    description: 'Giá trị số lượt xem (chỉ sử dụng khi type = "set")',
    example: 100,
    required: false,
  })
  @IsOptional()
  value?: number;
}
