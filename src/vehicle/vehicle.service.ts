import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { VehicleEntity } from './entity/vehicle.entity';
// import { AccountEntity } from 'src/account/entity/account.entity';
import { CreateVehicleDto } from './dto/createdCar.dto';
import { AccountService } from 'src/account/account.service';
import { SearchVehicleDto } from './dto/searchVehicle.dto';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(VehicleEntity)
    private readonly vehicleRepo: Repository<VehicleEntity>,
    // @InjectRepository(AccountEntity)
    // private readonly accountRepo: Repository<AccountEntity>,
    private readonly accountService: AccountService,
  ) {}

  /**
   * Find a vehicle by its ID
   * @param id - The ID of the vehicle
   * @returns The vehicle entity
   */
  async findVehicleById(id: string): Promise<VehicleEntity | null> {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id },
      relations: ['account'],
    });
    return vehicle;
  }

  /**
   * Find a vehicle by its license plate
   * @param licensePlate - The license plate of the vehicle
   * @returns The vehicle entity
   */
  async findVehicleByLicensePlate(
    licensePlate: string,
  ): Promise<VehicleEntity | null> {
    const vehicle = await this.vehicleRepo.findOne({
      where: { license_plate: licensePlate },
      relations: ['account'],
    });
    return vehicle;
  }

  /**
   * Find a vehicle by its account ID
   * @param accountId - The ID of the account
   * @returns The vehicle entity
   */
  async findVehicleByAccountId(
    accountId: string,
  ): Promise<VehicleEntity | null> {
    const vehicle = await this.vehicleRepo.findOne({
      where: { account_id: accountId },
      relations: ['account'],
    });
    return vehicle;
  }

  /**
   * Create a new vehicle
   * @param createVehicleDto - The DTO containing the vehicle data
   * @returns The created vehicle entity
   */
  async createVehicle(
    createVehicleDto: CreateVehicleDto,
  ): Promise<VehicleEntity> {
    const account = await this.accountService.findAccountById(
      createVehicleDto.account_id,
    );
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    const vehicle = this.vehicleRepo.create({
      ...createVehicleDto,
      account: account,
    });
    return await this.vehicleRepo.save(vehicle);
  }

  /**
   * Find all vehicles by their account ID
   * @param accountId - The ID of the account
   * @returns The array of vehicle entities
   */
  async findAllVehicles(accountId: string): Promise<VehicleEntity[]> {
    return await this.vehicleRepo.find({
      relations: ['account'],
      where: { account_id: accountId },
    });
  }

  /**
   * Search for vehicles based on the provided criteria
   * @param searchVehicleDto - The DTO containing the search criteria
   * @returns The array of vehicle entities
   */
  async searchVehicles(
    searchVehicleDto: SearchVehicleDto,
  ): Promise<VehicleEntity[]> {
    const { car_makes, connector_type } = searchVehicleDto;
    return await this.vehicleRepo.find({
      relations: ['account'],
      where: {
        car_makes: car_makes ? car_makes : undefined,
        connector_type: connector_type ? connector_type : undefined,
      },
    });
  }

  /**
   * Update the status of a vehicle
   * @param id - The ID of the vehicle
   * @param status - The new status of the vehicle
   * @returns The update result
   */
  async updateVehicleStatus(
    id: string,
    status: boolean,
  ): Promise<UpdateResult> {
    const vehicle = await this.vehicleRepo.update(
      {
        id: id,
      },
      { status: status },
    );
    if (vehicle.affected === 0) {
      throw new NotFoundException('Vehicle not found');
    }
    return vehicle;
  }
}
