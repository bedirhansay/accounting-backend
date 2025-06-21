import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class CustomerDto {
  @ApiProperty({ example: '64f5f1a134abc3f1c2d8b234' })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  id: string;

  @ApiProperty({ example: 'Ahmet Yılmaz' })
  name: string;

  @ApiProperty({ example: 'Düzenli müşteri' })
  description?: string;

  @ApiProperty({ example: 'Telefon Numarası' })
  phone?: string;

  @ApiProperty({ example: 'Bağlı olduğu Firma' })
  companyId: string;

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-02T15:45:00.000Z' })
  updatedAt?: string;
}
