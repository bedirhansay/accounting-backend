import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Şirketin adı',
    example: 'Torunoglu A.Ş.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Şirketin telefon numarası',
    example: '+90 555 55 67',
  })
  @ApiProperty({
    description: 'Şirketin adresi',
    example: 'İstanbul, Türkiye',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
