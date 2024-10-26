import { Controller, Post, Get, Body, Param, UploadedFile, UseInterceptors, Put, Delete } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('contacts')
export class ContactsController {
    constructor(private readonly contactsService: ContactsService) {}

    // Admin can add a contact (including emergency)
    @Post('admin/add')
    async addAdminContact(@Body() createContactDto: { name: string, phone: string, isEmergency: boolean , address:string}) {
        return this.contactsService.addAdminContact(createContactDto, 1);
    }

    // User can add a contact (including emergency)
    @Post('user/add/:userId')
    async addUserContact(@Body() createContactDto: { name: string, phone: string, isEmergency: boolean, address:string }, @Param('userId') userId: string) {
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

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadContacts(@UploadedFile() file: any) {
        return this.contactsService.importContactsFromExcel(file);
    }

     // Edit an admin contact
     @Put('admin/edit/:id')
     async editAdminContact(@Param('id') id: number, @Body() updateContactDto: { name?: string, phone?: string, isEmergency?: boolean, address?: string }) {
         return this.contactsService.editAdminContact(id, updateContactDto);
     }
 
     // Delete an admin contact
     @Delete('admin/delete/:id')
     async deleteAdminContact(@Param('id') id: number) {
         return this.contactsService.deleteAdminContact(id);
     }

     @Put('user/edit/:userId/:contactId')
     async editUserContact(
         @Param('userId') userId: number,
         @Param('contactId') contactId: number,
         @Body() updateContactDto: { name?: string; phone?: string; isEmergency?: boolean; address?: string }
     ) {
         return this.contactsService.editUserContact(userId, contactId, updateContactDto);
     }
 
     // Delete a user contact
     @Delete('user/delete/:userId/:contactId')
     async deleteUserContact(
         @Param('userId') userId: number,
         @Param('contactId') contactId: number
     ) {
         return this.contactsService.deleteUserContact(userId, contactId);
     }

     @Put('admin/emergency/:id')
    async setEmergencyContact(@Param('id') contactId: number) {
        return this.contactsService.setEmergencyContact(contactId);
    }

    // Get the single admin emergency contact
    @Get('admin/emergency')
    async getAdminEmergencyContact() {
        return this.contactsService.getAdminEmergencyContact();
    }
}
