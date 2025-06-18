import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FuelDTO {
  @ApiProperty({ example: '666abc123def4567890fedcba', description: 'Yakıt kaydının ID’si' })
  id: string;

  @ApiProperty({ example: 1500.5, description: 'Toplam yakıt tutarı' })
  totalPrice: number;

  @ApiProperty({ example: 'diesel', description: 'Yakıt türü (örnek: diesel, gasoline, lpg)' })
  fuelType: string;

  @ApiProperty({ example: 'INV-2025-001', description: 'Fatura numarası' })
  invoiceNo: string;

  @ApiPropertyOptional({ example: 'Uzun yol dolumu', description: 'Yakıtla ilgili açıklama' })
  description?: string;

  @ApiProperty({ example: '2025-06-18T10:00:00.000Z', description: 'İşlem tarihi' })
  operationDate: string;

  @ApiProperty({ example: '665fab123abc1234567890ef', description: 'Sürücü ID’si' })
  driverId: string;

  @ApiProperty({ example: '665fab999carabc1234567890', description: 'Araç ID’si' })
  vehicleId: string;

  @ApiProperty({ example: '665fab321companyid987654321', description: 'Firma ID’si' })
  companyId: string;

  @ApiProperty({ example: '2025-06-18T12:34:56.000Z', description: 'Kayıt oluşturulma zamanı' })
  createdAt: string;

  @ApiProperty({ example: '2025-06-19T08:15:00.000Z', description: 'Son güncelleme zamanı' })
  updatedAt: string;
}
