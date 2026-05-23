import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get hello message' })
  @ApiResponse({ status: 200, description: 'Returns a hello message' })
  getHello() {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Returns health status' })
  getHealth() {
    return {
      status: 'OK',
      message: 'The Yallasana API is alive ✨. Aliases are magic!',
    };
  }
}
