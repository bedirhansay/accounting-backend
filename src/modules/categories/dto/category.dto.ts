export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Exclude, Expose } from 'class-transformer';
import { BaseDto } from '../../../common/DTO/base/base.dto';

@Exclude()
export class CategoryDto extends BaseDto {
  @ApiProperty({ example: 'Gelir - Satış', description: 'Kategori adı' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ example: 'Ürün satışlarından elde edilen gelir', description: 'Açıklama (isteğe bağlı)' })
  @Expose()
  description?: string;

  @ApiProperty({ enum: CategoryType, example: CategoryType.INCOME, description: 'Gelir veya gider tipi' })
  @Expose()
  type: CategoryType;

  @ApiProperty({ example: true, description: 'Kategori aktif mi?' })
  @Expose()
  isActive?: boolean;
}
