import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContactEntity } from './user-contacts.entity/user-contacts.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../auth/auth.entity/auth.entity';

interface CreateContactDto {
    name: string;
    phone: string;
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
        console.log(`Admin ID received: ${adminId}`);

        // Find admin by ID and check if isAdmin is true
        const admin = await this.userRepository.findOne({ where: { id: adminId, isAdmin: true } });
        if (!admin) {
            console.error(`Admin with ID ${adminId} not found or is not an admin.`);
            throw new NotFoundException('Admin not found');
        }

        console.log(`Admin found: ${admin.username}, setting emergency contact`);

        // Ensure only one emergency contact is visible to all
        if (createContactDto.isEmergency) {
            console.log(`Setting emergency contact for admin: ${admin.username}`);
            await this.contactRepository.update({ user: admin, isEmergency: true }, { isEmergency: false });
            createContactDto.isVisibleToAll = true; // Make it visible to all
        }

        const contact = this.contactRepository.create({ ...createContactDto, user: admin });
        return this.contactRepository.save(contact);
    }

    // Regular users can add contacts privately, and multiple contacts can be emergency contacts (private)
    async addUserContact(createContactDto: CreateContactDto, userId: number): Promise<ContactEntity> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }

        // Multiple emergency contacts allowed for regular users (private by default)
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
}
