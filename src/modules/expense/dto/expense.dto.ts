import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, plainToInstance, Transform } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { BaseDto } from '../../../common/DTO/base/base.dto';
import { CategoryDto } from '../../categories/dto/category.dto';

export enum RelatedModelEnum {
  Vehicle = 'Vehicle',
  Employee = 'Employee',
  Other = 'Other',
}

@Exclude()
export class ExpenseDto extends BaseDto {
  @Expose()
  @ApiProperty({ example: '2025-06-27T00:00:00.000Z', description: 'İşlem tarihi' })
  @Transform(({ value }) => new Date(value), { toClassOnly: true })
  operationDate: Date;

  @Expose()
  @ApiProperty({ example: 1500.75, description: 'Gider miktarı' })
  amount: number;

  @ApiProperty({ example: 'Fatura ödemesi', description: 'Açıklama' })
  @Expose()
  description: string;

  @ApiProperty({ description: 'Kategori bilgileri (populated)', type: () => CategoryDto })
  @Expose()
  @Transform(({ obj }) => plainToInstance(CategoryDto, obj.categoryId, { excludeExtraneousValues: true }), {
    toClassOnly: true,
  })
  category: Pick<CategoryDto, 'id' | 'name'>;

  @ApiPropertyOptional({ example: '664eab32123e1a0001bb1234', description: 'İlgili belge ya da nesne ID’si' })
  @Expose()
  relatedToId?: string;

  @IsEnum(RelatedModelEnum)
  @ApiProperty({ enum: RelatedModelEnum })
  @Expose()
  relatedModel: RelatedModelEnum;

  @ApiPropertyOptional({
    example: { plateNumber: '34ABC123', fullName: 'Ahmet Yılmaz' },
    description: 'İlgili belge nesnesinin populated hali (araç ya da personel)',
  })
  @Expose()
  relatedTo?: {
    plateNumber?: string;
    fullName?: string;
  };
}
