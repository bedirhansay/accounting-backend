import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, plainToInstance, Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';
import { BaseDto } from '../../../common/DTO/base/base.dto';
import { CategoryDto } from '../../categories/dto/category.dto';
import { CustomerDto } from '../../customers/dto/customer.dto';

@Exclude()
export class IncomeDto extends BaseDto {
  @ApiProperty({ example: 5, description: 'Hizmet/ürün adedi' })
  @Expose()
  unitCount: number;

  @ApiProperty({ example: 120.5, description: 'Birim başına fiyat (₺)' })
  @Expose()
  unitPrice: number;

  @ApiProperty({ example: 602.5, description: 'Toplam tutar (₺)' })
  @Expose()
  totalAmount: number;

  @ApiPropertyOptional({ example: 'Haziran ayı danışmanlık hizmeti', description: 'İsteğe bağlı açıklama' })
  @Expose()
  description?: string;

  @ApiProperty({ example: '2024-06-18T08:30:00.000Z', description: 'İşlem tarihi' })
  @Expose()
  operationDate: string;

  @ApiPropertyOptional({ example: true, description: 'Gelir tahsil edildi mi?' })
  @IsBoolean()
  @Expose()
  isPaid: boolean;

  @ApiProperty({ description: 'Müşteri bilgileri (populated)', type: () => CustomerDto })
  @Expose()
  @Transform(({ obj }) => plainToInstance(CustomerDto, obj.customerId, { excludeExtraneousValues: true }), {
    toClassOnly: true,
  })
  customer: Pick<CustomerDto, 'id' | 'name'>;

  @ApiProperty({ description: 'Kategori bilgileri (populated)', type: () => CategoryDto })
  @Expose()
  @Transform(({ obj }) => plainToInstance(CategoryDto, obj.categoryId, { excludeExtraneousValues: true }), {
    toClassOnly: true,
  })
  category: Pick<CategoryDto, 'id' | 'name'>;
}
