export type ProfileStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type OnboardingStep =
  | "NONE"
  | "ROLE_SELECTED"
  | "PROFILE_DETAILS"
  | "DONE";

export type Role = "PENDING" | "STUDENT" | "TEACHER" | "ADMIN";

export type IntendedRole = "STUDENT" | "TEACHER";

export type SessionFormat = "IN_STUDIO" | "AT_HOME" | "VIRTUAL";

export type StudentExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type StudentSessionType = "IN_PERSON" | "LIVE_VIRTUAL" | "ON_DEMAND";

export type TeacherTravelPolicy =
  | "NONE"
  | "STUDENT_LOCATION"
  | "TEACHER_BASE_ONLY"
  | "HYBRID";

export type StudentProfile = {
  userId: string;
  displayName: string | null;
  shortBio: string | null;
  goals: string | null;
  experienceLevel: StudentExperienceLevel | null;
  preferredSession: StudentSessionType | null;
  preferredFormats: SessionFormat[];
  availabilityPreferences: Record<string, unknown> | null;
  homeLatitude: number | null;
  homeLongitude: number | null;
  searchRadiusKm: number | null;
  neighborhood: string | null;
  city: string | null;
  timezone: string | null;
  specialtyIds: string[]; // Array of specialty IDs
  createdAt: string;
  updatedAt: string;
};

export type TeacherBase = {
  id?: string;
  nickname?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  countryCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isPrimary?: boolean | null;
  notes?: string | null;
};

export type Specialty = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type TeacherProfile = {
  userId: string;
  displayName: string | null;
  headline: string | null;
  bio: string | null; // Combined shortBio and about
  yearsExperience: number;
  specialtyIds: string[]; // Array of specialty IDs
  certifications: Record<string, unknown> | null;
  offeredFormats: SessionFormat[];
  sessionDurationMins: number | null;
  pricePerSession: number | null;
  currency: string | null;
  acceptsPrivate: boolean;
  acceptsGroup: boolean;
  travelPolicy: TeacherTravelPolicy | null;
  travelRadiusKm: number | null;
  avatarUrl: string | null;
  timezone: string | null;
  availability: Record<string, unknown> | null;
  bases: TeacherBase[];
  averageRating: number | null;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
};

export type OnboardingProgress = {
  id: string;
  clerkUserId: string;
  email: string;
  role: Role;
  intendedRole: IntendedRole | null;
  onboardingStep: OnboardingStep;
  profileStatus: ProfileStatus;
  onboardingStartedAt: string | null;
  profileCompletedAt: string | null;
  studentProfile: StudentProfile | null;
  teacherProfile: TeacherProfile | null;
};

export type StudentProfileInput = Partial<
  Pick<
    StudentProfile,
    | "displayName"
    | "shortBio"
    | "goals"
    | "experienceLevel"
    | "preferredSession"
    | "preferredFormats"
    | "availabilityPreferences"
    | "homeLatitude"
    | "homeLongitude"
    | "searchRadiusKm"
    | "neighborhood"
    | "city"
    | "timezone"
    | "specialtyIds"
  >
> & {
  autoComplete?: boolean; // Flag to auto-complete onboarding on final submission
};

export type TeacherProfileInput = Partial<
  Pick<
    TeacherProfile,
    | "displayName"
    | "headline"
    | "bio"
    | "yearsExperience"
    | "specialtyIds"
    | "certifications"
    | "offeredFormats"
    | "sessionDurationMins"
    | "pricePerSession"
    | "currency"
    | "acceptsPrivate"
    | "acceptsGroup"
    | "travelPolicy"
    | "travelRadiusKm"
    | "avatarUrl"
    | "timezone"
    | "availability"
  >
> & {
  bases?: TeacherBase[];
  autoComplete?: boolean; // Flag to auto-complete onboarding on final submission
};
