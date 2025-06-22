import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { BaseDto } from '../../../common/DTO/base/base.dto';
import { CategoryDto } from '../../categories/dto/category.dto';

export class ExpenseDto extends BaseDto {
  @ApiProperty({ example: '2025-06-18T12:00:00.000Z', description: 'İşlem tarihi' })
  @Expose()
  operationDate: string;

  @ApiProperty({ description: 'Kategori bilgisi' })
  @Type(() => CategoryDto)
  @Expose()
  category: Pick<CategoryDto, 'name'>;

  @ApiProperty({ example: 1500.75, description: 'Gider miktarı' })
  @Expose()
  amount: number;

  @ApiProperty({ example: 'Fatura ödemesi', description: 'Açıklama' })
  @Expose()
  description: string;

  @ApiPropertyOptional({ example: '664eab32123e1a0001bb1234', description: 'İlgili belge ya da nesne ID’si' })
  @Expose()
  relatedToId?: string;

  @IsEnum(['Vehicle', 'Employee', 'Other'])
  @ApiProperty({ enum: ['Vehicle', 'Employee', 'Other'] })
  @Expose()
  relatedModel: 'Vehicle' | 'Employee' | 'Other';

  @Expose()
  @ApiPropertyOptional({
    example: { plateNumber: '34ABC123', fullName: 'Ahmet Yılmaz' },
    description: 'İlgili belge nesnesinin populated hali',
  })
  get relatedTo(): { plateNumber?: string; fullName?: string } | null {
    const related = this['relatedToId'];
    if (!related) return null;

    return {
      plateNumber: this.relatedTo?.plateNumber,
      fullName: this.relatedTo?.fullName,
    };
  }

  @Expose()
  get categoryName(): string | undefined {
    return this.category?.name;
  }
}
