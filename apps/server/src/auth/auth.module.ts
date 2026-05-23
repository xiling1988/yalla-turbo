import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ClerkStrategy } from './clerk.strategy';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'clerk' }), UserModule],
  controllers: [AuthController],
  providers: [AuthService, ClerkStrategy],
  exports: [AuthService, ClerkStrategy],
})
export class AuthModule {}
