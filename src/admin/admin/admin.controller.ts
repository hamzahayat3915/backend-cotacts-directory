import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('signin')
  async signIn(@Body() signInDto: { email: string; password: string }) {
    return this.adminService.signIn(signInDto);
  }
}