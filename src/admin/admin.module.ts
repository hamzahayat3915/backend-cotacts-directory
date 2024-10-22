import { Module } from '@nestjs/common';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';
import { ContactsModule } from './contacts/contacts.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [ContactsModule]
})
export class AdminModule {}
