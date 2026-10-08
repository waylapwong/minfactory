import { SetMetadata } from '@nestjs/common';

export const ALLOW_UNREGISTERED_USER = 'allowUnregisteredUser';

export const AllowUnregisteredUser = (): ReturnType<typeof SetMetadata> => SetMetadata(ALLOW_UNREGISTERED_USER, true);
