import { Column, CreateDateColumn, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Currency } from '../../references/entities/currency.entity';
import { Agent } from './agent.entity';

@Entity()
export class AgentBankAccount {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  account: string;

  @ManyToOne(() => Currency, (currency) => currency.bankAccounts)
  currency: Currency;

  @ManyToOne(() => Agent, (agent) => agent.bankAccounts)
  agent: Agent;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @Column({ default: true })
  active?: boolean;
}
