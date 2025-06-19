import { ApiProperty } from '@nestjs/swagger';

export class VehicleDto {
  @ApiProperty({ example: '665b776f58e4d5be07e7e8c4', description: 'Araç ID' })
  id: string;

  @ApiProperty({ example: 'TR34ABC123', description: 'Plaka numarası' })
  plateNumber: string;

  @ApiProperty({ example: 'Ford', description: 'Araç markası' })
  brand: string;

  @ApiProperty({ example: '2025-06-01T00:00:00.000Z', description: 'Muayene tarihi' })
  inspectionDate: string;

  @ApiProperty({ example: '2025-07-01T00:00:00.000Z', description: 'Sigorta bitiş tarihi' })
  insuranceDate: string;

  @ApiProperty({ example: true, description: 'Araç aktif mi?' })
  isActive: boolean;

  @ApiProperty({ example: 'Servis aracı', required: false, description: 'Açıklama' })
  description?: string;

  @ApiProperty({ example: '2025-06-18T12:00:00.000Z', description: 'Oluşturulma tarihi' })
  createdAt: Date;

  @ApiProperty({ example: '2025-06-18T12:00:00.000Z', description: 'Güncellenme tarihi' })
  updatedAt: Date;

  @ApiProperty({ example: '662ff3f108dc5e1b3472cd9e', description: 'Sürücü ID' })
  driverId: string;

  @ApiProperty({ example: '665a1234bcf8f47e4b76cdef', description: 'Firma ID' })
  companyId: string;
}
