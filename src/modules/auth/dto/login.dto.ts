import { IsEmail, IsObject, IsString, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Kullanıcının e-posta adresi',
  })
  @IsEmail()
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'Kullanıcının şifresi (en az 6 karakter)',
    minLength: 6,
  })
  @MinLength(6)
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT token',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Kullanıcı bilgileri',
    example: {
      id: '123',
      name: 'John Doe',
      email: 'user@example.com',
    },
  })
  @IsObject()
  user: {
    id: string;
    name: string;
    email: string;
  };
}
