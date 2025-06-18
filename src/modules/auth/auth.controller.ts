import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponse } from '../../common/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

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
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({
    summary: 'Kullanıcı girişi yapar',
    operationId: 'login',
  })
  @ApiStandardResponse(LoginDto)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
