import { Controller, Headers, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { API_201 } from 'src/shared/decorators/api-201.decorator';
import { API_401 } from 'src/shared/decorators/api-401.decorator';
import { API_409 } from 'src/shared/decorators/api-409.decorator';
import { API_500 } from 'src/shared/decorators/api-500.decorator';
import { UserDto } from '../models/dtos/user.dto';
import { UserService } from '../services/user.service';

@Controller('users')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ operationId: 'createUser' })
  @API_201({ type: UserDto })
  @API_401()
  @API_409()
  @API_500()
  public async create(@Headers('authorization') authorizationHeader: string): Promise<UserDto> {
    return await this.userService.createUser(authorizationHeader);
  }
}
