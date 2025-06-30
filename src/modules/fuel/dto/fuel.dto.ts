import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, plainToInstance, Transform } from 'class-transformer';
import { BaseDto } from '../../../common/DTO/base/base.dto';
import { VehicleDto } from '../../vehicles/dto/vehicle.dto';

@Exclude()
export class FuelDto extends BaseDto {
  @ApiProperty({
    example: 1500.5,
    description: 'Toplam yakıt tutarı (₺)',
    type: 'number',
    format: 'float',
  })
  @Expose()
  totalPrice: number;

  @ApiProperty({
    example: 'INV-2025-001',
    description: 'Fatura numarası',
    maxLength: 50,
  })
  @Expose()
  invoiceNo: string;

  @ApiPropertyOptional({
    example: 'Uzun yol dolumu',
    description: 'Yakıtla ilgili açıklama',
    maxLength: 500,
  })
  @Expose()
  description?: string;

  @ApiProperty({
    example: '2025-06-18T10:00:00.000Z',
    description: 'İşlem tarihi (ISO 8601 formatı)',
    type: 'string',
    format: 'date-time',
  })
  @Expose()
  operationDate: string;

  @ApiProperty({
    example: 'Ali Yılmaz',
    description: 'Sürücü adı',
    maxLength: 100,
  })
  @Expose()
  driverName: string;

  @ApiProperty({
    example: { id: '665f1c48fbb89c0012345679', plateNumber: '34ABC123' },
    description: 'Araç bilgisi (populated)',
    type: () => VehicleDto,
  })
  @Expose()
  @Transform(
    ({ obj }) => {
      if (obj.vehicleId && typeof obj.vehicleId === 'object') {
        return plainToInstance(VehicleDto, obj.vehicleId, { excludeExtraneousValues: true });
      }
      return null;
    },
    {
      toClassOnly: true,
    }
  )
  vehicleInfo: Pick<VehicleDto, 'id' | 'plateNumber'> | null;
}
