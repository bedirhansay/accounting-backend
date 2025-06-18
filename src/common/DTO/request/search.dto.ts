import { IsOptional, IsString } from 'class-validator';
import { PaginationDTO } from './pagination.dto';

export class SearchDTO {
  @IsOptional()
  @IsString()
  search?: string;
}

export class PaginatedSearchDTO extends PaginationDTO {
  @IsOptional()
  @IsString()
  search?: string;
}
