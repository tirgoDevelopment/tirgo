import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Currency } from '../references/entities/currency.entity';
import { User } from '../users/user.entity';

@Entity()
export class Account {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  account: string;

  @Column({ nullable: false })
  accountType: string;

  @ManyToOne(() => Currency, (currency) => currency.bankAccounts)
  currency: string;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @Column({ default: true })
  active?: boolean;
}
