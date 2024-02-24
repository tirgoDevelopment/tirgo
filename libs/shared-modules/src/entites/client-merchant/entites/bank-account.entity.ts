import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Currency } from '../../references/entities/currency.entity';
import { ClientMerchant } from './client-merchant.entity';

@Entity()
export class ClientBankAccount {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  account: string;

  @ManyToOne(() => Currency, (currency) => currency.bankAccounts)
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @ManyToOne(() => ClientMerchant, (ClientMerchant) => ClientMerchant.bankAccounts)
  @JoinColumn({ name: 'merchant_id' })
  clientMerchant: ClientMerchant;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @Column({ default: true })
  active?: boolean;
}
