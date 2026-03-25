import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Profile } from '@obrafacil/shared';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Profile => {
    const request = ctx.switchToHttp().getRequest<{ profile: Profile }>();
    return request.profile;
  },
);
