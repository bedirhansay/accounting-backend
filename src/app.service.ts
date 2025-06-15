import { Get, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  @Get()
  getHello(name: string = 'Dünya'): string {
    return `Merhaba ${name}!`;
  }
}
