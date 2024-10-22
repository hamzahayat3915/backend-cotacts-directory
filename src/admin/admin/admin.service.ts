// src/admin/admin.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminEntity } from './admin.entity/admin.entity';

@Injectable()
export class AdminService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>, // Inject the repository
  ) {}

  // Sign in method for admin authentication
  async signIn(signInDto: { email: string; password: string }) {
    const admin = await this.findAdminByEmail(signInDto.email);
    // Ensure admin exists and password matches
    if (!admin || (signInDto.password !== admin.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Create the payload for the JWT
    const payload = { sub: admin.id, role: 'admin' };
    
    // Return the signed JWT token
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Method to find admin by email
  private async findAdminByEmail(email: string): Promise<AdminEntity | undefined> {
    // Query the database using TypeORM's repository pattern
    return this.adminRepository.findOne({ where: { email } });
  }
}
