import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'Çalışanın tam adı',
    example: 'Ahmet Yılmaz',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Çalışan adı metin olmalıdır' })
  @IsNotEmpty({ message: 'Çalışan adı boş olamaz' })
  @Length(2, 100, { message: 'Çalışan adı 2-100 karakter arası olmalıdır' })
  fullName: string;

  @ApiPropertyOptional({
    description: 'Telefon numarası',
    example: '+90 532 123 45 67',
  })
  @IsString({ message: 'Telefon numarası metin olmalıdır' })
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Departman adı',
    example: 'İnsan Kaynakları',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Departman adı metin olmalıdır' })
  @IsNotEmpty({ message: 'Departman adı boş olamaz' })
  @Length(2, 50, { message: 'Departman adı 2-50 karakter arası olmalıdır' })
  departmentName: string;

  @ApiPropertyOptional({
    description: 'İşe giriş tarihi',
    type: String,
    format: 'date-time',
    example: '2025-01-15T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate({ message: 'Geçerli bir işe giriş tarihi giriniz' })
  @IsOptional()
  hireDate?: Date;

  @ApiPropertyOptional({
    description: 'İşten çıkış tarihi',
    type: String,
    format: 'date-time',
    nullable: true,
    example: '2025-12-31T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate({ message: 'Geçerli bir işten çıkış tarihi giriniz' })
  @IsOptional()
  terminationDate?: Date;

  @ApiPropertyOptional({
    description: 'Maaş',
    example: 15000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Maaş sayı olmalıdır' })
  @Min(0, { message: "Maaş 0'dan küçük olamaz" })
  @IsOptional()
  salary?: number;

  @ApiProperty({
    description: 'Çalışan aktif mi?',
    example: true,
    default: true,
  })
  @IsBoolean({ message: 'Aktiflik durumu true veya false olmalıdır' })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Açıklama',
    example: 'Deneyimli çalışan',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Açıklama metin olmalıdır' })
  @Length(0, 500, { message: 'Açıklama en fazla 500 karakter olabilir' })
  description?: string;
}
