import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
import type { Request } from 'express';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { profile: unknown }>();
    const authHeader = request.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticação ausente');
    }

    const token = authHeader.slice(7);

    let userId: string;
    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });
      userId = payload.sub;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    const { data: profile, error } = await this.supabase.client
      .from('profiles')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (error || !profile) {
      throw new UnauthorizedException('Perfil não encontrado');
    }

    request.profile = profile;
    return true;
  }
}
