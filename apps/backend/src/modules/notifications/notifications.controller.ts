import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../core/guards/clerk-auth.guard';
import { CurrentAccount } from '../../core/decorators/current-account.decorator';
import { NotificationsService } from './notifications.service';
import type { AccountContext } from '@obrafacil/shared';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('v1/notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  async findAll(@CurrentAccount() account: AccountContext) {
    return this.service.findForProfile(account.profile.id);
  }

  @Get('count')
  async countUnread(@CurrentAccount() account: AccountContext) {
    const count = await this.service.countUnread(account.profile.id);
    return { count };
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentAccount() account: AccountContext) {
    await this.service.markAllAsRead(account.profile.id);
    return { ok: true };
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @CurrentAccount() account: AccountContext,
  ) {
    await this.service.markAsRead(id, account.profile.id);
    return { ok: true };
  }
}
