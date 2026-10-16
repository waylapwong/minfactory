import { SetMetadata } from '@nestjs/common';

export const AllowUnregisteredUser = (): ReturnType<typeof SetMetadata> => SetMetadata(ALLOW_UNREGISTERED_USER, true);

export const ALLOW_UNREGISTERED_USER = 'allowUnregisteredUser';
