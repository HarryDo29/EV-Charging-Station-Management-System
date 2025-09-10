import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountDto } from './createdAccount.dto';
import { IsString, IsNotEmpty } from 'class-validator';
import { IsUUID } from 'class-validator';

// PartialType sẽ lấy tất cả các thuộc tính của CreateAccountDto
// và biến chúng thành tùy chọn (thêm dấu ? và decorator @IsOptional)
export class UpdateAccountDto extends PartialType(CreateAccountDto) {}

export class UpdateAccountProfileDto extends PartialType(CreateAccountDto) {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
