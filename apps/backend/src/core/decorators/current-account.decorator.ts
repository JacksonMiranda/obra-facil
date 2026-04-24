import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AccountContext } from '@obrafacil/shared';

/**
 * Injects the full AccountContext (profile + roles + actingAs) into a controller.
 *
 * Use this instead of @CurrentUser() when the endpoint needs to know which role
 * the caller is currently acting as (e.g. switching between client/professional).
 *
 * @example
 * @Get('me')
 * getMe(@CurrentAccount() account: AccountContext) {
 *   return account;
 * }
 */
export const CurrentAccount = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AccountContext => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ account: AccountContext }>();
    return request.account;
  },
);
