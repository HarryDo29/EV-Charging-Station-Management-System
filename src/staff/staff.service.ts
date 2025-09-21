import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { StaffEntity } from './entity/staff.entity';

@Injectable()
export class StaffService {
  constructor(private readonly staffRepo: Repository<StaffEntity>) {}
}
