import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MinApp } from '../../shared/enums/minapp.enum';

@Controller('minpoker')
@ApiTags(MinApp.MinPoker)
export class MinPokerController {}
