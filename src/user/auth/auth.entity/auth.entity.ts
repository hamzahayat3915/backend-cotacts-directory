import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ContactEntity } from 'src/user/contacts/user-contacts.entity/user-contacts.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  username: string;

  @Column({ default: false })
  isAdmin: boolean;
  @Column({ nullable: true })
  court: string;
  @Column({ nullable: true })
  branch: string;
  @OneToMany(() => ContactEntity, contact => contact.user)
  contacts: ContactEntity[]
  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }


}
