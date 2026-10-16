import { AuthorizationGuard, AuthorizationModule, Can } from '@nestjs/authorization';
import { Controller, Get, INestApplication, UseGuards } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { MinFactoryUser } from '../../features/minfactory/models/domains/minfactory-user';
import { UserRole } from './enums/user-role.enum';
import { UserRolePolicy } from './policies/user-role.policy';

@Controller('authorization-check')
@UseGuards(AuthorizationGuard)
class AuthorizationTestController {
  @Get('admin')
  @Can(UserRolePolicy, 'isAdmin')
  public adminRoute(): string {
    return 'admin';
  }

  @Get('user')
  @Can(UserRolePolicy, 'isUser')
  public userRoute(): string {
    return 'user';
  }
}

describe('NestJS authorization integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AuthorizationModule.forRoot({
          globalGuard: false,
          getUser: (context) => context.switchToHttp().getRequest<Request & { user?: MinFactoryUser }>().user,
        }),
      ],
      controllers: [AuthorizationTestController],
      providers: [UserRolePolicy],
    }).compile();

    app = module.createNestApplication();
    app.use((request: Request & { user?: MinFactoryUser }, _response: Response, next: NextFunction) => {
      const role = request.headers['x-role'];
      if (role === UserRole.User || role === UserRole.Admin) {
        request.user = Object.assign(new MinFactoryUser(), { role });
      }
      next();
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 401 when no authenticated user is present', async () => {
    await request(app.getHttpServer()).get('/authorization-check/user').expect(401);
  });

  it('returns 403 when an authenticated user lacks the required role', async () => {
    await request(app.getHttpServer()).get('/authorization-check/admin').set('x-role', UserRole.User).expect(403);
  });

  it('allows the user policy to be inherited by Admin', async () => {
    await request(app.getHttpServer()).get('/authorization-check/user').set('x-role', UserRole.Admin).expect(200);
  });
});
