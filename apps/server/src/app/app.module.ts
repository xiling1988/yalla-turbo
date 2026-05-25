import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { clerkMiddleware } from '@clerk/express'
import { AuthModule } from 'src/auth/auth.module'
import { UserModule } from 'src/user/user.module'
import { PrismaModule } from 'src/common/database/prisma.module'
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard'
import { AppController } from './app.controller'
import { ClerkModule } from 'src/auth/providers/clerk.module'
import { OnboardingModule } from 'src/onboarding/onboarding.module'
import { TeacherModule } from 'src/teacher/teacher.module'
import { LoggerModule } from 'src/common/logger'
import { TRPCModule } from 'nestjs-trpc-v2'

@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    OnboardingModule,
    TeacherModule,
    ClerkModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TRPCModule.forRoot({
      autoSchemaFile: '../../packages/trpc/src/server',
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
    AppService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        clerkMiddleware({
          publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
          secretKey: process.env.CLERK_SECRET_KEY!,
          // Optional hardening:
          // issuer: process.env.CLERK_ISSUER,
          // authorizedParties: ['yallasana-native'],
          // audience: process.env.CLERK_JWT_AUDIENCE,
        }),
      )
      .forRoutes('*')
  }
}
