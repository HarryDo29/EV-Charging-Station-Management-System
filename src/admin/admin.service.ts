import { Injectable } from '@nestjs/common';
import { AccountEntity } from 'src/account/entity/account.entity';
import { GetAccountsDto } from './dto/getAccounts.dto';
import { Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateAccountDto } from './dto/updateAccount.dto';
import { StaffEntity } from 'src/staff/entity/staff.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
  ) {}

  // get accounts
  async getAccounts(
    searchDto: GetAccountsDto,
  ): Promise<[AccountEntity[], number]> {
    const { full_name, role, is_verified, is_active, sort, page, limit } =
      searchDto;
    // create query builder
    const queryBuilder = this.accountRepository.createQueryBuilder('account');
    // filter by full_name if full_name is provided
    if (full_name) {
      queryBuilder.where('account.full_name LIKE :full_name', {
        full_name: `%${full_name}%`,
      });
    }
    // filter by role if role is provided
    if (role) {
      queryBuilder.where('account.role = :role', { role });
    }
    // filter by is_verified if is_verified is provided
    if (is_verified) {
      queryBuilder.where('account.is_verified = :is_verified', {
        is_verified,
      });
    }
    // filter by is_active if is_active is provided
    if (is_active) {
      queryBuilder.where('account.is_active = :is_active', { is_active });
    }
    // sort by created_at if sort is provided
    if (sort) {
      const [field, direction] = sort.split(':');
      queryBuilder.orderBy(
        `account.${field}`,
        direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
      );
    }
    // pagination if page and limit is provided
    if (page && limit) {
      queryBuilder.skip((page - 1) * limit).take(limit);
    }
    return await queryBuilder.getManyAndCount();
  }

  // update account
  async updateAccount(
    account_id: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<UpdateResult> {
    const updateData = Object.fromEntries(
      Object.entries(updateAccountDto).filter(
        ([, value]) => value !== undefined,
      ),
    );
    return await this.accountRepository.update(account_id, updateData);
  }

  // update staff (change station)
  async updateStaff(
    account_id: string,
    station_id: string,
  ): Promise<UpdateResult> {
    return await this.staffRepository.update(account_id, { station_id });
  }
}
