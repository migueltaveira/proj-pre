import 'dotenv/config';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL não encontrada');
}

const adapter = new PrismaPg({
  connectionString,
});

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleDestroy
{
  constructor() {
    super({ adapter });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}