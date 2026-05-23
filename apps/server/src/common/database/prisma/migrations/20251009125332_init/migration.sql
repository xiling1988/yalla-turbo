-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PENDING', 'STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "IntendedRole" AS ENUM ('STUDENT', 'TEACHER');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "OnboardingStep" AS ENUM ('NONE', 'ROLE_SELECTED', 'PROFILE_DETAILS', 'DONE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "displayName" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PENDING',
    "intendedRole" "IntendedRole",
    "onboardingStep" "OnboardingStep" NOT NULL DEFAULT 'NONE',
    "profileComplete" BOOLEAN NOT NULL DEFAULT false,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "signedUpAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roleSelectedAt" TIMESTAMP(3),
    "profileDoneAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerkUserId_idx" ON "User"("clerkUserId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_intendedRole_idx" ON "User"("intendedRole");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_userId_key" ON "TeacherProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- AddForeignKey
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
