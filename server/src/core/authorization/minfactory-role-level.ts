import { MinFactoryRole } from './minfactory-role.enum';

export const MINFACTORY_ROLE_LEVEL: Record<MinFactoryRole, number> = {
  [MinFactoryRole.Guest]: 0,
  [MinFactoryRole.User]: 1,
  [MinFactoryRole.Admin]: 2,
};
