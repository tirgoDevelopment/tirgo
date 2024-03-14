import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Permission } from './permission.entity';
import { User } from '../../users/user.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToOne(() => Permission, { cascade: true })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @OneToMany(() => User, user => user.role)
  users: User[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  deleted: boolean;
}