import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TeacherService } from './teacher.service';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Teachers')
@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all teachers' })
  @ApiResponse({ status: 200, description: 'Returns a list of all teachers' })
  findAll() {
    return this.teacherService.findAll();
  }

  @Public()
  @Get('debug/:email')
  @ApiOperation({ summary: 'Debug teacher by email' })
  @ApiParam({ name: 'email', description: 'Teacher email address' })
  @ApiResponse({
    status: 200,
    description: 'Returns teacher debug information',
  })
  async debugTeacher(@Param('email') email: string) {
    return this.teacherService.debugTeacher(email);
  }

  @Public()
  @Get('raw')
  @ApiOperation({ summary: 'Get all teachers (raw data)' })
  @ApiResponse({ status: 200, description: 'Returns raw teacher data' })
  async findAllRaw() {
    return this.teacherService.findAllRaw();
  }
}
