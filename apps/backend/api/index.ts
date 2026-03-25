// Vercel Serverless entry point — wraps NestJS app
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import { AppModule } from '../src/app.module';

const server = express();
let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
      logger: ['error', 'warn'],
    });
    app.enableCors({
      origin: process.env.CORS_ORIGIN ?? '*',
      credentials: true,
    });
    app.setGlobalPrefix('api');
    await app.init();
    cachedApp = app;
  }
  return server;
}

export default async function handler(req: Request, res: Response) {
  const app = await bootstrap();
  app(req, res);
}
