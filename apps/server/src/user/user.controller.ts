import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { User as PrismaUser } from 'src/common/database/prisma-client';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto);
  // }

  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Returns the current user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser() user: PrismaUser) {
    console.log('USER ME');
    return this.userService.getOrCreateByClerkId(user.clerkUserId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Returns a list of all users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Returns the user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
