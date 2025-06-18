import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PaginationDTO {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageSize: number;
}

export class PaginatedDateSearchDTO extends PaginationDTO {
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
