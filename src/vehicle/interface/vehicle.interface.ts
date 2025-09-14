import { IAccount } from 'src/account/interface/account.interface';

export interface IVehicle {
  id: string;
  account_id: string;
  car_makes: string;
  models: string;
  license_plate: string;
  connector_type: string;
  battery_capacity_kwh: number;
  charging_power_kw: number;
  status: boolean;

  account?: IAccount;
}
