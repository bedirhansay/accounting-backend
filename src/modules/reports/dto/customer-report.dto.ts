import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CustomerIncomeSummaryDto {
  @ApiProperty({
    example: '654e1f4b2c8a9b123456789a',
    description: 'Müşteri ID (MongoDB ObjectId)',
  })
  @Expose()
  customerId: string;

  @ApiProperty({
    example: 120000.75,
    description: 'Toplam faturalandırılan tutar (₺)',
    type: 'number',
    format: 'float',
  })
  @Expose()
  totalInvoiced: number;

  @ApiProperty({
    example: 90000.5,
    description: 'Toplam ödenen tutar (₺)',
    type: 'number',
    format: 'float',
  })
  @Expose()
  totalPaid: number;

  @ApiProperty({
    example: 30000.25,
    description: 'Kalan alacak tutarı (₺)',
    type: 'number',
    format: 'float',
  })
  @Expose()
  remainingReceivable: number;

  @ApiProperty({
    example: 45,
    description: 'Toplam işlem sayısı',
    type: 'integer',
  })
  @Expose()
  totalCount: number;
}
