import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
import type { Request } from 'express';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private readonly db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { profile: unknown }>();

    // Bypass para Dev (Docker Local) sem Clerk
    if (process.env.DISABLE_CLERK_AUTH === 'true') {
      const { rows } = await this.db.query('SELECT * FROM profiles LIMIT 1');
      if (rows.length) {
        request.profile = rows[0];
        return true;
      }
    }

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

    const { rows } = await this.db.query(
      'SELECT * FROM profiles WHERE clerk_id = $1',
      [userId],
    );

    if (!rows.length) {
      throw new UnauthorizedException('Perfil não encontrado');
    }

    request.profile = rows[0];
    return true;
  }
}
