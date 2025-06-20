import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryDto } from '../../categories/dto/category.dto';
import { CustomerDto } from '../../customers/dto/customer.dto';

export class IncomeDto {
  @ApiProperty({
    example: '665f1c48fbb89c0012345678',
    description: 'Gelir kaydının benzersiz ID bilgisi',
  })
  id: string;

  @ApiProperty({
    description: 'Müşteri bilgileri (populated)',
    type: () => CustomerDto,
  })
  customerId: Partial<CustomerDto>;

  @ApiProperty({
    description: 'Kategori bilgileri (populated)',
    type: () => CategoryDto,
  })
  categoryId: Partial<CategoryDto>;

  @ApiProperty({
    example: 5,
    description: 'Hizmet/ürün adedi',
  })
  unitCount: number;

  @ApiProperty({
    example: 120.5,
    description: 'Birim başına fiyat (₺)',
  })
  unitPrice: number;

  @ApiProperty({
    example: 602.5,
    description: 'Toplam tutar (₺)',
  })
  totalAmount: number;

  @ApiPropertyOptional({
    example: 'Haziran ayı danışmanlık hizmeti',
    description: 'İsteğe bağlı açıklama',
  })
  description?: string;

  @ApiProperty({
    example: '2024-06-18T08:30:00.000Z',
    description: 'İşlem tarihi (ISO 8601)',
  })
  operationDate: string;

  @ApiProperty({
    example: '665f1c48fbb89c0011aa22bb',
    description: 'Şirkete ait firma ID bilgisi',
  })
  companyId: string;

  @ApiProperty({
    example: '2024-06-18T09:00:00.000Z',
    description: 'Kayıt oluşturulma tarihi',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-06-18T09:05:00.000Z',
    description: 'Son güncellenme tarihi',
  })
  updatedAt: Date;
}
