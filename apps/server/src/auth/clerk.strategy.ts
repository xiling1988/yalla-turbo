// auth/clerk.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import type { Request } from 'express';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, 'clerk') {
  constructor(private readonly users: UserService) {
    super();
  }

  async validate(req: Request) {
    const auth = (req as any).auth; // set by clerkMiddleware
    if (!auth?.userId) {
      throw new UnauthorizedException('Not authenticated');
    }

    const user = await this.users.getOrCreateByClerkId(auth.userId);

    // optional: also expose Clerk identity for other decorators
    (req as any).clerk = { userId: auth.userId, sessionId: auth.sessionId };

    // Passport assigns return value to req.user
    return user;
  }
}
