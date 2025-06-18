import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

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
