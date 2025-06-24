import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'bedirhansay',
    description: 'Kullanıcının kullanıcı adı',
  })
  @IsString()
  @MinLength(3, { message: 'Kullanıcı adı en az 3 karakter olmalıdır' })
  username: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Kullanıcının e-posta adresi',
  })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi girilmelidir' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Kullanıcının şifresi (en az 6 karakter)',
  })
  @IsString()
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  password: string;
}
