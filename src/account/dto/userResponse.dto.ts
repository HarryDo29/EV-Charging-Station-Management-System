import { Role } from 'src/enums/role.enum';
import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  full_name: string;

  @Expose()
  phone_number?: string;

  @Expose()
  email: string;

  @Expose()
  role: Role;

  @Expose()
  is_verified: boolean;

  @Expose()
  is_active: boolean;

  @Expose()
  is_oauth2: boolean;
}
