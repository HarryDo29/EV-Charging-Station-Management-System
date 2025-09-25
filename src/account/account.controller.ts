import { Controller, Body, Put, Param, Get, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
// import { CreateAccountDto } from './dto/createdAccount.dto';
import { UpdateAccountDto } from './dto/updatedAccount.dto';
import { AuthGuard } from '@nestjs/passport';
// import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Put('/update/:id')
  @UseGuards(AuthGuard('jwt'))
  async updateAccount(
    @Param('id') id: string,
    @Body() account: UpdateAccountDto,
  ) {
    return await this.accountService.updateAccount(id, account);
  }

  @Get('/get-account/:id')
  @UseGuards(AuthGuard('jwt'))
  async getAccount(@Param('id') id: string) {
    return await this.accountService.getAccount(id);
  }

  // @Delete('/delete/:id')
  // deleteAccount(@Param('id') id: string) {
  //   return this.accountService.deleteAccount(id);
  // }
}
