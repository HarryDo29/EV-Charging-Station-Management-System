import { Role } from 'src/enums/role.enum';
import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  name: string;

  @Expose()
  role: Role;

  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;
}
