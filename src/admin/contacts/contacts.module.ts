import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactsEntity } from './contacts.entity/contacts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContactsEntity])],
  controllers: [ContactsController],
  providers: [ContactsService]
})
export class ContactsModule {}
