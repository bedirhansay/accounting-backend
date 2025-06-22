import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { BaseDto } from '../../../common/DTO/base/base.dto';

@Exclude()
export class CustomerDto extends BaseDto {
  @ApiProperty({ example: 'Ahmet Yılmaz', description: 'Müşteri adı' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ example: 'Düzenli müşteri', description: 'Açıklama (isteğe bağlı)' })
  @Expose()
  description?: string;

  @ApiPropertyOptional({ example: '+90 532 000 00 00', description: 'Telefon numarası' })
  @Expose()
  phone?: string;
}
