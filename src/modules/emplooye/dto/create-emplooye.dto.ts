import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  departmentName: string;

  @IsDate()
  @Type(() => Date)
  hireDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  terminationDate?: Date | null;

  @IsNumber()
  salary: number;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  @IsNotEmpty()
  companyId: string;
}
