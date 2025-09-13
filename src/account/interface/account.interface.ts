import { Role } from 'src/enums/role.enum';

export interface IAccount {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  role: Role;
  is_verified: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
