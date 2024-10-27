import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContactEntity } from './user-contacts.entity/user-contacts.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../auth/auth.entity/auth.entity';
import * as XLSX from 'xlsx';
interface CreateContactDto {
    name: string;
    lastName?: string;
    middleInitial?: string;
    phone: string;
    address: string;
    email?: string;
    court?: string;
    locale?: string;
    branch?: string;
    isEmergency: boolean;
    isVisibleToAll?: boolean; // Optional field, only used for admin contacts
  }
@Injectable()
export class ContactsService {
    constructor(
        @InjectRepository(ContactEntity)
        private readonly contactRepository: Repository<ContactEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    // Admin can upload contacts and set one as an emergency contact visible to all
    async addAdminContact(createContactDto: CreateContactDto, adminId: number): Promise<ContactEntity> {

        // Find admin by ID and check if isAdmin is true
        const admin = await this.userRepository.findOne({ where: { id: adminId, isAdmin: true } });
        if (!admin) {
            console.error(`Admin with ID ${adminId} not found or is not an admin.`);
            throw new NotFoundException('Admin not found');
        }


        // Ensure only one emergency contact is visible to all
        if (createContactDto.isEmergency) {
            console.log(`Setting emergency contact for admin: ${admin.username}`);
            await this.contactRepository.update({ user: admin, isEmergency: true }, { isEmergency: false });
            createContactDto.isVisibleToAll = true; // Make it visible to all
        }

        const contact = this.contactRepository.create({ ...createContactDto, user: admin });
        console.log('added contact', contact);
        return this.contactRepository.save(contact);
    }

    // Regular users can add contacts privately, and multiple contacts can be emergency contacts (private)
    // async addUserContact(createContactDto: CreateContactDto, userId: string): Promise<ContactEntity> {
    //     const user = await this.userRepository.findOne({ where: { id: Number(userId) } });
    //     if (!user) {
    //         throw new Error('User not found');
    //     }

    //     // Multiple emergency contacts allowed for regular users (private by default)
    //     if (createContactDto.isEmergency) {
    //         createContactDto.isVisibleToAll = false; // Ensure private visibility for user contacts
    //     }

    //     const contact = this.contactRepository.create({ ...createContactDto, user });
    //     return this.contactRepository.save(contact);
    // }
    async addUserContact(createContactDto: CreateContactDto, userId: string): Promise<ContactEntity> {
        const user = await this.userRepository.findOne({ where: { id: Number(userId) } });
        if (!user) {
          throw new Error('User not found');
        }
      
        if (createContactDto.isEmergency) {
          createContactDto.isVisibleToAll = false; // Ensure private visibility for user contacts
        }
      
        const contact = this.contactRepository.create({ ...createContactDto, user });
        return this.contactRepository.save(contact);
      }
    // Get contacts visible to the public (Admin's emergency contacts)
    async getPublicContacts(): Promise<ContactEntity[]> {
        return this.contactRepository.find({ where: { isVisibleToAll: true } });
    }

    // Get user-specific contacts (private, including their emergency contacts)
    async getUserContacts(userId: number): Promise<ContactEntity[]> {
        return this.contactRepository.find({ where: { user: { id: userId } } });
    }
    async importContactsFromExcel(file: any): Promise<string> {
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0]; // Assuming you want to read the first sheet
        const sheet = workbook.Sheets[sheetName];
        const contacts: any[] = XLSX.utils.sheet_to_json(sheet); // Convert sheet data to JSON
    
        for (const contactData of contacts) {
            const { name, phone, address, court, locale, branch, lastName, middleInitial, email } = contactData;
    
            console.log(`Importing contact: ${name}, ${phone}, ${address}`);
    
            // Create the contact object and only add fields that are present in the imported data
            const createContactDto: CreateContactDto = {
                name,
                phone,
                address,
                isEmergency: false,
                isVisibleToAll: true, // Assuming you want to make emergency contacts visible to all
                ...(court && { court }), // Spread only if 'court' is defined
                ...(locale && { locale }),
                ...(branch && { branch }),
                ...(lastName && { lastName }),
                ...(middleInitial && { middleInitial }),
                ...(email && { email })
            };
    
            // Modify the logic to associate contacts with a specific admin or user if needed
            await this.addAdminContact(createContactDto, 1); // Change adminId as necessary
        }
    
        return 'Contacts imported successfully!';
    }
    // async importContactsFromExcel(file:any): Promise<string> {
    //     const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    //     const sheetName = workbook.SheetNames[0]; // Assuming you want to read the first sheet
    //     const sheet = workbook.Sheets[sheetName];
    //     const contacts: any[] = XLSX.utils.sheet_to_json(sheet); // Convert sheet data to JSON

