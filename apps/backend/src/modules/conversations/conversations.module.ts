import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsRepository } from './conversations.repository';

@Module({
  controllers: [ConversationsController],
  providers: [ConversationsRepository],
  exports: [ConversationsRepository],
})
export class ConversationsModule {}
