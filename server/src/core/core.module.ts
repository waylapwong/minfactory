import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    FirebaseModule,
    TypeOrmModule.forRoot({
      database: process.env.DB_DATABASE,
      entities: ['dist/**/*.entity{.ts,.js}'],
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      port: +process.env.DB_PORT!,
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      type: process.env.DB_TYPE as 'mariadb',
      username: process.env.DB_USERNAME,
    }),
  ],
})
export class CoreModule {}
