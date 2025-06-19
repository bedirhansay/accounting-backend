import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponse } from '../../common/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Kullanıcı kaydı oluşturur',
    operationId: 'registerUser',
  })
  @ApiOkResponse({
    description: 'Kullanıcı kaydı başarıyla oluşturuldu',
  })
  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    try {
      return await this.authService.register(dto);
    } catch (error) {
      return {
        statusCode: error.status || 500,
        message: error.message || 'Bilinmeyen bir hata oluştu',
        error: error.name || 'InternalServerError',
      };
    }
  }

  @ApiOperation({
    summary: 'Kullanıcı girişi yapar',
    operationId: 'login',
  })
  @ApiStandardResponse(LoginResponseDto)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      return await this.authService.login(dto);
    } catch (error) {
      return {
        statusCode: error.status || 500,
        message: error.message || 'Bilinmeyen bir hata oluştu',
        error: error.name || 'InternalServerError',
      };
    }
  }
}
