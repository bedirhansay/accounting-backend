import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsMongoId, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({
    example: '34ABC123',
    description: 'Araç plakası',
    pattern: '^[0-9]{2}[A-Z]{1,3}[0-9]{1,4}$',
  })
  @IsString({ message: 'Plaka numarası metin olmalıdır' })
  @IsNotEmpty({ message: 'Plaka numarası boş olamaz' })
  @Matches(/^[0-9]{2}[A-Z]{1,3}[0-9]{1,4}$/, {
    message: 'Plaka numarası 34ABC123 formatında olmalıdır',
  })
  plateNumber: string;

  @ApiProperty({
    example: 'Ford',
    description: 'Araç markası',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Araç markası metin olmalıdır' })
  @IsNotEmpty({ message: 'Araç markası boş olamaz' })
  @Length(2, 50, { message: 'Araç markası 2-50 karakter arası olmalıdır' })
  brand: string;

  @ApiProperty({
    example: 'Focus',
    description: 'Araç modeli',
    minLength: 1,
    maxLength: 50,
  })
  @IsString({ message: 'Araç modeli metin olmalıdır' })
  @IsNotEmpty({ message: 'Araç modeli boş olamaz' })
  @Length(1, 50, { message: 'Araç modeli 1-50 karakter arası olmalıdır' })
  model: string;

  @ApiPropertyOptional({
    description: 'Muayene Tarihi',
    type: String,
    format: 'date-time',
    example: '2025-06-30T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate({ message: 'Geçerli bir muayene tarihi giriniz' })
  @IsOptional()
  inspectionDate?: string;

  @ApiPropertyOptional({
    description: 'Sigorta Tarihi',
    type: String,
    format: 'date-time',
    example: '2025-12-31T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate({ message: 'Geçerli bir sigorta tarihi giriniz' })
  @IsOptional()
  insuranceDate?: string;

  @ApiProperty({
    example: '664e9d66e2a4d9c2d78e8c8f',
    description: 'Sürücü ID (ObjectId)',
  })
  @IsString({ message: 'Sürücü ID metin olmalıdır' })
  @IsNotEmpty({ message: 'Sürücü ID boş olamaz' })
  @IsMongoId({ message: 'Geçerli bir sürücü ID giriniz' })
  driverId: string;

  @ApiProperty({
    example: true,
    description: 'Araç aktif mi?',
    default: true,
  })
  @IsBoolean({ message: 'Aktiflik durumu true veya false olmalıdır' })
  isActive: boolean;

  @ApiPropertyOptional({
    example: 'Filoya yeni katıldı',
    description: 'Araç ile ilgili açıklama (opsiyonel)',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Açıklama metin olmalıdır' })
  @Length(0, 500, { message: 'Açıklama en fazla 500 karakter olabilir' })
  description?: string;
}
