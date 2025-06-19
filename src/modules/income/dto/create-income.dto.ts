import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateIncomeDto {
  @ApiProperty({
    example: '664cbea1a2170a5c9ef7b412',
    description: "Gelirin bağlı olduğu müşteri ID'si",
  })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({
    example: '664cbea1a2170a5c9ef7b413',
    description: "Gelir kategorisinin ID'si",
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    example: 10,
    description: 'Ürün/hizmet adedi',
  })
  @IsNumber()
  unitCount: number;

  @ApiProperty({
    example: 150.75,
    description: 'Birim fiyatı (₺)',
  })
  @IsNumber()
  unitPrice: number;

  @ApiProperty({
    example: 1507.5,
    description: 'Toplam gelir tutarı (₺)',
  })
  @IsNumber()
  totalAmount: number;

  @ApiPropertyOptional({
    example: 'Nakit tahsilat',
    description: 'İsteğe bağlı açıklama',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '2024-06-15T12:00:00.000Z',
    description: 'Gelir işlem tarihi',
  })
  @IsDateString()
  operationDate: string;
}
