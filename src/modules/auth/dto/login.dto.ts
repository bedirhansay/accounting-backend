import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsObject, IsString, MinLength } from 'class-validator';
export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Kullanıcının e-posta adresi veya kullanıcı adı',
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'Kullanıcının şifresi (en az 6 karakter)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class UserResponseDto {
  @ApiProperty({ example: '665b776f58e4d5be07e7e8c4', description: 'Kullanıcının ID bilgisi' })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString(), { toClassOnly: true })
  id: string;

  @ApiProperty({ example: 'bedirhan', description: 'Kullanıcı adı' })
  @Expose()
  username: string;

  @ApiProperty({ example: 'user@example.com', description: 'E-posta adresi' })
  @Expose()
  email: string;

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z', description: 'Oluşturulma tarihi' })
  @Expose()
  createdAt: string;

  @ApiProperty({ example: '2024-01-01T12:05:00.000Z', description: 'Güncellenme tarihi' })
  @Expose()
  updatedAt: string;
}

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT token',
  })
  @IsString()
  token: string;

  @ApiProperty({ type: UserResponseDto })
  @IsObject()
  user: UserResponseDto;
}
