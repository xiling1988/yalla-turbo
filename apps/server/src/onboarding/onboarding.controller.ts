import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { OnboardingService } from './onboarding.service';
import { StudentProfileInput } from './dto/student-profile.dto';
import { TeacherProfileInput } from './dto/teacher-profile.dto';

@ApiTags('Onboarding')
@ApiBearerAuth('JWT-auth')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get onboarding progress' })
  @ApiResponse({
    status: 200,
    description: 'Returns the onboarding progress for the current user',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async me(@CurrentUser('id') userId: string) {
    return this.onboarding.getProgress(userId);
  }

  @Patch('student')
  @ApiOperation({ summary: 'Update student profile' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({
    status: 200,
    description: 'Student profile updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateStudent(
    @CurrentUser('id') userId: string,
    @Body() payload: StudentProfileInput,
  ) {
    return this.onboarding.upsertStudentProfile(userId, payload);
  }

  @Patch('teacher')
  @ApiOperation({ summary: 'Update teacher profile' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({
    status: 200,
    description: 'Teacher profile updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateTeacher(
    @CurrentUser('id') userId: string,
    @Body() payload: TeacherProfileInput,
  ) {
    return this.onboarding.upsertTeacherProfile(userId, payload);
  }

  @Patch('role')
  @ApiOperation({ summary: 'Set intended role' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        intendedRole: {
          type: 'string',
          enum: ['STUDENT', 'TEACHER'],
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Role set successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async setRole(
    @CurrentUser('id') userId: string,
    @Body() body: { intendedRole: 'STUDENT' | 'TEACHER' },
  ) {
    return this.onboarding.setIntendedRole(userId, body.intendedRole);
  }

  @Delete('role')
  @ApiOperation({ summary: 'Clear intended role' })
  @ApiResponse({ status: 200, description: 'Role cleared successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async clearRole(@CurrentUser('id') userId: string) {
    return this.onboarding.clearIntendedRole(userId);
  }

  @Post('complete')
  @ApiOperation({ summary: 'Mark onboarding as complete' })
  @ApiResponse({ status: 200, description: 'Onboarding marked as complete' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async complete(@CurrentUser('id') userId: string) {
    return this.onboarding.markComplete(userId);
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset onboarding progress' })
  @ApiResponse({ status: 200, description: 'Onboarding reset successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async reset(@CurrentUser('id') userId: string) {
    return this.onboarding.resetOnboarding(userId);
  }

  @Get('specialties')
  @ApiOperation({ summary: 'Get all specialties' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of all available specialties',
  })
  async getSpecialties() {
    return this.onboarding.getSpecialties();
  }
}
