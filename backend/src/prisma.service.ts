import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    if (!prismaInstance) {
      prismaInstance = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL
          }
        }
      });
    }
    super();
    return prismaInstance as any;
  }

  async onModuleInit() {
    if (prismaInstance && !prismaInstance.$connect) {
      await prismaInstance.$connect();
    }
  }

  async onModuleDestroy() {
    if (prismaInstance) {
      await prismaInstance.$disconnect();
    }
  }
}