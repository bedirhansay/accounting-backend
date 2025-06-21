import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { CustomerDto } from '../../customers/dto/customer.dto';

export class PaymentDto {
  @ApiProperty({ example: '64f5f1a134abc3f1c2d8b234', description: 'Ödemenin ID değeri' })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  id: string;

  @ApiProperty({
    description: 'Ödeme yapılan müşteri bilgisi',
    type: () => CustomerDto,
  })
  customer: Partial<CustomerDto>; // sadece name gibi alanlar dönecekse

  @ApiProperty({ example: 1000, description: 'Ödeme miktarı (₺)' })
  amount: number;

  @ApiProperty({ example: '2024-06-01T12:00:00.000Z', description: 'Ödeme işlem tarihi' })
  operationDate: string;

  @ApiProperty({ example: 'Nakit ödeme', description: 'Açıklama' })
  description: string;

  @ApiProperty({ example: '2024-06-01T12:30:00.000Z', description: 'Kayıt oluşturulma tarihi' })
  createdAt: string;

  @ApiProperty({ example: '2024-06-01T12:35:00.000Z', description: 'Kayıt güncellenme tarihi' })
  updatedAt: string;
}
