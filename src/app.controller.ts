import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class AppController {
  @Get()
  public root(): string {
    return 'Hello World!';
  }
}
