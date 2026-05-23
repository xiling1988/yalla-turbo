import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/database/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  signUp() {
    console.log('up');
    return 'I am signed up!';
  }

  signIn() {
    console.log('in');
    return 'I am signed in!';
  }
}
