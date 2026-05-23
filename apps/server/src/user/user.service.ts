import { Inject, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/common/database/prisma.service';
import { ClerkClient } from '@clerk/backend';
import { CLERK_CLIENT } from 'src/auth/providers/clerk.module';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    @Inject(CLERK_CLIENT) private readonly clerk: ClerkClient,
  ) {}
  async getOrCreateByClerkId(clerkUserId: string) {
    console.log('GET OR CREATE BY CLERK ID', clerkUserId);
    const existing = await this.prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (existing) {
      return existing;
    }

    // Fetch details from Clerk
    const cu = await this.clerk.users.getUser(clerkUserId);
    const email =
      cu.primaryEmailAddress?.emailAddress ||
      cu.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      // Extremely rare; but guard just in case
      throw new Error('Clerk user has no email address');
    }

    return this.prisma.user.create({
      data: {
        clerkUserId,
        email, // <-- now provided
        role: 'PENDING', // or keep STUDENT if you decided so
        firstName: cu.firstName ?? null,
        lastName: cu.lastName ?? null,
        displayName:
          cu.username ||
          [cu.firstName, cu.lastName].filter(Boolean).join(' ') ||
          null,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user with ${updateUserDto}`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
