import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({
    example: '2024-01-01',
    description: 'Giderin gerçekleştiği tarih',
    format: 'date',
  })
  @IsDateString({}, { message: 'Geçerli bir tarih giriniz (YYYY-MM-DD formatında)' })
  @IsNotEmpty({ message: 'İşlem tarihi boş olamaz' })
  operationDate: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Gider kategori ID (MongoDB ObjectId)',
  })
  @IsString({ message: 'Kategori ID metin olmalıdır' })
  @IsNotEmpty({ message: 'Kategori ID boş olamaz' })
  @IsMongoId({ message: 'Geçerli bir kategori ID giriniz' })
  categoryId: string;

  @ApiProperty({
    example: 1500,
    description: 'Tutar (₺)',
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'Tutar sayı olmalıdır' })
  @Min(0.01, { message: "Tutar 0'dan büyük olmalıdır" })
  amount: number;

  @ApiPropertyOptional({
    example: 'İstanbul içi yakıt harcaması',
    description: 'Gider açıklaması',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Açıklama metin olmalıdır' })
  @Length(0, 500, { message: 'Açıklama en fazla 500 karakter olabilir' })
  description?: string;

  @ApiPropertyOptional({
    example: '664d5e27b3349e001edac7f8',
    description: 'İlgili kayıt ID (Araç veya Personel ID) - Opsiyonel',
  })
  @IsOptional()
  @IsString({ message: 'İlgili kayıt ID metin olmalıdır' })
  @IsMongoId({ message: 'Geçerli bir kayıt ID giriniz' })
  relatedToId?: string;

  @ApiPropertyOptional({
    enum: ['Vehicle', 'Employee', 'Other'],
    description: 'İlgili model tipi - relatedToId verildiğinde zorunlu',
    example: 'Vehicle',
  })
  @IsOptional()
  @IsEnum(['Vehicle', 'Employee', 'Other'], {
    message: 'İlgili model tipi Vehicle veya Employee olmalıdır',
  })
  relatedModel?: 'Vehicle' | 'Employee' | 'Other';
}
