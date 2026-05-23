import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/database/prisma.service';

export type TeacherListItem = {
  id: string;
  userId: string;
  displayName: string | null;
  shortBio: string | null;
  yearsExperience: number;
  averageRating: number | null;
  reviewCount: number;
  pricePerSession: number | null;
  currency: string | null;
  avatarUrl: string | null;
  specialties: string[];
  primaryBase: {
    latitude: number;
    longitude: number;
    neighborhood: string | null;
    city: string | null;
  } | null;
};

@Injectable()
export class TeacherService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<TeacherListItem[]> {
    // First, get all teachers with the basic filters
    const teachers = await this.prisma.teacherProfile.findMany({
      where: {
        user: {
          role: 'TEACHER',
          profileStatus: 'COMPLETED',
        },
      },
      include: {
        user: true,
        bases: true, // Include ALL bases, not just primary
        specialties: {
          include: {
            specialty: true,
          },
        },
      },
    });

    console.log(
      `[TeacherService] Found ${teachers.length} teachers with role=TEACHER and status=COMPLETED`,
    );

    // Log each teacher's details for debugging
    teachers.forEach((profile) => {
      const primaryBase = profile.bases.find((b) => b.isPrimary);
      console.log(
        `[TeacherService] Teacher ${profile.id} (${profile.displayName}):`,
        {
          basesCount: profile.bases.length,
          hasPrimaryBase: !!primaryBase,
          primaryBaseLat: primaryBase?.latitude,
          primaryBaseLng: primaryBase?.longitude,
          isPrimary: primaryBase?.isPrimary,
        },
      );
    });

    // Filter to only teachers with primary bases that have coordinates
    const filtered = teachers
      .filter((profile) => {
        const primaryBase = profile.bases.find((b) => b.isPrimary);
        const hasValidBase =
          primaryBase &&
          primaryBase.latitude !== null &&
          primaryBase.longitude !== null;
        if (!hasValidBase) {
          console.log(
            `[TeacherService] Filtering out teacher ${profile.id} - missing valid primary base`,
          );
        }
        return hasValidBase;
      })
      .map((profile) => {
        const primaryBase = profile.bases.find((b) => b.isPrimary);

        if (!primaryBase) {
          return null;
        }

        const lat = Number(primaryBase.latitude);
        const lng = Number(primaryBase.longitude);

        // Validate coordinates are valid numbers
        if (isNaN(lat) || isNaN(lng)) {
          return null;
        }

        return {
          id: profile.id,
          userId: profile.userId,
          displayName: profile.displayName,
          shortBio: profile.shortBio,
          yearsExperience: profile.yearsExperience,
          averageRating: profile.averageRating
            ? Number(profile.averageRating)
            : null,
          reviewCount: profile.reviewCount,
          pricePerSession: profile.pricePerSession
            ? Number(profile.pricePerSession)
            : null,
          currency: profile.currency,
          avatarUrl: profile.avatarUrl,
          specialties: profile.specialties.map((ts) => ts.specialty.name),
          primaryBase: {
            latitude: lat,
            longitude: lng,
            neighborhood: primaryBase.addressLine1 || null,
            city: primaryBase.city,
          },
        };
      })
      .filter((teacher): teacher is TeacherListItem => teacher !== null);

    console.log(
      `[TeacherService] Returning ${filtered.length} teachers after filtering`,
    );
    return filtered;
  }

  async debugTeacher(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        teacherProfile: {
          include: {
            bases: true,
            specialties: {
              include: {
                specialty: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    if (!user.teacherProfile) {
      return { error: 'User has no teacher profile' };
    }

    const primaryBase = user.teacherProfile.bases.find((b) => b.isPrimary);
    const hasPrimaryBase = !!primaryBase;
    const hasCoordinates =
      primaryBase?.latitude !== null && primaryBase?.longitude !== null;

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        intendedRole: user.intendedRole,
        profileStatus: user.profileStatus,
        onboardingStep: user.onboardingStep,
      },
      teacherProfile: {
        id: user.teacherProfile.id,
        displayName: user.teacherProfile.displayName,
        hasBases: user.teacherProfile.bases.length > 0,
        basesCount: user.teacherProfile.bases.length,
        primaryBase: primaryBase
          ? {
              id: primaryBase.id,
              isPrimary: primaryBase.isPrimary,
              latitude: primaryBase.latitude,
              longitude: primaryBase.longitude,
              city: primaryBase.city,
            }
          : null,
      },
      issues: {
        roleNotTeacher: user.role !== 'TEACHER',
        profileNotCompleted: user.profileStatus !== 'COMPLETED',
        noPrimaryBase: !hasPrimaryBase,
        noCoordinates: !hasCoordinates,
      },
      wouldAppearInQuery:
        user.role === 'TEACHER' &&
        user.profileStatus === 'COMPLETED' &&
        hasPrimaryBase &&
        hasCoordinates,
    };
  }

  async findAllRaw() {
    // Return raw query results for debugging
    const teachers = await this.prisma.teacherProfile.findMany({
      where: {
        user: {
          role: 'TEACHER',
          profileStatus: 'COMPLETED',
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            profileStatus: true,
          },
        },
        bases: true,
        specialties: {
          include: {
            specialty: true,
          },
        },
      },
    });

    return teachers.map((t) => ({
      id: t.id,
      displayName: t.displayName,
      userId: t.userId,
      userEmail: t.user.email,
      userRole: t.user.role,
      userProfileStatus: t.user.profileStatus,
      bases: t.bases.map((b) => ({
        id: b.id,
        isPrimary: b.isPrimary,
        latitude: b.latitude,
        longitude: b.longitude,
        city: b.city,
        addressLine1: b.addressLine1,
      })),
      primaryBase: t.bases.find((b) => b.isPrimary) || null,
    }));
  }
}
