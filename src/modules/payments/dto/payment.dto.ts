import { ApiProperty } from '@nestjs/swagger';

export class PaymentDto {
  @ApiProperty({ example: '64f5f1a134abc3f1c2d8b234', description: 'Ödemenin ID değeri' })
  id: string;

  @ApiProperty({ example: '64f5f1a134abc3f1c2d8b200', description: 'Müşteri ID değeri' })
  customerId: string;

  @ApiProperty({ example: 1000, description: 'Ödeme miktarı (₺)' })
  amount: number;

  @ApiProperty({ example: '2024-06-01T12:00:00.000Z', description: 'Ödeme işlem tarihi' })
  operationDate: string;

  @ApiProperty({ example: 'Nakit ödeme', description: 'Açıklama' })
  description: string;

  @ApiProperty({ example: '2024-06-01T12:30:00.000Z', description: 'Kayıt oluşturulma tarihi' })
  createdAt: string;

  @ApiProperty({ example: '2024-06-01T12:35:00.000Z', description: 'Kayıt güncellenme tarihi' })
  updatedAt: string;
}
