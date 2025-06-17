import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PaginationQueryDTO {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageSize: number;
}

export class FilterQueryDTO extends PaginationQueryDTO {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  beginDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class IncomeExportQueryDTO {
  @IsDateString()
  beginDate: string;

  @IsDateString()
  endDate: string;
}
