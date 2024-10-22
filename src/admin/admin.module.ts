import { Module } from '@nestjs/common';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';
import { ContactsModule } from './contacts/contacts.module';
import { AdminEntity } from './admin/admin.entity/admin.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/user/auth/jwt.strategy/jwt.strategy';
@Module({
  controllers: [AdminController],
  providers: [AdminService,JwtStrategy],
  imports: [ContactsModule, TypeOrmModule.forFeature([AdminEntity]),
  JwtModule.register({
    secret: 'your-secret-key', // use a strong secret
    signOptions: { expiresIn: '1h' }, // set token expiration time
  }),
],
})
export class AdminModule {}
