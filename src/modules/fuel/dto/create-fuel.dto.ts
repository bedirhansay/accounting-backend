import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFuelDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  totalPrice: number;

  @IsString()
  @IsNotEmpty()
  invoiceNo: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  operationDate: Date;

  @IsNotEmpty()
  driverId: string;

  @IsString()
  @IsNotEmpty()
  vehicleId: string;
}
