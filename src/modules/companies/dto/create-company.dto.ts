import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Şirketin adı',
    example: 'Torunoglu A.Ş.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Şirketin adresi',
    example: 'İstanbul, Türkiye',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Şirketin telefon numarası',
    example: '+90 555 55 67',
  })
  @IsPhoneNumber('TR')
  phone: string;

  @ApiProperty({
    description: 'Şirketin e-posta adresi',
    example: 'info@gmail.com',
  })
  @IsEmail()
  email: string;
}
