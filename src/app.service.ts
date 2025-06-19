import { Get, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  @Get()
  getHello(name: string = 'Dünya'): string {
    throw new Error('Test exception');
  }
}
