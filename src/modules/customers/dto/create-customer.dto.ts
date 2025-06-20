import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Müşterinin adı',
    example: 'Ahmet Yılmaz',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+90 212 123 45 67' })
  @ApiPropertyOptional({
    description: 'Müşterinin telefon numarası',
    example: '+90 532 123 45 67',
  })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Müşteri hakkında açıklama',
    example: 'Düzenli alışveriş yapan müşteri',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
