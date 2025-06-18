import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CategoryType } from './category.dto';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Kategori adı',
    example: 'Elektrik Gideri',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Kategoriye ait açıklama',
    example: 'Aylık düzenli elektrik faturaları',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Kategori tipi (income = gelir, expense = gider)',
    enum: CategoryType,
    example: CategoryType.EXPENSE,
  })
  @IsEnum(CategoryType)
  type: CategoryType;
}
