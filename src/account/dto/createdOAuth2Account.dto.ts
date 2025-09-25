import { CreateAccountDto } from './createdAccount.dto';
import { PartialType } from '@nestjs/mapped-types';

export class CreateOAuth2AccountDto extends PartialType(CreateAccountDto) {}
