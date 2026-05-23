// src/clerk/clerk.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClerkClient, type ClerkClient } from '@clerk/backend';

export const CLERK_CLIENT = Symbol('CLERK_CLIENT');

const ClerkClientProvider = {
  provide: CLERK_CLIENT,
  useFactory: (config: ConfigService): ClerkClient =>
    createClerkClient({
      publishableKey: config.get<string>('CLERK_PUBLISHABLE_KEY')!,
      secretKey: config.get<string>('CLERK_SECRET_KEY')!,
    }),
  inject: [ConfigService],
};

@Global()
@Module({
  imports: [ConfigModule], // to read env
  providers: [ClerkClientProvider],
  exports: [ClerkClientProvider], // make it visible everywhere
})
export class ClerkModule {}
