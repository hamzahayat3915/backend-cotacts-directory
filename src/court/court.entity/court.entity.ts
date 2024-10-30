// court.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
// import { ContactEntity } from 'src/contact/contact.entity';

@Entity()
export class CourtEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

//     @OneToMany(() => ContactEntity, contact => contact.court)
//     contacts: ContactEntity[]; // Relationship with contacts
}
