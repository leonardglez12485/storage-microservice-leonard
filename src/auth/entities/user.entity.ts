import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
} from 'typeorm';

import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  fullName: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('text', { default: ['user'] })
  roles: string[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}
