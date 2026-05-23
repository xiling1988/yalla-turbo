import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Usage:
 *   @CurrentUser() user: User
 *   @CurrentUser('id') userId: string
 *   @CurrentUser('profile.email') email: string
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    const user = req?.user;
    if (!data) return user;

    // support dotted path like 'profile.email'
    return getByPath(user, data);
  },
);

function getByPath(obj: any, path: string) {
  if (!obj || !path) return undefined;
  return path
    .split('.')
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}
