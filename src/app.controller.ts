import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/')
  getRoot(): string {
    return 'Uygulama çalışıyor. Swagger için /swagger adresini ziyaret edin.';
  }
}
