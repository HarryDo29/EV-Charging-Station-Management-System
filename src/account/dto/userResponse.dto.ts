import { IsEmail, IsString, IsUUID, IsBoolean, IsUrl } from 'class-validator';
import { Expose, Transform } from 'class-transformer';
import { Role, roleToText } from 'src/enums/role.enum';

export class UserResponseDto {
  @Expose()
  @IsUUID()
  id: string;

  @Expose()
  @IsString()
  full_name: string;

  @Expose()
  @IsString()
  phone_number?: string;

  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @IsString()
  @Transform(({ value }: { value: Role }) => roleToText(value))
  role: string;

  @Expose()
  @IsBoolean()
  is_verified: boolean;

  @Expose()
  @IsBoolean()
  is_active: boolean;

  @Expose()
  @IsBoolean()
  is_oauth2: boolean;

  @Expose()
  @IsUrl()
  avatar_url?: string;

  @Expose()
  @IsString()
  google_id?: string;
}
