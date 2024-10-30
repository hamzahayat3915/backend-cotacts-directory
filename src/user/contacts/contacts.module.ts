import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactEntity } from './user-contacts.entity/user-contacts.entity';
import { UserEntity } from '../auth/auth.entity/auth.entity';
import { CloudinaryProvider } from 'src/cloudinary.provider';

@Module({
  controllers: [ContactsController],
  providers: [ContactsService, CloudinaryProvider],
  imports: [TypeOrmModule.forFeature([ContactEntity, UserEntity]) ]
})
export class ContactsModule {}
