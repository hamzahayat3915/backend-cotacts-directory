import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ContactsEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
  
    @Column()
    phoneNumber: string;
  
    @Column({ default: false })
    isEmergencyContact: boolean;
  
    @Column({ default: true })
    isActive: boolean;
}
