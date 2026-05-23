import { User } from '@clerk/backend';
import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Auth')
@ApiBearerAuth('JWT-auth')
@Controller('auth')
export class AuthController {
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current authenticated user',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser() user: User) {
    return user;
  }
}
