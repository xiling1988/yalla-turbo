import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly config: ConfigService) {
    const url = config.get<string>('DATABASE_URL');
    if (!url) {
      throw new Error(
        'DATABASE_URL is missing. Check your .env and ConfigModule.',
      );
    }
    const adapter = new PrismaPg({ connectionString: url });
    super({ adapter });
  }
}
