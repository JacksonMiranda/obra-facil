import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../core/guards/clerk-auth.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { MessagesService } from './messages.service';
import type { Profile } from '@obrafacil/shared';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('v1/conversations/:id/messages')
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Get()
  findAll(
    @Param('id') conversationId: string,
    @CurrentUser() profile: Profile,
    @Query('limit') limit?: string,
  ) {
    return this.service.findByConversation(
      conversationId,
      profile.id,
      limit ? Number(limit) : 50,
    );
  }

  @Post()
  send(
    @Param('id') conversationId: string,
    @CurrentUser() profile: Profile,
    @Body() body: unknown,
  ) {
    return this.service.send(profile.id, {
      ...(body as Record<string, unknown>),
      conversationId,
    });
  }
}
