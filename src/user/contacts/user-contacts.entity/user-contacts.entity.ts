import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, OneToMany, ManyToOne } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/user/auth/auth.entity/auth.entity';
@Entity()
export class UserContactsEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
  
    @Column()
    phoneNumber: string;
  
    @Column({ default: false })
    isEmergencyContact: boolean; // Can be marked by admin or user
  
}
