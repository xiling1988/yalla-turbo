import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import {
  IntendedRole,
  OnboardingStep,
  ProfileStatus,
  Role,
} from 'src/common/database/prisma-client';

type MockedPrisma = {
  user: {
    findUnique: jest.Mock;
    update: jest.Mock;
  };
};

describe('OnboardingService', () => {
  let service: OnboardingService;
  let prisma: MockedPrisma;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    service = new OnboardingService(prisma as any);
  });

  it('throws NotFound when user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);

    await expect(service.markComplete('missing-user')).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('throws Forbidden when user has no profile data', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      role: Role.PENDING,
      intendedRole: IntendedRole.STUDENT,
      studentProfile: null,
      teacherProfile: null,
    });

    await expect(service.markComplete('user-1')).rejects.toThrow(
      ForbiddenException,
    );
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('promotes intended role and marks onboarding complete', async () => {
    const now = new Date();
    const preCompletionUser = {
      id: 'user-2',
      clerkUserId: 'clerk-user',
      email: 'student@example.com',
      role: Role.PENDING,
      intendedRole: IntendedRole.STUDENT,
      onboardingStep: OnboardingStep.PROFILE_DETAILS,
      profileStatus: ProfileStatus.IN_PROGRESS,
      onboardingStartedAt: now,
      profileCompletedAt: null,
      studentProfile: { id: 'student-profile' },
      teacherProfile: null,
    };

    const postCompletionUser = {
      ...preCompletionUser,
      role: Role.STUDENT,
      onboardingStep: OnboardingStep.DONE,
      profileStatus: ProfileStatus.COMPLETED,
      profileCompletedAt: now,
      studentProfile: {
        userId: 'user-2',
        displayName: 'Seed Student',
        shortBio: null,
        goals: null,
        experienceLevel: null,
        preferredSession: null,
        preferredFormats: [{ format: 'IN_STUDIO' }],
        interests: [],
        availabilityPreferences: null,
        homeLatitude: null,
        homeLongitude: null,
        searchRadiusKm: 5,
        neighborhood: null,
        city: 'Paris',
        timezone: 'Europe/Paris',
        createdAt: now,
        updatedAt: now,
      },
    };

    prisma.user.findUnique
      .mockResolvedValueOnce(preCompletionUser)
      .mockResolvedValueOnce({
        ...postCompletionUser,
        teacherProfile: null,
      });

    prisma.user.update.mockResolvedValue({
      ...preCompletionUser,
      role: Role.STUDENT,
      onboardingStep: OnboardingStep.DONE,
      profileStatus: ProfileStatus.COMPLETED,
      profileCompletedAt: now,
    });

    const result = await service.markComplete('user-2');

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-2' },
      data: expect.objectContaining({
        onboardingStep: OnboardingStep.DONE,
        profileStatus: ProfileStatus.COMPLETED,
        profileCompletedAt: expect.any(Date),
        role: Role.STUDENT,
      }),
    });

    expect(result.profileStatus).toBe(ProfileStatus.COMPLETED);
    expect(result.role).toBe(Role.STUDENT);
    expect(result.studentProfile?.preferredFormats).toEqual(['IN_STUDIO']);
  });
});
