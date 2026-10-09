import { Controller, Get, INestApplication, UseGuards } from '@nestjs/common';
import { AuthorizationGuard, AuthorizationModule, Can } from '@nestjs/authorization';
import { Test, TestingModule } from '@nestjs/testing';
import { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { MinFactoryRole } from '../../shared/enums/minfactory-role.enum';
import { MinFactoryUser } from '../../features/minfactory/models/domains/minfactory-user';
import { MinFactoryRolePolicy } from '../../features/minfactory/policies/minfactory-role.policy';

@Controller('authorization-check')
@UseGuards(AuthorizationGuard)
class AuthorizationTestController {
  @Get('user')
  @Can(MinFactoryRolePolicy, 'user')
  public userRoute(): string {
    return 'user';
  }

  @Get('admin')
  @Can(MinFactoryRolePolicy, 'admin')
  public adminRoute(): string {
    return 'admin';
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
      providers: [MinFactoryRolePolicy],
    }).compile();

    app = module.createNestApplication();
    app.use((request: Request & { user?: MinFactoryUser }, _response: Response, next: NextFunction) => {
      const role = request.headers['x-role'];
      if (role === MinFactoryRole.User || role === MinFactoryRole.Admin) {
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
    await request(app.getHttpServer()).get('/authorization-check/admin').set('x-role', MinFactoryRole.User).expect(403);
  });

  it('allows the user policy to be inherited by Admin', async () => {
    await request(app.getHttpServer()).get('/authorization-check/user').set('x-role', MinFactoryRole.Admin).expect(200);
  });
});
