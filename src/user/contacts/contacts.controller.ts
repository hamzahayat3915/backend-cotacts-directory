import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ContactsService } from './contacts.service';

@Controller('contacts')
export class ContactsController {
    constructor(private readonly contactsService: ContactsService) {}

    // Admin can add a contact (including emergency)
    @Post('admin/add/:adminId')
    async addAdminContact(@Body() createContactDto: { name: string, phone: string, isEmergency: boolean }, @Param('adminId') adminId: number) {
        return this.contactsService.addAdminContact(createContactDto, adminId);
    }

    // User can add a contact (including emergency)
    @Post('user/add/:userId')
    async addUserContact(@Body() createContactDto: { name: string, phone: string, isEmergency: boolean }, @Param('userId') userId: number) {
        return this.contactsService.addUserContact(createContactDto, userId);
    }

    // Get public (admin) emergency contacts
    @Get('public')
    async getPublicContacts() {
        return this.contactsService.getPublicContacts();
    }

    // Get user-specific contacts (private, including emergency contacts)
    @Get('user/:userId')
    async getUserContacts(@Param('userId') userId: number) {
        return this.contactsService.getUserContacts(userId);
    }
}
