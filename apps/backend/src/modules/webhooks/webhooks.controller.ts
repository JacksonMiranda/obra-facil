import { Controller, Post, Req, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Webhook } from 'svix';
import type { Request } from 'express';
import { SupabaseService } from '../../supabase/supabase.service';

type ClerkWebhookEvent = {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  data: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string;
    phone_numbers?: Array<{ phone_number: string }>;
    public_metadata?: { role?: string };
  };
};

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly supabase: SupabaseService) {}

  @Post('clerk')
  async handleClerkWebhook(@Req() req: Request) {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new InternalServerErrorException('Webhook secret not configured');
    }

    const svixId = req.headers['svix-id'] as string | undefined;
    const svixTimestamp = req.headers['svix-timestamp'] as string | undefined;
    const svixSignature = req.headers['svix-signature'] as string | undefined;

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException('Missing Svix headers');
    }

    const body = JSON.stringify(req.body as unknown);

    let event: ClerkWebhookEvent;
    try {
      const wh = new Webhook(webhookSecret);
      event = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkWebhookEvent;
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (event.type === 'user.created' || event.type === 'user.updated') {
      const { id, first_name, last_name, image_url, phone_numbers, public_metadata } = event.data;
      const fullName = [first_name, last_name].filter(Boolean).join(' ') || 'Usuário';
      const phone = phone_numbers?.[0]?.phone_number ?? null;
      const role = (public_metadata?.role as 'client' | 'professional' | 'store') ?? 'client';

      const { error } = await this.supabase.adminClient
        .from('profiles')
        .upsert(
          { clerk_id: id, full_name: fullName, avatar_url: image_url ?? null, phone, role },
          { onConflict: 'clerk_id' },
        );

      if (error) {
        this.logger.error('Supabase upsert error:', error);
        throw new InternalServerErrorException('Database error');
      }
    }

    if (event.type === 'user.deleted') {
      await this.supabase.adminClient.from('profiles').delete().eq('clerk_id', event.data.id);
    }

    return { received: true };
  }
}
