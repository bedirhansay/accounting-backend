import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiExcludeEndpoint, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { RegisterDto } from './dto/register-dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Yeni kullanıcı kaydı oluşturur' })
  @ApiCreatedResponse({
    description: 'Kullanıcı başarıyla kaydedildi',
    schema: {
      example: {
        user: {
          id: '665b77abc123456789abcdef',
          username: 'bedirhansay',
          email: 'bedirhan@example.com',
        },
      },
    },
  })
  async register(@Body() dto: RegisterDto) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Kayıt işlemi production ortamında kapalıdır');
    }
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Kullanıcı girişi yapar' })
  @ApiOkResponse({
    description: 'Giriş başarılı',
    type: LoginResponseDto,
  })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }
}
