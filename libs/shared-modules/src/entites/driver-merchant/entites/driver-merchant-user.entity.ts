import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DriverMerchant } from './driver-merchant.entity';
import { User } from '../../users/user.entity';

@Entity()
export class DriverMerchantUser {
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
  
  @ManyToOne(() => DriverMerchant, (driverMerchant) => driverMerchant.users)
  driverMerchant: DriverMerchant;

  @OneToOne(() => User, (user) => user.driverMerchantUser, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
