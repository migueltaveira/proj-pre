import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',')
      : ['http://localhost:3000'],
    credentials: true,
  });

  const port = process.env.PORT || 3001;

  await app.listen(port, '0.0.0.0');

  console.log(`Backend rodando na porta ${port}`);
}

bootstrap();