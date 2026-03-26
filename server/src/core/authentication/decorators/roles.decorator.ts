import { SetMetadata } from '@nestjs/common';
import { MinFactoryRole } from 'src/shared/enums/minfactory-role.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: MinFactoryRole[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(ROLES_KEY, roles);
