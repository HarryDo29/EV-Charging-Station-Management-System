import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountDto } from './createdAccount.dto';
import { IsString, IsNotEmpty, IsEnum, IsBoolean } from 'class-validator';
import { IsUUID } from 'class-validator';
import { Role } from 'src/enums/role.enum';

// PartialType sẽ lấy tất cả các thuộc tính của CreateAccountDto
// và biến chúng thành tùy chọn (thêm dấu ? và decorator @IsOptional)
export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  @IsString()
  full_name?: string;

  @IsString()
  email?: string;

  @IsString()
  password_hash?: string;

  @IsEnum(Role)
  role?: Role;

  @IsBoolean()
  is_verified?: boolean;

  @IsBoolean()
  is_active?: boolean;
}

export class UpdateAccountProfileDto extends PartialType(CreateAccountDto) {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
