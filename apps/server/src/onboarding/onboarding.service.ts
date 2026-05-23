import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  IntendedRole,
  OnboardingStep,
  Prisma,
  ProfileStatus,
  Role,
} from 'src/common/database/prisma-client';
import { PrismaService } from 'src/common/database/prisma.service';
import {
  StudentProfileInput,
  StudentProfileResponse,
} from './dto/student-profile.dto';
import {
  TeacherBaseInput,
  TeacherProfileInput,
  TeacherProfileResponse,
} from './dto/teacher-profile.dto';

type PrismaExecutor = Prisma.TransactionClient | PrismaService;

export type OnboardingProgress = {
  id: string;
  clerkUserId: string;
  email: string;
  role: Role;
  intendedRole: IntendedRole | null;
  onboardingStep: OnboardingStep;
  profileStatus: ProfileStatus;
  onboardingStartedAt: Date | null;
  profileCompletedAt: Date | null;
  studentProfile: StudentProfileResponse | null;
  teacherProfile: TeacherProfileResponse | null;
};

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async getProgress(userId: string): Promise<OnboardingProgress> {
    return this.fetchProgress(userId, this.prisma);
  }

  async setIntendedRole(
    userId: string,
    intendedRole: IntendedRole,
  ): Promise<OnboardingProgress> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only allow setting intendedRole if user is still PENDING
    if (user.role !== Role.PENDING) {
      throw new ForbiddenException(
        'Cannot change role after onboarding is complete',
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        intendedRole,
        roleSelectedAt: new Date(),
        onboardingStep: OnboardingStep.ROLE_SELECTED,
        onboardingStartedAt: new Date(),
        profileStatus: ProfileStatus.IN_PROGRESS,
      },
    });

    return this.fetchProgress(userId, this.prisma);
  }

  async clearIntendedRole(userId: string): Promise<OnboardingProgress> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only allow clearing if role is still PENDING (not finalized)
    if (user.role !== Role.PENDING) {
      throw new ForbiddenException(
        'Cannot change role after it has been finalized',
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        intendedRole: null,
        roleSelectedAt: null,
        onboardingStep: OnboardingStep.NONE,
        profileStatus: ProfileStatus.NOT_STARTED,
      },
    });

    return this.fetchProgress(userId, this.prisma);
  }

  async upsertStudentProfile(
    userId: string,
    payload: StudentProfileInput,
  ): Promise<OnboardingProgress> {
    const user = await this.ensureUser(userId, {
      allow: ['STUDENT'],
      client: this.prisma,
    });

    await this.prisma.$transaction(async (tx) => {
      // Auto-set intendedRole if user is PENDING and doesn't have one (fallback for MVP)
      if (user.role === Role.PENDING && !user.intendedRole) {
        await tx.user.update({
          where: { id: userId },
          data: {
            intendedRole: IntendedRole.STUDENT,
            roleSelectedAt: new Date(),
            onboardingStep: OnboardingStep.ROLE_SELECTED,
            onboardingStartedAt: new Date(),
            profileStatus: ProfileStatus.IN_PROGRESS,
          },
        });
        user.intendedRole = IntendedRole.STUDENT;
      }
      const profile = await tx.studentProfile.upsert({
        where: { userId },
        create: {
          user: { connect: { id: userId } },
          ...this.mapStudentProfilePayload(payload),
        },
        update: this.mapStudentProfilePayload(payload),
      });

      if (payload.preferredFormats) {
        await tx.studentSessionFormat.deleteMany({
          where: { studentId: profile.id },
        });
        if (payload.preferredFormats.length) {
          await tx.studentSessionFormat.createMany({
            data: payload.preferredFormats.map((format) => ({
              studentId: profile.id,
              format,
            })),
          });
        }
      }

      // Handle specialty interests
      if (payload.specialtyIds !== undefined) {
        await tx.studentSpecialtyInterest.deleteMany({
          where: { studentId: profile.id },
        });
        if (payload.specialtyIds.length > 0) {
          // Verify specialties exist
          const existingSpecialties = await tx.specialty.findMany({
            where: { id: { in: payload.specialtyIds } },
          });
          const validIds = existingSpecialties.map((s) => s.id);
          if (validIds.length > 0) {
            await tx.studentSpecialtyInterest.createMany({
              data: validIds.map((specialtyId) => ({
                studentId: profile.id,
                specialtyId,
              })),
            });
          }
        }
      }

      await this.bumpUserProgress(tx, user, {
        nextStep: OnboardingStep.PROFILE_DETAILS,
      });

      // Auto-complete onboarding if flag is set
      if (payload.autoComplete) {
        await tx.user.update({
          where: { id: userId },
          data: {
            onboardingStep: OnboardingStep.DONE,
            profileStatus: ProfileStatus.COMPLETED,
            profileCompletedAt: new Date(),
            role:
              user.role === Role.PENDING && user.intendedRole
                ? user.intendedRole
                : user.role,
          },
        });
      }
    });

    return this.fetchProgress(userId, this.prisma);
  }

  async upsertTeacherProfile(
    userId: string,
    payload: TeacherProfileInput,
  ): Promise<OnboardingProgress> {
    const user = await this.ensureUser(userId, {
      allow: ['TEACHER'],
      client: this.prisma,
    });

    await this.prisma.$transaction(async (tx) => {
      // Auto-set intendedRole if user is PENDING and doesn't have one (fallback for MVP)
      if (user.role === Role.PENDING && !user.intendedRole) {
        await tx.user.update({
          where: { id: userId },
          data: {
            intendedRole: IntendedRole.TEACHER,
            roleSelectedAt: new Date(),
            onboardingStep: OnboardingStep.ROLE_SELECTED,
            onboardingStartedAt: new Date(),
            profileStatus: ProfileStatus.IN_PROGRESS,
          },
        });
        user.intendedRole = IntendedRole.TEACHER;
      }
      const profile = await tx.teacherProfile.upsert({
        where: { userId },
        create: {
          user: { connect: { id: userId } },
          ...this.mapTeacherProfilePayload(payload),
        },
        update: this.mapTeacherProfilePayload(payload),
      });

      if (payload.offeredFormats) {
        await tx.teacherSessionFormat.deleteMany({
          where: { teacherId: profile.id },
        });
        if (payload.offeredFormats.length) {
          await tx.teacherSessionFormat.createMany({
            data: payload.offeredFormats.map((format) => ({
              teacherId: profile.id,
              format,
            })),
          });
        }
      }

      if (payload.bases) {
        await tx.teacherBase.deleteMany({ where: { teacherId: profile.id } });
        if (payload.bases.length) {
          // Validate: Ensure at least one base is marked as primary
          const primaryBases = payload.bases.filter((b) => b.isPrimary);
          if (primaryBases.length === 0) {
            // Auto-set first base as primary if none is marked
            payload.bases[0].isPrimary = true;
          } else if (primaryBases.length > 1) {
            // If multiple primaries, keep only the first one
            let foundFirst = false;
            payload.bases.forEach((b) => {
              if (b.isPrimary && foundFirst) {
                b.isPrimary = false;
              } else if (b.isPrimary) {
                foundFirst = true;
              }
            });
          }

          // Validate: Primary base must have coordinates for map display
          const primaryBase = payload.bases.find((b) => b.isPrimary);
          if (primaryBase) {
            if (
              primaryBase.latitude === null ||
              primaryBase.latitude === undefined ||
              primaryBase.longitude === null ||
              primaryBase.longitude === undefined
            ) {
              // For MVP: Allow saving without coordinates but log a warning
              // Frontend validation will prevent submission without coordinates
              console.warn(
                `Teacher ${userId} primary base missing coordinates for map display`,
              );
            }
          }

          await tx.teacherBase.createMany({
            data: payload.bases.map((base) =>
              this.mapTeacherBasePayload(profile.id, base),
            ),
          });
        }
      }

      // Handle specialties
      if (payload.specialtyIds !== undefined) {
        await tx.teacherSpecialty.deleteMany({
          where: { teacherId: profile.id },
        });
        if (payload.specialtyIds.length > 0) {
          // Verify specialties exist
          const existingSpecialties = await tx.specialty.findMany({
            where: { id: { in: payload.specialtyIds } },
          });
          const validIds = existingSpecialties.map((s) => s.id);
          if (validIds.length > 0) {
            await tx.teacherSpecialty.createMany({
              data: validIds.map((specialtyId) => ({
                teacherId: profile.id,
                specialtyId,
              })),
            });
          }
        }
      }

      await this.bumpUserProgress(tx, user, {
        nextStep: OnboardingStep.PROFILE_DETAILS,
      });

      // Auto-complete onboarding if flag is set
      if (payload.autoComplete) {
        await tx.user.update({
          where: { id: userId },
          data: {
            onboardingStep: OnboardingStep.DONE,
            profileStatus: ProfileStatus.COMPLETED,
            profileCompletedAt: new Date(),
            role:
              user.role === Role.PENDING && user.intendedRole
                ? user.intendedRole
                : user.role,
          },
        });
      }
    });

    return this.fetchProgress(userId, this.prisma);
  }

  async markComplete(userId: string): Promise<OnboardingProgress> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        teacherProfile: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.studentProfile && !user.teacherProfile) {
      throw new ForbiddenException(
        'Cannot complete onboarding without a profile',
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        onboardingStep: OnboardingStep.DONE,
        profileStatus: ProfileStatus.COMPLETED,
        profileCompletedAt: new Date(),
        role:
          user.role === Role.PENDING && user.intendedRole
            ? user.intendedRole
            : user.role,
      },
    });

    return this.fetchProgress(userId, this.prisma);
  }

  async resetOnboarding(userId: string): Promise<OnboardingProgress> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        teacherProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Dev/testing: Allow reset even after role is finalized
    await this.prisma.$transaction(async (tx) => {
      // Delete student profile and related data
      if (user.studentProfile) {
        await tx.studentSessionFormat.deleteMany({
          where: { studentId: user.studentProfile.id },
        });
        await tx.studentSpecialtyInterest.deleteMany({
          where: { studentId: user.studentProfile.id },
        });
        await tx.studentLanguagePreference.deleteMany({
          where: { studentId: user.studentProfile.id },
        });
        await tx.studentProfile.delete({
          where: { userId },
        });
      }

      // Delete teacher profile and related data
      if (user.teacherProfile) {
        await tx.teacherBase.deleteMany({
          where: { teacherId: user.teacherProfile.id },
        });
        await tx.teacherSessionFormat.deleteMany({
          where: { teacherId: user.teacherProfile.id },
        });
        await tx.teacherSpecialty.deleteMany({
          where: { teacherId: user.teacherProfile.id },
        });
        await tx.teacherLanguage.deleteMany({
          where: { teacherId: user.teacherProfile.id },
        });
        await tx.teacherProfile.delete({
          where: { userId },
        });
      }

      // Reset user onboarding state (including role for dev/testing)
      await tx.user.update({
        where: { id: userId },
        data: {
          role: Role.PENDING,
          intendedRole: null,
          onboardingStep: OnboardingStep.NONE,
          profileStatus: ProfileStatus.NOT_STARTED,
          onboardingStartedAt: null,
          roleSelectedAt: null,
          profileCompletedAt: null,
        },
      });
    });

    return this.fetchProgress(userId, this.prisma);
  }

  async getSpecialties() {
    return this.prisma.specialty.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  private async fetchProgress(
    userId: string,
    client: PrismaExecutor,
  ): Promise<OnboardingProgress> {
    const user = await client.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: {
          include: {
            preferredFormats: true,
            interests: true,
          },
        },
        teacherProfile: {
          include: {
            offeredFormats: true,
            bases: true,
            specialties: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      clerkUserId: user.clerkUserId,
      email: user.email,
      role: user.role,
      intendedRole: user.intendedRole,
      onboardingStep: user.onboardingStep,
      profileStatus: user.profileStatus,
      onboardingStartedAt: user.onboardingStartedAt,
      profileCompletedAt: user.profileCompletedAt,
      studentProfile: user.studentProfile
        ? this.mapStudentProfile(user.studentProfile)
        : null,
      teacherProfile: user.teacherProfile
        ? this.mapTeacherProfile(user.teacherProfile)
        : null,
    };
  }

  private mapStudentProfile(
    profile: Prisma.StudentProfileGetPayload<{
      include: { preferredFormats: true; interests: true };
    }>,
  ): StudentProfileResponse {
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      shortBio: profile.shortBio,
      goals: profile.goals,
      experienceLevel: profile.experienceLevel,
      preferredSession: profile.preferredSession,
      preferredFormats: profile.preferredFormats.map((item) => item.format),
      availabilityPreferences: profile.availabilityPreferences as Record<
        string,
        unknown
      > | null,
      homeLatitude:
        profile.homeLatitude !== null && profile.homeLatitude !== undefined
          ? Number(profile.homeLatitude)
          : null,
      homeLongitude:
        profile.homeLongitude !== null && profile.homeLongitude !== undefined
          ? Number(profile.homeLongitude)
          : null,
      searchRadiusKm: profile.searchRadiusKm,
      neighborhood: profile.neighborhood,
      city: profile.city,
      timezone: profile.timezone,
      specialtyIds: (profile.interests || []).map((i) => i.specialtyId),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  private mapTeacherProfile(
    profile: Prisma.TeacherProfileGetPayload<{
      include: { offeredFormats: true; bases: true; specialties: true };
    }>,
  ): TeacherProfileResponse {
    // Combine shortBio and about into single bio field
    const bioParts = [profile.shortBio, profile.about].filter(Boolean);
    const bio = bioParts.length > 0 ? bioParts.join('\n\n') : null;

    return {
      userId: profile.userId,
      displayName: profile.displayName,
      headline: profile.headline,
      bio,
      yearsExperience: profile.yearsExperience,
      specialtyIds: profile.specialties.map((s) => s.specialtyId),
      certifications: profile.certifications as Record<string, unknown> | null,
      offeredFormats: profile.offeredFormats.map((item) => item.format),
      sessionDurationMins: profile.sessionDurationMins,
      pricePerSession:
        profile.pricePerSession !== null &&
        profile.pricePerSession !== undefined
          ? Number(profile.pricePerSession)
          : null,
      currency: profile.currency,
      acceptsPrivate: profile.acceptsPrivate,
      acceptsGroup: profile.acceptsGroup,
      travelPolicy: profile.travelPolicy,
      travelRadiusKm: profile.travelRadiusKm,
      avatarUrl: profile.avatarUrl,
      timezone: profile.timezone,
      availability: profile.availability as Record<string, unknown> | null,
      bases: profile.bases.map((base) => ({
        id: base.id,
        nickname: base.nickname,
        addressLine1: base.addressLine1,
        addressLine2: base.addressLine2,
        city: base.city,
        state: base.state,
        postalCode: base.postalCode,
        countryCode: base.countryCode,
        latitude:
          base.latitude !== null && base.latitude !== undefined
            ? Number(base.latitude)
            : null,
        longitude:
          base.longitude !== null && base.longitude !== undefined
            ? Number(base.longitude)
            : null,
        isPrimary: base.isPrimary,
        notes: base.notes,
      })),
      averageRating:
        profile.averageRating !== null && profile.averageRating !== undefined
          ? Number(profile.averageRating)
          : null,
      reviewCount: profile.reviewCount,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  private mapStudentProfilePayload(
    payload: StudentProfileInput,
  ): Record<string, unknown> {
    return {
      displayName: this.nullable(payload.displayName),
      shortBio: this.nullable(payload.shortBio),
      goals: this.nullable(payload.goals),
      experienceLevel: payload.experienceLevel ?? undefined,
      preferredSession: payload.preferredSession ?? undefined,
      availabilityPreferences:
        payload.availabilityPreferences !== undefined
          ? (payload.availabilityPreferences as Prisma.InputJsonValue)
          : undefined,
      homeLatitude: this.nullableNumber(payload.homeLatitude),
      homeLongitude: this.nullableNumber(payload.homeLongitude),
      searchRadiusKm: payload.searchRadiusKm ?? undefined,
      neighborhood: this.nullable(payload.neighborhood),
      city: this.nullable(payload.city),
      timezone: this.nullable(payload.timezone),
    };
  }

  private mapTeacherProfilePayload(
    payload: TeacherProfileInput,
  ): Record<string, unknown> {
    // Split bio into shortBio and about (use bio for both if provided)
    const bio = this.nullable(payload.bio);
    return {
      displayName: this.nullable(payload.displayName),
      headline: this.nullable(payload.headline),
      shortBio: bio, // Use bio for shortBio
      about: bio, // Use bio for about (combining them)
      yearsExperience: payload.yearsExperience ?? undefined,
      certifications:
        payload.certifications !== undefined
          ? (payload.certifications as Prisma.InputJsonValue)
          : undefined,
      sessionDurationMins: payload.sessionDurationMins ?? undefined,
      pricePerSession:
        payload.pricePerSession !== undefined
          ? payload.pricePerSession
          : undefined,
      currency: this.nullable(payload.currency),
      acceptsPrivate: payload.acceptsPrivate ?? undefined,
      acceptsGroup: payload.acceptsGroup ?? undefined,
      travelPolicy: payload.travelPolicy ?? undefined,
      travelRadiusKm: payload.travelRadiusKm ?? undefined,
      avatarUrl: this.nullable(payload.avatarUrl),
      timezone: this.nullable(payload.timezone),
      availability:
        payload.availability !== undefined
          ? (payload.availability as Prisma.InputJsonValue)
          : undefined,
    };
  }

  private mapTeacherBasePayload(
    teacherId: string,
    base: TeacherBaseInput,
  ): Prisma.TeacherBaseCreateManyInput {
    const data: Prisma.TeacherBaseCreateManyInput = {
      teacherId,
      isPrimary: base.isPrimary ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (base.nickname !== undefined) data.nickname = base.nickname;
    if (base.addressLine1 !== undefined) data.addressLine1 = base.addressLine1;
    if (base.addressLine2 !== undefined) data.addressLine2 = base.addressLine2;
    if (base.city !== undefined) data.city = base.city;
    if (base.state !== undefined) data.state = base.state;
    if (base.postalCode !== undefined) data.postalCode = base.postalCode;
    if (base.countryCode !== undefined) data.countryCode = base.countryCode;
    if (base.latitude !== undefined) data.latitude = base.latitude;
    if (base.longitude !== undefined) data.longitude = base.longitude;
    if (base.notes !== undefined) data.notes = base.notes;

    return data;
  }

  private async ensureUser(
    userId: string,
    options: { allow: Array<'STUDENT' | 'TEACHER'>; client: PrismaExecutor },
  ) {
    const user = await options.client.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        intendedRole: true,
        onboardingStartedAt: true,
        profileStatus: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // MVP: Allow PENDING users without intendedRole to proceed
    // The intendedRole will be auto-set in the upsert methods
    if (user.role === Role.PENDING && !user.intendedRole) {
      return user;
    }

    const roles = new Set<string>(
      [user.role, user.intendedRole ?? undefined].filter(Boolean) as string[],
    );

    const isAllowed = options.allow.some((role) => roles.has(role));
    if (!isAllowed) {
      throw new ForbiddenException(
        `User is not allowed to complete ${options.allow.join('/')} onboarding. Current role: ${user.role}, intendedRole: ${user.intendedRole ?? 'none'}`,
      );
    }

    return user;
  }

  private async bumpUserProgress(
    tx: Prisma.TransactionClient,
    user: {
      id: string;
      onboardingStartedAt: Date | null;
      profileStatus: ProfileStatus;
    },
    options: { nextStep: OnboardingStep },
  ) {
    await tx.user.update({
      where: { id: user.id },
      data: {
        onboardingStep: options.nextStep,
        onboardingStartedAt: user.onboardingStartedAt ?? new Date(),
        profileStatus:
          user.profileStatus === ProfileStatus.NOT_STARTED
            ? ProfileStatus.IN_PROGRESS
            : undefined,
      },
    });
  }

  private nullable<T>(value: T | null | undefined) {
    if (value === undefined) {
      return undefined;
    }
    return value;
  }

  private nullableNumber(value: number | null | undefined) {
    if (value === undefined) {
      return undefined;
    }
    return value;
  }
}
