import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { API_200 } from './shared/decorators/api-200.decorator';
import { API_500 } from './shared/decorators/api-500.decorator';
import { AppName } from './shared/enums/app-name.enum';

@Controller()
@ApiTags(AppName.MinFactory)
export class AppController {
  @Get('health')
  @HttpCode(200)
  @ApiOperation({ operationId: 'getMinFactoryHealth' })
  @API_200()
  @API_500()
  public getHealth(): string {
    return 'application up and running!';
  }
}
