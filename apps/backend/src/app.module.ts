import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { SupabaseModule } from './supabase/supabase.module';
import { ProfessionalsModule } from './modules/professionals/professionals.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { MessagesModule } from './modules/messages/messages.module';
import { MaterialListsModule } from './modules/material-lists/material-lists.module';
import { OrdersModule } from './modules/orders/orders.module';
import { WorksModule } from './modules/works/works.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { ResponseEnvelopeInterceptor } from './core/interceptors/response-envelope.interceptor';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';

@Module({
  imports: [
    SupabaseModule,
    ProfessionalsModule,
    ConversationsModule,
    MessagesModule,
    MaterialListsModule,
    OrdersModule,
    WorksModule,
    WebhooksModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ResponseEnvelopeInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
