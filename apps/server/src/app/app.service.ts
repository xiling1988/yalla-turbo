import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    console.log('Hello! The Yallasana API is alive ✨');
    return { message: 'Hello! The Yallasana API is alive ✨' };
  }
}
