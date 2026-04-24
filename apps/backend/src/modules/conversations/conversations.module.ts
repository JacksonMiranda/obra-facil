import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsRepository } from './conversations.repository';
import { ProfessionalsModule } from '../professionals/professionals.module';

@Module({
  imports: [ProfessionalsModule],
  controllers: [ConversationsController],
  providers: [ConversationsRepository],
  exports: [ConversationsRepository],
})
export class ConversationsModule {}
