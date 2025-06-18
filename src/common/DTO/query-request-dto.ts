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

export class DateRangeDTO {
  @IsOptional()
  @IsDateString()
  beginDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class SearchDTO {
  @IsOptional()
  @IsString()
  search?: string;
}

// Bileşik kullanım
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

export class PaginatedSearchDTO extends PaginationDTO {
  @IsOptional()
  @IsString()
  search?: string;
}

export class IListDTO extends PaginatedDateSearchDTO {
  @IsString()
  companyId: string;
}
