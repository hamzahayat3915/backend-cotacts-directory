import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './auth.entity/auth.entity';
import { JwtStrategy } from './jwt.strategy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [TypeOrmModule.forFeature([UserEntity]),
  JwtModule.register({
    secret: process.env.JWT_SECRET || 'your-secret-key', // Use your secret key or configure it via environment variables
    signOptions: { expiresIn: '60s' }, // Configure as needed
  }),
],
})
export class AuthModule {}
