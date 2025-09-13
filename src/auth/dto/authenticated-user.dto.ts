import { Role } from 'src/enums/role.enum';
import { Expose } from 'class-transformer';

export class AuthenticatedUserDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  role: Role;
}
