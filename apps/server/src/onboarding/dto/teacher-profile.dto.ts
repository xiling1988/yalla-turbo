import { SessionFormat, TeacherTravelPolicy } from 'src/common/database/prisma-client';
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
  ValidateNested,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TeacherBaseInput {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsString()
  nickname?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsString()
  addressLine1?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsString()
  addressLine2?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsString()
  city?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsString()
  state?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsString()
  postalCode?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsString()
  countryCode?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsNumber()
  @IsLatitude()
  latitude?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsNumber()
  @IsLongitude()
  longitude?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsBoolean()
  isPrimary?: boolean | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsString()
  notes?: string | null;
}

export class TeacherProfileInput {
  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsString()
  displayName?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsString()
  headline?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsString()
  bio?: string | null; // Combined shortBio and about

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsNumber()
  @Min(0)
  yearsExperience?: number | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialtyIds?: string[]; // Array of specialty IDs

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsObject()
  certifications?: Record<string, unknown> | null;

  @IsOptional()
  @IsArray()
  @IsEnum(SessionFormat, { each: true })
  offeredFormats?: SessionFormat[];

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsNumber()
  @Min(1)
  sessionDurationMins?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsNumber()
  @Min(0)
  pricePerSession?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsString()
  currency?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsBoolean()
  acceptsPrivate?: boolean | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsBoolean()
  acceptsGroup?: boolean | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsEnum(TeacherTravelPolicy)
  travelPolicy?: TeacherTravelPolicy | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsNumber()
  @Min(0)
  travelRadiusKm?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsString()
  avatarUrl?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsString()
  timezone?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsObject()
  availability?: Record<string, unknown> | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeacherBaseInput)
  bases?: TeacherBaseInput[];

  @IsOptional()
  @IsBoolean()
  autoComplete?: boolean; // Flag to auto-complete onboarding on final submission
}

export type TeacherProfileResponse = {
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
  bases: TeacherBaseInput[];
  averageRating: number | null;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
};
