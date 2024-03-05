import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Currency } from '../../references/entities/currency.entity';
import { DriverMerchant } from './driver-merchant.entity';

@Entity()
export class DriverBankAccount {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  account: string;

  @ManyToOne(() => Currency, (currency) => currency.bankAccounts)
  @JoinColumn({ name: 'currency_id' })
  currency: string;

  @ManyToOne(() => DriverMerchant, (driverMerchant) => driverMerchant.bankAccounts)
  driverMerchant: DriverMerchant;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @Column({ default: true })
  active?: boolean;
}
