import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MinFactoryUserEntity } from '../models/entities/minfactory-user.entity';

@Injectable()
export class MinFactoryUserRepository {
  constructor(@InjectRepository(MinFactoryUserEntity) private readonly repository: Repository<MinFactoryUserEntity>) {}

  public async findByEmail(email: string): Promise<MinFactoryUserEntity> {
    const entity: MinFactoryUserEntity | null = await this.repository.findOne({
      where: { email },
    });

    if (!entity) {
      throw new NotFoundException('User not found');
    }

    return entity;
  }

  public async findByFirebaseUid(firebaseUid: string): Promise<MinFactoryUserEntity> {
    const entity: MinFactoryUserEntity | null = await this.repository.findOne({
      where: { firebaseUid },
    });

    if (!entity) {
      throw new NotFoundException('User not found');
    }

    return entity;
  }

  public async save(entity: MinFactoryUserEntity): Promise<MinFactoryUserEntity> {
    return await this.repository.save(entity);
  }
}
