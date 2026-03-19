import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MinFactoryUserEntity } from '../models/entities/minfactory-user.entity';

@Injectable()
export class MinFactoryUserRepository {
  constructor(@InjectRepository(MinFactoryUserEntity) private readonly repository: Repository<MinFactoryUserEntity>) {}

  public async findByEmail(email: string): Promise<MinFactoryUserEntity | null> {
    return await this.repository.findOne({
      where: { email },
    });
  }

  public async findByFirebaseUid(firebaseUid: string): Promise<MinFactoryUserEntity | null> {
    return await this.repository.findOne({
      where: { firebaseUid },
    });
  }

  public async existsByFirebaseUidOrEmail(firebaseUid: string, email: string): Promise<boolean> {
    const count: number = await this.repository.count({
      where: [{ firebaseUid }, { email }],
    });
    return count > 0;
  }

  public async save(entity: MinFactoryUserEntity): Promise<MinFactoryUserEntity> {
    return await this.repository.save(entity);
  }
}
