import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateFuelDto {
  @ApiProperty({
    example: 1250.75,
    description: 'Toplam yakıt tutarı (₺)',
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Tutar geçerli bir sayı olmalıdır (en fazla 2 ondalık basamak)' })
  @IsNotEmpty({ message: 'Yakıt tutarı boş olamaz' })
  @Min(0.01, { message: "Yakıt tutarı 0.01 ₺'den küçük olamaz" })
  @Type(() => Number)
  totalPrice: number;

  @ApiProperty({
    example: 'INV-20240619-001',
    description: 'Fatura numarası',
    maxLength: 50,
  })
  @IsString({ message: 'Fatura numarası metin olmalıdır' })
  @IsNotEmpty({ message: 'Fatura numarası boş olamaz' })
  @MaxLength(50, { message: 'Fatura numarası en fazla 50 karakter olabilir' })
  invoiceNo: string;

  @ApiPropertyOptional({
    example: 'Uzun yol dolumu',
    description: 'İsteğe bağlı açıklama',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Açıklama metin olmalıdır' })
  @MaxLength(500, { message: 'Açıklama en fazla 500 karakter olabilir' })
  description?: string;

  @ApiProperty({
    example: '2024-06-19T08:30:00.000Z',
    description: 'Yakıt işleminin tarihi (ISO 8601 formatında)',
  })
  @IsNotEmpty({ message: 'İşlem tarihi boş olamaz' })
  @IsDateString({}, { message: 'İşlem tarihi geçerli bir ISO 8601 formatında olmalıdır' })
  operationDate: string;

  @ApiProperty({
    example: 'Ahmet Yılmaz',
    description: 'Sürücü adı',
    maxLength: 100,
  })
  @IsString({ message: 'Sürücü adı metin olmalıdır' })
  @IsNotEmpty({ message: 'Sürücü adı boş olamaz' })
  @MaxLength(100, { message: 'Sürücü adı en fazla 100 karakter olabilir' })
  driverName: string;

  @ApiProperty({
    example: '665f1c48fbb89c0012345679',
    description: 'Araç ID bilgisi (MongoDB ObjectId)',
  })
  @IsString({ message: 'Araç ID metin olmalıdır' })
  @IsNotEmpty({ message: 'Araç ID boş olamaz' })
  @IsMongoId({ message: 'Araç ID geçerli bir MongoDB ObjectId olmalıdır' })
  vehicleId: string;
}
