import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateIncomeDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsNumber()
  unitCount: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  operationDate: string;
}
