import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../models/entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(@InjectRepository(UserEntity) private readonly repository: Repository<UserEntity>) {}

  public async existsByFirebaseUidOrEmail(firebaseUid: string, email: string): Promise<boolean> {
    const count: number = await this.repository.count({
      where: [{ firebaseUid }, { email }],
    });
    return count > 0;
  }

  public async save(entity: UserEntity): Promise<UserEntity> {
    return await this.repository.save(entity);
  }
}
