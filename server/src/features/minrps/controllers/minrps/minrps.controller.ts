import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { MinApp } from 'src/shared/enums/minapp.enum';

@Controller('minrps')
@ApiTags(MinApp.MinRPS)
export class MinRPSController {
  @Get('health')
  public getHello(): string {
    return 'application up and running!';
  }
}
