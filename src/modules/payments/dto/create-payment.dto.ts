import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsMongoId, IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    example: '665f1c48fbb89c0012345678',
    description: 'Ödeme yapılan müşterinin ID’si',
  })
  @IsMongoId()
  customerId: string;

  @ApiProperty({
    example: 1500.5,
    description: 'Ödeme miktarı (₺)',
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: '2025-06-20T10:30:00.000Z',
    description: 'İşlem tarihi (ISO 8601 formatında)',
  })
  @IsDateString()
  operationDate: string;

  @ApiProperty({
    example: 'Nakit ödeme',
    description: 'Ödeme açıklaması',
  })
  @IsString()
  description: string;
}
