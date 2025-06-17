import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  plateNumber: string;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsDateString()
  inspectionDate: string;

  @IsDateString()
  insuranceDate: string;

  @IsString()
  driverId: string;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}
