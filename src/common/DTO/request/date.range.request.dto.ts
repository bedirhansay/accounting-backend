import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class DateRangeDTO {
  @ApiPropertyOptional({
    example: '2024-01-01',
    description: 'Başlangıç tarihi (ISO 8601 formatında)',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  beginDate?: string;

  @ApiPropertyOptional({
    example: '2024-01-01',
    description: 'Bitiş tarihi (ISO 8601 formatında)',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

import { Type } from 'class-transformer';
import { IsBoolean } from 'class-validator';

// Pagination base DTO
export class PaginationDto {
  @ApiPropertyOptional({ example: 1, description: 'Sayfa numarası' })
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 10, description: 'Sayfa başına veri adedi' })
  @Type(() => Number)
  @IsOptional()
  limit?: number;
}

// Tarih aralığı DTO'su
export class DateRangeDto {
  @ApiPropertyOptional({ example: '2024-06-01', description: 'Başlangıç tarihi (ISO format)' })
  @IsOptional()
  @IsDateString()
  beginDate?: string;

  @ApiPropertyOptional({ example: '2024-06-30', description: 'Bitiş tarihi (ISO format)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class SearchIncomeDto extends PaginationDto {
  @ApiPropertyOptional({ example: true, description: 'Tahsil edildi mi?' })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @ApiPropertyOptional({ example: '2024-06-01', description: 'Başlangıç tarihi (ISO format)' })
  @IsOptional()
  @IsDateString()
  beginDate?: string;

  @ApiPropertyOptional({ example: '2024-06-30', description: 'Bitiş tarihi (ISO format)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: 'nakit',
    description: 'Açıklama, kategori veya müşteri adına göre arama',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
