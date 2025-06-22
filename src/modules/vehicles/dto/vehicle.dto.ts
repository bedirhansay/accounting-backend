import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { BaseDto } from '../../../common/DTO/base/base.dto';
import { EmployeeDto } from '../../emplooye/dto/employee.dto';

@Exclude()
export class VehicleDto extends BaseDto {
  @ApiProperty({ example: 'TR34ABC123', description: 'Plaka numarası' })
  @Expose()
  plateNumber: string;

  @ApiProperty({ example: 'Ford', description: 'Araç markası' })
  @Expose()
  brand: string;

  @ApiProperty({ example: 'Focus', description: 'Araç modeli' })
  @Expose()
  model: string;

  @ApiPropertyOptional({ example: '2025-06-01T00:00:00.000Z', description: 'Muayene tarihi' })
  @Expose()
  inspectionDate?: string;

  @ApiPropertyOptional({ example: '2025-07-01T00:00:00.000Z', description: 'Sigorta bitiş tarihi' })
  @Expose()
  insuranceDate?: string;

  @ApiProperty({ example: true, description: 'Araç aktif mi?' })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({ example: 'Servis aracı', description: 'Açıklama' })
  @Expose()
  description?: string;

  @ApiPropertyOptional({ description: 'Sürücü bilgisi (sadece id ve adı)', type: () => EmployeeDto })
  @Expose()
  @Type(() => EmployeeDto)
  driverId?: Pick<EmployeeDto, 'id' | 'fullName'>;

  // @Expose()
  // get driverFull(): string | undefined {
  //   return this.driverId?.fullName;
  // }
}
