import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'johndoe', description: 'Kullanıcı adı' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'johndoe@example.com', description: 'Geçerli bir e-posta adresi' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePassword123', description: 'En az 6 karakterli bir şifre' })
  @IsString()
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  password: string;

  @ApiProperty({
    example: 'user',
    description: 'Kullanıcı rolü',
    default: 'user',
    enum: ['user', 'admin', 'superadmin'],
    required: false,
  })
  @IsOptional()
  @IsIn(['user', 'admin', 'superadmin'])
  role?: string;

  @ApiProperty({
    example: true,
    description: 'Kullanıcının aktiflik durumu',
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
