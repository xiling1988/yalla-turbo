-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "StudentExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "StudentSessionType" AS ENUM ('IN_PERSON', 'LIVE_VIRTUAL', 'ON_DEMAND');

-- CreateEnum
CREATE TYPE "TeacherTravelPolicy" AS ENUM ('NONE', 'STUDENT_LOCATION', 'TEACHER_BASE_ONLY', 'HYBRID');

-- CreateEnum
CREATE TYPE "SessionFormat" AS ENUM ('IN_STUDIO', 'AT_HOME', 'VIRTUAL');

-- CreateEnum
CREATE TYPE "TeacherProficiencyLevel" AS ENUM ('CORE', 'SPECIALIST', 'EXPERT');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "profileComplete",
DROP COLUMN "profileDoneAt",
ADD COLUMN     "onboardingStartedAt" TIMESTAMP(3),
ADD COLUMN     "profileCompletedAt" TIMESTAMP(3),
ADD COLUMN     "profileStatus" "ProfileStatus" NOT NULL DEFAULT 'NOT_STARTED';

-- AlterTable
ALTER TABLE "TeacherProfile" ADD COLUMN     "about" TEXT,
ADD COLUMN     "acceptsGroup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "acceptsPrivate" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "availability" JSONB,
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "averageRating" DECIMAL(3,2),
ADD COLUMN     "certifications" JSONB,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currency" TEXT DEFAULT 'USD',
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "headline" TEXT,
ADD COLUMN     "pricePerSession" DECIMAL(8,2),
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sessionDurationMins" INTEGER,
ADD COLUMN     "shortBio" TEXT,
ADD COLUMN     "timezone" TEXT,
ADD COLUMN     "travelPolicy" "TeacherTravelPolicy",
ADD COLUMN     "travelRadiusKm" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "yearsExperience" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "availabilityPreferences" JSONB,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "experienceLevel" "StudentExperienceLevel",
ADD COLUMN     "goals" TEXT,
ADD COLUMN     "homeLatitude" DECIMAL(10,7),
ADD COLUMN     "homeLongitude" DECIMAL(10,7),
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "preferredSession" "StudentSessionType",
ADD COLUMN     "searchRadiusKm" INTEGER,
ADD COLUMN     "shortBio" TEXT,
ADD COLUMN     "timezone" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "TeacherBase" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "nickname" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "countryCode" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Specialty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherSpecialty" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,
    "proficiency" "TeacherProficiencyLevel",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherSpecialty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentSpecialtyInterest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentSpecialtyInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherLanguage" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentLanguagePreference" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentLanguagePreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherSessionFormat" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "format" "SessionFormat" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherSessionFormat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentSessionFormat" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "format" "SessionFormat" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentSessionFormat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeacherBase_teacherId_idx" ON "TeacherBase"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "Specialty_name_key" ON "Specialty"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Specialty_slug_key" ON "Specialty"("slug");

-- CreateIndex
CREATE INDEX "TeacherSpecialty_specialtyId_idx" ON "TeacherSpecialty"("specialtyId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherSpecialty_teacherId_specialtyId_key" ON "TeacherSpecialty"("teacherId", "specialtyId");

-- CreateIndex
CREATE INDEX "StudentSpecialtyInterest_specialtyId_idx" ON "StudentSpecialtyInterest"("specialtyId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSpecialtyInterest_studentId_specialtyId_key" ON "StudentSpecialtyInterest"("studentId", "specialtyId");

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Language_name_key" ON "Language"("name");

-- CreateIndex
CREATE INDEX "TeacherLanguage_languageId_idx" ON "TeacherLanguage"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherLanguage_teacherId_languageId_key" ON "TeacherLanguage"("teacherId", "languageId");

-- CreateIndex
CREATE INDEX "StudentLanguagePreference_languageId_idx" ON "StudentLanguagePreference"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentLanguagePreference_studentId_languageId_key" ON "StudentLanguagePreference"("studentId", "languageId");

-- CreateIndex
CREATE INDEX "TeacherSessionFormat_format_idx" ON "TeacherSessionFormat"("format");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherSessionFormat_teacherId_format_key" ON "TeacherSessionFormat"("teacherId", "format");

-- CreateIndex
CREATE INDEX "StudentSessionFormat_format_idx" ON "StudentSessionFormat"("format");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSessionFormat_studentId_format_key" ON "StudentSessionFormat"("studentId", "format");

-- AddForeignKey
ALTER TABLE "TeacherBase" ADD CONSTRAINT "TeacherBase_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSpecialty" ADD CONSTRAINT "TeacherSpecialty_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSpecialty" ADD CONSTRAINT "TeacherSpecialty_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSpecialtyInterest" ADD CONSTRAINT "StudentSpecialtyInterest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSpecialtyInterest" ADD CONSTRAINT "StudentSpecialtyInterest_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherLanguage" ADD CONSTRAINT "TeacherLanguage_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherLanguage" ADD CONSTRAINT "TeacherLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentLanguagePreference" ADD CONSTRAINT "StudentLanguagePreference_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentLanguagePreference" ADD CONSTRAINT "StudentLanguagePreference_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSessionFormat" ADD CONSTRAINT "TeacherSessionFormat_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSessionFormat" ADD CONSTRAINT "StudentSessionFormat_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

