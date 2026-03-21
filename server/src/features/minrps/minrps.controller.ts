import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MinApp } from 'src/shared/enums/minapp.enum';

@Controller('minrps')
@ApiTags(MinApp.MinRps)
export class MinRpsController {}
