import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { APP_VERSION } from 'src/core/settings/app-version.settings';
import { API_200 } from 'src/shared/decorators/api-200.decorator';
import { API_500 } from 'src/shared/decorators/api-500.decorator';
import { AppName } from 'src/shared/enums/app-name.enum';

@Controller('minrps')
@ApiTags(AppName.MinRps)
export class MinRpsController {
  @Get('health')
  @HttpCode(200)
  @ApiOperation({ operationId: 'getMinRpsHealth' })
  @API_200({ type: String })
  @API_500()
  public getHealth(): string {
    return 'minRPS up and running!';
  }

  @Get('version')
  @HttpCode(200)
  @ApiOperation({ operationId: 'getMinRpsVersion' })
  @API_200({ type: String })
  @API_500()
  public getVersion(): string {
    return APP_VERSION.MIN_RPS;
  }
}
