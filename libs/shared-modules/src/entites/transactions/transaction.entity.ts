import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Currency } from '../references/entities/currency.entity';
import { Driver } from '../driver/entities/driver.entity';
import { Agent } from '../agents/entites/agent.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  amount: number;

  @Column({ nullable: true, default: 0, name: 'tax_amount' })
  taxAmount: number;

  @Column({ nullable: true, default: 0, name: 'additional_amount' })
  additionalAmount: number;

  @Column({ nullable: false, name: 'transaction_type' })
  transactionType: string;

  @Column({ nullable: false, name: 'user_type' })
  userType: string;
  
  @Column({ nullable: true })
  comment: string;
  
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;  
  
  @Column({ default: false })
  rejected: boolean;
  
  @Column({ default: false, name: 'is_merchant' })
  isMerchant: boolean;

  @Column({ nullable: true, name: 'merchant_id' })
  merchantId: number;

  @Column({ default: false, name: 'is_agent' })
  isAgent: boolean;

  @Column({ default: false })
  verified: boolean;
  
  @Column({ default: false })
  deleted: boolean;

  @Column({ default: false })
  canceled: boolean;
  
  @ManyToOne(() => Currency, (currency) => currency.transactions)
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @ManyToOne(() => Driver, (driver) => driver.transactions)
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @ManyToOne(() => Agent, (agent) => agent.transactions)
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;
}