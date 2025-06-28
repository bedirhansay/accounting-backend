import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, plainToInstance, Transform } from 'class-transformer';
import { BaseDto } from '../../../common/DTO/base/base.dto';
import { VehicleDto } from '../../vehicles/dto/vehicle.dto';

@Exclude()
export class FuelDto extends BaseDto {
  @ApiProperty({ example: 1500.5, description: 'Toplam yakıt tutarı' })
  @Expose()
  totalPrice: number;

  @ApiProperty({ example: 'INV-2025-001', description: 'Fatura numarası' })
  @Expose()
  invoiceNo: string;

  @ApiPropertyOptional({ example: 'Uzun yol dolumu', description: 'Yakıtla ilgili açıklama' })
  @Expose()
  description?: string;

  @ApiProperty({ example: '2025-06-18T10:00:00.000Z', description: 'İşlem tarihi' })
  @Expose()
  operationDate: string;

  @ApiProperty({
    example: 'Ali Yılmaz',
    description: 'Sürücü bilgisi (yalnızca adı)',
  })
  @Expose()
  driverName: string;

  // 🔽 EKLENEN: Araç ID'si doğrudan
  @ApiProperty({
    example: '685f885900a8e455d29ce422',
    description: 'Araç ID bilgisi',
  })
  @Expose()
  vehicleId: string;

  @ApiProperty({
    example: { id: '...', plateNumber: '34ABC123' },
    description: 'Araç bilgisi (populated)',
    type: () => VehicleDto,
  })
  @Expose()
  @Transform(({ obj }) => plainToInstance(VehicleDto, obj.vehicleId, { excludeExtraneousValues: true }), {
    toClassOnly: true,
  })
  vehicleInfo: Pick<VehicleDto, 'id' | 'plateNumber'>;
}
