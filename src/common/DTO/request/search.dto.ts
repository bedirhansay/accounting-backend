import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDTO } from './pagination.dto';

export class SearchDTO {
  @ApiPropertyOptional({ description: 'Arama metni', example: 'john' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class PaginatedSearchDTO extends PaginationDTO {
  @ApiPropertyOptional({ description: 'Arama metni', example: 'john' })
  @IsOptional()
  @IsString()
  search?: string;
}
