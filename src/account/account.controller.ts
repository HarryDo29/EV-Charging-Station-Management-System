import { Controller, Body, Put, Param } from '@nestjs/common';
import { AccountService } from './account.service';
// import { CreateAccountDto } from './dto/createdAccount.dto';
import { UpdateAccountDto } from './dto/updatedAccount.dto';
// import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  //   @Post('/register')
  //   createAccount(@Body() account: CreateAccountDto) {
  //     return this.accountService.createAccount(account);
  //   }

  // @ApiTags('Account')
  // @ApiOperation({ summary: 'Update an account' })
  @Put('/update/:id')
  updateAccount(@Param('id') id: string, @Body() account: UpdateAccountDto) {
    return this.accountService.updateAccount(id, account);
  }

  // @Delete('/delete/:id')
  // deleteAccount(@Param('id') id: string) {
  //   return this.accountService.deleteAccount(id);
  // }
}
