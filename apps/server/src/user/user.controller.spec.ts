import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from 'src/common/database/prisma.service';
import { CLERK_CLIENT } from 'src/auth/providers/clerk.module';
import { ClerkClient } from '@clerk/backend';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const mockClerkClient = {
      users: {
        getUser: jest.fn(),
      },
    } as unknown as jest.Mocked<ClerkClient>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CLERK_CLIENT,
          useValue: mockClerkClient,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
