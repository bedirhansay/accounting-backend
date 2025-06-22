import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({
    example: '34ABC123',
    description: 'Araç plakası',
  })
  @IsString()
  plateNumber: string;

  @ApiProperty({
    example: 'Ford',
    description: 'Araç markası',
  })
  @IsString()
  brand: string;

  @ApiProperty({
    example: 'Focus',
    description: 'Araç modeli',
  })
  @IsString()
  model: string;

  @ApiPropertyOptional({ description: 'Muayne Tarihi', type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  inspectionDate?: string;

  @ApiPropertyOptional({ description: 'Sigorta Tarihi', type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  insuranceDate?: string;

  @ApiProperty({
    example: '664e9d66e2a4d9c2d78e8c8f',
    description: 'Sürücü ID (ObjectId)',
  })
  @IsString()
  driverId: string;

  @ApiProperty({
    example: true,
    description: 'Araç aktif mi?',
  })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({
    example: 'Filoya yeni katıldı',
    description: 'Araç ile ilgili açıklama (opsiyonel)',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
