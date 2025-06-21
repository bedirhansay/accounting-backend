import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class FuelDTO {
  @ApiProperty({ example: '666abc123def4567890fedcba', description: 'Yakıt kaydının ID’si' })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  id: string;

  @ApiProperty({ example: 1500.5, description: 'Toplam yakıt tutarı' })
  totalPrice: number;

  @ApiProperty({ example: 'INV-2025-001', description: 'Fatura numarası' })
  invoiceNo: string;

  @ApiPropertyOptional({ example: 'Uzun yol dolumu', description: 'Yakıtla ilgili açıklama' })
  description?: string;

  @ApiProperty({ example: '2025-06-18T10:00:00.000Z', description: 'İşlem tarihi' })
  operationDate: string;

  @ApiProperty({
    example: { fullName: 'Ali Yılmaz' },
    description: 'Sürücü bilgisi (yalnızca adı)',
  })
  driverId: Partial<{ fullName: string }>;

  @ApiProperty({
    example: { plateNumber: '34ABC123' },
    description: 'Araç bilgisi (yalnızca plaka)',
  })
  vehicleId: Partial<{ plateNumber: string }>;

  @ApiProperty({ example: '665fab321companyid987654321', description: 'Firma ID’si' })
  companyId: string;

  @ApiProperty({ example: '2025-06-18T12:34:56.000Z', description: 'Kayıt oluşturulma zamanı' })
  createdAt: string;

  @ApiProperty({ example: '2025-06-19T08:15:00.000Z', description: 'Son güncelleme zamanı' })
  updatedAt: string;
}
