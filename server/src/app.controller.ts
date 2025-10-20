import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { MinApp } from './shared/enums/minapp.enum';

@Controller()
@ApiTags(MinApp.MinFactory)
export class AppController {
  @Get('health')
  public getHealth(): string {
    return 'application up and running!';
  }
}
