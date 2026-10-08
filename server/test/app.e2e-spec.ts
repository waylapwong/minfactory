import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /minrps/play returns a game result', () => {
    return request(app.getHttpServer())
      .post('/minrps/play')
      .set('X-Request-Id', '550e8400-e29b-41d4-a716-446655440000')
      .send({ player1Move: 'rock' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.player1Move).toBe('rock');
        expect(body.player2Move).toBeTruthy();
        expect(body.result).toBeTruthy();
      });
  });
});
