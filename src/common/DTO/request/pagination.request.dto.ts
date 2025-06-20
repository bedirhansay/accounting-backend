import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PaginationDTO {
  @ApiProperty({
    description: 'Sayfa numarası',
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageNumber: number;

  @ApiProperty({
    description: 'Sayfa başına gösterilecek kayıt sayısı',
    example: 10,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageSize: number;
}

export class PaginatedDateSearchDTO extends PaginationDTO {
  @ApiPropertyOptional({
    description: 'Aranacak metin (opsiyonel)',
    example: 'araç',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Başlangıç tarihi (ISO formatında, opsiyonel)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  beginDate?: string;

  @ApiPropertyOptional({
    description: 'Bitiş tarihi (ISO formatında, opsiyonel)',
    example: '2025-01-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
