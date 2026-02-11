import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MIN_APP_VERSION } from 'src/core/configs/minapp-version.config';
import { API_200 } from 'src/shared/decorators/api-200.decorator';
import { API_500 } from 'src/shared/decorators/api-500.decorator';
import { MinAppName } from 'src/shared/enums/minapp-name.enum';

@Controller('minrps')
@ApiTags(MinAppName.MinRps)
export class MinRpsController {
  @Get('health')
  @HttpCode(200)
  @ApiOperation({ operationId: 'getHealth' })
  @API_200({ type: String })
  @API_500()
  public getHealth(): string {
    return 'minRPS up and running!';
  }

  @Get('version')
  @HttpCode(200)
  @ApiOperation({ operationId: 'getVersion' })
  @API_200({ type: String })
  @API_500()
  public getVersion(): string {
    return MIN_APP_VERSION.MIN_RPS;
  }
}