    //     for (const contactData of contacts) {
    //         const { name, phone, address } = contactData;
    //        console.log(`Importing contact: ${name}, ${phone}, ${address}`);
    //         // Add logic to handle user association if needed
    //         const createContactDto: CreateContactDto = {
    //             name,
    //             phone,
    //             address,
    //             isEmergency: false,
    //             isVisibleToAll: true,
    //            // Assuming you want to make emergency contacts visible to all
    //         };

    //         // Here you could modify the logic to associate contacts with a specific admin or user
    //         await this.addAdminContact(createContactDto, 1); // Change adminId as necessary
    //     }

    //     return 'Contacts imported successfully!';
    // }

    // Edit an admin contact
    async editAdminContact(id: number, updateContactDto: { name?: string, phone?: string, isEmergency?: boolean, address?: string }): Promise<ContactEntity> {
        const contact = await this.contactRepository.findOne({ where: { id } });
        if (!contact) {
            throw new NotFoundException('Contact not found');
        }

        // Update contact details
        Object.assign(contact, updateContactDto);

        // Ensure the contact can be updated as emergency only if rules allow
        if (updateContactDto.isEmergency) {
            await this.contactRepository.update({ user: contact.user, isEmergency: true }, { isEmergency: false });
            contact.isVisibleToAll = true; // Make it visible to all if it's an emergency contact
        }

        return this.contactRepository.save(contact);
    }

    // Delete an admin contact
    async deleteAdminContact(id: number): Promise<any> {
        const contact = await this.contactRepository.findOne({ where: { id } });
        if (!contact) {
            throw new NotFoundException('Contact not found');
        }

     const res = await this.contactRepository.remove(contact);
     return res
    }

    async editUserContact(
        userId: number,
        contactId: number,
        updateContactDto: { name?: string; phone?: string; isEmergency?: boolean; address?: string }
    ): Promise<ContactEntity> {
        const contact = await this.contactRepository.findOne({
            where: { id: contactId, user: { id: userId } }
        });

        if (!contact) {
            throw new NotFoundException('Contact not found');
        }

        // Update contact details
        Object.assign(contact, updateContactDto);

        if (updateContactDto.isEmergency !== undefined) {
            contact.isVisibleToAll = false; // Ensure user contacts remain private
        }

        return this.contactRepository.save(contact);
    }

    // Delete a user contact
    async deleteUserContact(userId: number, contactId: number): Promise<any> {
        const contact = await this.contactRepository.findOne({
            where: { id: contactId, user: { id: userId } }
        });

        if (!contact) {
            throw new NotFoundException('Contact not found');
        }

        return this.contactRepository.remove(contact);
    }
    async addAdminEmergencyContact(createContactDto: { name: string, phone: string, address: string }): Promise<ContactEntity> {
        const admin = await this.userRepository.findOne({ where: { isAdmin: true } });
        if (!admin) {
            throw new NotFoundException('Admin not found');
        }

        // Check if there is already an emergency contact and update it
        await this.contactRepository.update(
            { user: admin, isEmergency: true },
            { isEmergency: false, isVisibleToAll: false }
        );

        // Create the new emergency contact and make it visible to all
        const emergencyContact = this.contactRepository.create({
            ...createContactDto,
            user: admin,
            isEmergency: true,
            isVisibleToAll: true,
        });

        return this.contactRepository.save(emergencyContact);
    }

    // Method to get the single admin emergency contact
    async getAdminEmergencyContact(): Promise<ContactEntity> {
        const emergencyContact = await this.contactRepository.findOne({
            where: { isEmergency: true, isVisibleToAll: true },
        });

        if (!emergencyContact) {
            throw new NotFoundException('No emergency contact found');
        }

        return emergencyContact;
    }
    async setEmergencyContact(contactId: number): Promise<ContactEntity> {
        // Step 1: Reset all existing emergency contacts
        await this.contactRepository.update(
            { isEmergency: true, isVisibleToAll: true },
            { isEmergency: false, isVisibleToAll: true }
        );

        // Step 2: Find the specified contact by ID
        const contact = await this.contactRepository.findOne({ where: { id: contactId } });
        if (!contact) {
            throw new NotFoundException('Contact not found');
        }

        // Step 3: Update the specified contact to be the emergency contact
        contact.isEmergency = true;
        // contact.isVisibleToAll = true;
        return this.contactRepository.save(contact);
    }

}
