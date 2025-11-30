import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/enums/role.enum';

// key for saving roles in metadata
export const ROLES_KEY = 'roles';

// decorator to save roles in metadata (@Roles('admin', 'staff'))
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
