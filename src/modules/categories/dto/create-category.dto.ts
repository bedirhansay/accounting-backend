import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
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

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Kategori tipi (income = gelir, expense = gider)',
    enum: CategoryType,
    example: CategoryType.EXPENSE,
  })
  @IsEnum(CategoryType)
  type: CategoryType;
}
