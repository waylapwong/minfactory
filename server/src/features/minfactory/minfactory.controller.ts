import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MinApp } from 'src/shared/enums/minapp.enum';

@Controller('minfactory')
@ApiTags(MinApp.MinFactory)
export class MinFactoryController {}
