import {
  Controller,
  Body,
  Put,
  Param,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AccountService } from './account.service';
// import { CreateAccountDto } from './dto/createdAccount.dto';
import { UpdateAccountDto } from './dto/updatedAccount.dto';
import { AuthGuard } from '@nestjs/passport';
// import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request as RequestExpress } from 'express';
import { AuthenticatedUserDto } from 'src/auth/dto/authenticated-user.dto';

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

  @Get('/get-account')
  @UseGuards(AuthGuard('jwt'))
  async getAccount(@Request() req: RequestExpress) {
    const acc = req.user as AuthenticatedUserDto;
    return await this.accountService.getAccount(acc.id);
  }

  // @Delete('/delete/:id')
  // deleteAccount(@Param('id') id: string) {
  //   return this.accountService.deleteAccount(id);
  // }
}
