import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { EmployeeDto } from '../../emplooye/dto/employee.dto';

export class VehicleDto {
  @ApiProperty({ example: '665b776f58e4d5be07e7e8c4', description: 'Araç ID' })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  id: string;

  @ApiProperty({ example: 'TR34ABC123', description: 'Plaka numarası' })
  plateNumber: string;

  @ApiProperty({ example: 'Ford', description: 'Araç markası' })
  brand: string;

  @ApiProperty({ example: 'Focus', description: 'Araç modeli' })
  model: string;

  @ApiProperty({ example: '2025-06-01T00:00:00.000Z', description: 'Muayene tarihi' })
  inspectionDate?: string;

  @ApiProperty({ example: '2025-07-01T00:00:00.000Z', description: 'Sigorta bitiş tarihi' })
  insuranceDate?: string;

  @ApiProperty({ example: true, description: 'Araç aktif mi?' })
  isActive: boolean;

  @ApiPropertyOptional({ example: 'Servis aracı', description: 'Açıklama' })
  description?: string;

  @ApiProperty({ example: '2025-06-18T12:00:00.000Z', description: 'Oluşturulma tarihi' })
  createdAt: Date;

  @ApiProperty({ example: '2025-06-18T12:00:00.000Z', description: 'Güncellenme tarihi' })
  updatedAt: Date;

  @ApiProperty({ description: 'Sürücü bilgisi (populate edilmiş)' })
  driverId: Partial<EmployeeDto>;

  @ApiProperty({ example: '665a1234bcf8f47e4b76cdef', description: 'Firma ID' })
  companyId: string;
}
