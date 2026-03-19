import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppName } from 'src/shared/enums/app-name.enum';

@Controller('minfactory')
@ApiTags(AppName.MinFactory)
export class MinFactoryController {}
