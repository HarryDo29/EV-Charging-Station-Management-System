import { Controller, Body, Put, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AccountService } from './account.service';
import { UpdateAccountDto } from './dto/updatedAccount.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request as RequestExpress } from 'express';
import { AuthenticatedUserDto } from 'src/auth/dto/authenticated-user.dto';
import { UserResponseDto } from './dto/userResponse.dto';

@ApiTags('Account')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Put('')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiBody({ type: UpdateAccountDto })
  @ApiOperation({ summary: 'Update account information' })
  @ApiResponse({
    status: 200,
    description: 'Account updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateAccount(
    @Request() req: RequestExpress,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<UserResponseDto | null> {
    const acc = req.user as AuthenticatedUserDto;
    return await this.accountService.updateAccount(acc.id, updateAccountDto);
  }

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current account information' })
  @ApiResponse({
    status: 200,
    description: 'Account retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAccount(@Request() req: RequestExpress): Promise<UserResponseDto> {
    const acc = req.user as AuthenticatedUserDto;
    return await this.accountService.getAccount(acc.id);
  }
}
