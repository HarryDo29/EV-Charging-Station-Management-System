import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from './entity/transaction.entity';
import { AccountService } from 'src/account/account.service';
import { AccountEntity } from 'src/account/entity/account.entity';
import { Argon2Service } from 'src/argon2/argon2.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity, AccountEntity])],
  providers: [TransactionService, AccountService, Argon2Service],
  controllers: [TransactionController],
})
export class TransactionModule {}
