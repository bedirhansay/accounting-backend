import { IsDateString, IsMongoId, IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsMongoId()
  customerId: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  operationDate: string;

  @IsString()
  description: string;
}
