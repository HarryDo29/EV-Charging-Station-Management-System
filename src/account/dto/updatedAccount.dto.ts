import { PartialType } from '@nestjs/mapped-types';
import { AccountDto } from './account.dto';

// PartialType will take all properties of AccountDto
export class UpdateAccountDto extends PartialType(AccountDto) {}
