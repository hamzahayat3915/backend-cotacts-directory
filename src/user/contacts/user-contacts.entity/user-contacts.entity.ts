import { UserEntity } from 'src/user/auth/auth.entity/auth.entity';
import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, OneToMany, ManyToOne } from 'typeorm';
@Entity()
export class ContactEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    phone: string;
    @Column()
    address: string;
    @Column({ default: false })
    isEmergency: boolean; // Emergency contact flag

    @Column({ default: false })
    isVisibleToAll: boolean; // Admin emergency contact visibility

    @ManyToOne(() => UserEntity, user => user.contacts)
    user: UserEntity; // Relationship with the user
    @Column({ nullable: true })
    court: string;

    @Column({ nullable: true })
    locale: string;

    @Column({ nullable: true })
    branch: string;
    @Column({ nullable: true })
    lastName: string;
    @Column({ nullable: true })
    middleInitial: string;

    @Column({ nullable: true })
    email: string;
}
