import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Müşterinin adı',
    example: 'Ahmet Yılmaz',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Müşteri adı metin olmalıdır' })
  @IsNotEmpty({ message: 'Müşteri adı boş olamaz' })
  @Length(2, 100, { message: 'Müşteri adı 2-100 karakter arası olmalıdır' })
  name: string;

  @ApiPropertyOptional({
    description: 'Müşterinin telefon numarası',
    example: '+90 532 123 45 67',
    pattern: '^\\+90\\s5\\d{2}\\s\\d{3}\\s\\d{2}\\s\\d{2}$',
  })
  @IsOptional()
  @IsString({ message: 'Telefon numarası metin olmalıdır' })
  @Matches(/^\+90\s5\d{2}\s\d{3}\s\d{2}\s\d{2}$/, {
    message: 'Telefon numarası +90 5XX XXX XX XX formatında olmalıdır',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Müşteri hakkında açıklama',
    example: 'Düzenli alışveriş yapan müşteri',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Açıklama metin olmalıdır' })
  @Length(0, 500, { message: 'Açıklama en fazla 500 karakter olabilir' })
  description?: string;
}
