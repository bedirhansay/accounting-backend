export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryDto {
  @ApiProperty({ example: '64f5f1a134abc3f1c2d8b234' })
  id: string;

  @ApiProperty({ example: 'Gelir - Satış' })
  name: string;

  @ApiPropertyOptional({ example: 'Ürün satışlarından elde edilen gelir' })
  description?: string;

  @ApiProperty({ enum: CategoryType, example: CategoryType.INCOME })
  type: CategoryType;

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-01T12:05:00.000Z' })
  updatedAt: string;
}
