import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactsEntity } from './contacts.entity/contacts.entity';
@Injectable()
export class ContactsService {
    constructor(@InjectRepository(ContactsEntity) private contactsRepository: Repository<ContactsEntity>) { }

    findAll(): Promise<ContactsEntity[]> {
        return this.contactsRepository.find();
    }

    findOne(id: number): Promise<ContactsEntity> {
        return this.contactsRepository.findOne({ where: { id } });
    }

    async remove(id: string): Promise<void> {
        await this.contactsRepository.delete(id);
    }

    async create(contact: ContactsEntity): Promise<ContactsEntity> {
        return this.contactsRepository.save(contact);
    }
}
