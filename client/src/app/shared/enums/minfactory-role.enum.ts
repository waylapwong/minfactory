export enum MinFactoryRole {
  Admin = 'admin',
  User = 'user',
}

export const ROLE_HIERARCHY: Record<MinFactoryRole, number> = {
  [MinFactoryRole.Admin]: 2,
  [MinFactoryRole.User]: 1,
};

export function hasRequiredRole(userRole: MinFactoryRole, requiredRole: MinFactoryRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
