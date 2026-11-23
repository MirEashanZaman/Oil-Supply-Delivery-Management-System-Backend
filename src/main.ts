import { NestFactory } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as https from 'https';
import * as http from 'http';
import helmet from 'helmet';
import * as express from 'express';
import cookieParser = require('cookie-parser');

function startKeepAliveHeartbeat() {
  const candidateUrls = Array.from(
    new Set(
      [
        process.env.RENDER_EXTERNAL_URL,
        process.env.BACKEND_PUBLIC_URL,
        'https://oil-supply-delivery-management-system.onrender.com',
        'https://oil-supply-delivery-management-system-backend.onrender.com',
      ]
        .filter((u): u is string => Boolean(u && u.trim()))
        .map((u) => u.trim().replace(/\/+$/, '')),
    ),
  );

  const pingUrl = (rawUrl: string) => {
    try {
      const healthUrl = `${rawUrl}/health`;
      const client = healthUrl.startsWith('https') ? https : http;
      const req = client.get(
        healthUrl,
        {
          headers: {
            'Cache-Control': 'no-cache',
            'User-Agent': 'OSDMS-KeepAlive-Watchdog/1.0',
          },
          timeout: 15000,
        },
        (res) => {
          res.resume();
        },
      );
      req.on('error', () => {});
      req.on('timeout', () => {
        req.destroy();
      });
    } catch {}
  };

  // Ping every 10 minutes (600,000 ms) so Render's 15-minute idle timer never expires
  const INTERVAL_MS = 10 * 60 * 1000;
  setInterval(() => {
    candidateUrls.forEach(pingUrl);
  }, INTERVAL_MS).unref();
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'blob:', 'http:', 'https:'],
          connectSrc: ["'self'", 'http:', 'https:', 'ws:', 'wss:'],
          frameAncestors: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: 'deny' },
      noSniff: true,
    }),
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.use(cookieParser());

  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  app.useStaticAssets(uploadsDir, {
    prefix: '/uploads/',
  });

  const defaultOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
  ];

  const envOrigins = process.env.FRONTEND_ORIGINS
    ? process.env.FRONTEND_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : [];

  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com') ||
        origin.includes('localhost')
      ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  });

  const port = Number(process.env.PORT) || 8000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port: ${port}`);

  startKeepAliveHeartbeat();
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught Exception:', err);
});

bootstrap().catch((err) => {
  console.error('[Bootstrap] Fatal startup error:', err);
  process.exit(1);
});
