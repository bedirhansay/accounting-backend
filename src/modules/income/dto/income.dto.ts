import { ApiProperty } from '@nestjs/swagger';

export class IncomeDto {
  @ApiProperty({ example: '665f1c48fbb89c0012345678', description: 'Gelirin ID bilgisi' })
  id: string;

  @ApiProperty({ example: '665f1c48fbb89c0011223344', description: 'Müşteri ID bilgisi' })
  customerId: string;

  @ApiProperty({ example: '665f1c48fbb89c0099887766', description: 'Kategori ID bilgisi' })
  categoryId: string;

  @ApiProperty({ example: 5, description: 'Birim sayısı' })
  unitCount: number;

  @ApiProperty({ example: 120.5, description: 'Birim fiyatı' })
  unitPrice: number;

  @ApiProperty({ example: 602.5, description: 'Toplam tutar' })
  totalAmount: number;

  @ApiProperty({ example: 'Açıklama örneği', required: false })
  description?: string;

  @ApiProperty({ example: '2024-06-18T08:30:00.000Z', description: 'İşlem tarihi (ISO format)' })
  operationDate: string;

  @ApiProperty({ example: '665f1c48fbb89c0011aa22bb', description: 'Şirket ID bilgisi' })
  companyId: string;

  @ApiProperty({ example: '2024-06-18T09:00:00.000Z', description: 'Oluşturulma tarihi' })
  createdAt: Date;

  @ApiProperty({ example: '2024-06-18T09:05:00.000Z', description: 'Güncellenme tarihi' })
  updatedAt: Date;
}
