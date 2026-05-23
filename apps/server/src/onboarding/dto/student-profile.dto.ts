import {
  SessionFormat,
  StudentExperienceLevel,
  StudentSessionType,
} from 'src/common/database/prisma-client';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  IsObject,
  IsNumber,
  IsBoolean,
  IsLatitude,
  IsLongitude,
  Min,
  ValidateIf,
} from 'class-validator';

export class StudentProfileInput {
  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsString()
  displayName?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsString()
  shortBio?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsString()
  goals?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsEnum(StudentExperienceLevel)
  experienceLevel?: StudentExperienceLevel | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsEnum(StudentSessionType)
  preferredSession?: StudentSessionType | null;

  @IsOptional()
  @IsArray()
  @IsEnum(SessionFormat, { each: true })
  preferredFormats?: SessionFormat[];

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsObject()
  availabilityPreferences?: Record<string, unknown> | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsNumber()
  @IsLatitude()
  homeLatitude?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsNumber()
  @IsLongitude()
  homeLongitude?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsNumber()
  @Min(0)
  searchRadiusKm?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsString()
  neighborhood?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsString()
  city?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsString()
  timezone?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialtyIds?: string[]; // Array of specialty IDs for interests

  @IsOptional()
  @IsBoolean()
  autoComplete?: boolean; // Flag to auto-complete onboarding on final submission
}

export type StudentProfileResponse = {
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
  createdAt: Date;
  updatedAt: Date;
};
