import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../../role/entities/role.entity';
import { ClientMerchant } from './client-merchant.entity';
import { User } from '../../users/user.entity';

@Entity()
export class ClientMerchantUser {
  @PrimaryGeneratedColumn("increment")
  id?: number;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: false, unique: true })
  username: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  email?: string;

  @ManyToOne(() => ClientMerchant, (ClientMerchant) => ClientMerchant.users)
  @JoinColumn({ name: 'merchant_id' })
  clientMerchant: ClientMerchant;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @Column({ default: new Date() })
  lastLogin?: Date;

  @Column({ nullable: true })
  resetPasswordCodeSentDate?: string;

  @Column({ nullable: true })
  resetPasswordCode?: string;

  @Column({ default: true })
  active?: boolean;
  
  @Column({ default: false })
  disabled?: boolean;

  @Column({ default: false })
  deleted?: boolean;

  @OneToOne(() => User, (user) => user.clientMerchantUser, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
