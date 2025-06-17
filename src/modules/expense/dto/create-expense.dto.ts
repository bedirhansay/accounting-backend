import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateExpenseDto {
  @IsDateString()
  operationDate: string;

  @IsString()
  category: string;

  @IsNumber()
  amount: number;

  @IsString()
  description: string;

  @IsString()
  paymentType: string;

  @IsBoolean()
  isPaid: boolean;

  @IsOptional()
  @IsString()
  relatedToId?: string;
}
