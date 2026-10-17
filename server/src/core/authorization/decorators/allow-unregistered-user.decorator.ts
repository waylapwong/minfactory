import { SetMetadata } from '@nestjs/common';

export const AllowWithoutAccount = (): ReturnType<typeof SetMetadata> => SetMetadata(ALLOW_WITHOUT_ACCOUNT, true);

export const ALLOW_WITHOUT_ACCOUNT = 'allowWithoutAccount';
