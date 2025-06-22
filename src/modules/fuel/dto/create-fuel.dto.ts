import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFuelDto {
  @ApiProperty({
    example: 1250.75,
    description: 'Toplam yakıt tutarı',
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  totalPrice: number;

  @ApiProperty({
    example: 'INV-20240619-001',
    description: 'Fatura numarası',
  })
  @IsString()
  @IsNotEmpty()
  invoiceNo: string;

  @ApiPropertyOptional({
    example: 'Uzun yol dolumu',
    description: 'İsteğe bağlı açıklama',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '2024-06-19T08:30:00.000Z',
    description: 'Yakıt işleminin tarihi (ISO 8601 formatında)',
  })
  @IsNotEmpty()
  @IsDateString()
  operationDate: string;

  @ApiProperty({
    example: '665f1c48fbb89c0012345678',
    description: 'Sürücü ID bilgisi',
  })
  @IsString()
  @IsNotEmpty()
  driverName: string;

  @ApiProperty({
    example: '665f1c48fbb89c0012345679',
    description: 'Araç ID bilgisi',
  })
  @IsString()
  @IsNotEmpty()
  vehicleId: string;
}
