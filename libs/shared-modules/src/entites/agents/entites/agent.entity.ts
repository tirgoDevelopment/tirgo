import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { AgentBankAccount } from './bank-account.entity';
import { Driver } from '../../driver/entities/driver.entity';
import { Transaction } from '../../transactions/transaction.entity';

@Entity()
export class Agent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, name: 'company_name' })
  companyName: string;

  @Column({ nullable: false, unique: true })
  username: string;

  @Column({ nullable: false, name: 'manager_last_name' })
  managerLastName: string;
  
  @Column({ nullable: true, name: 'manager_first_name' })
  managerFirstName: string;

  @Column({ nullable: false, name: 'legal_address' })
  legalAddress: string;

  @Column({ nullable: true, name: 'physical_address' })
  physicalAddress: string;

  @Column({ nullable: false, name: 'bank_branch_name' })
  bankBranchName: string;

  @Column({ nullable: false, name: 'registration_certificate_file_path' })
  registrationCertificateFilePath: string;

  @Column({ nullable: false, name: 'manager_passport_file_path' })
  managerPassportFilePath: string;

  @Column({ nullable: false })
  mfo: string;

  @Column({ nullable: false })
  oked: string;

  @Column({ nullable: false })
  inn: string;

  @Column({ nullable: false, name: 'phone_number' })
  phoneNumber: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.createdAgents)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ default: false })
  blocked: boolean;

  @Column({ name: 'blocked_at', nullable: true })
  blockedAt: Date;

  @ManyToOne(() => User, (user) => user.blockedAgents)
  @JoinColumn({ name: 'blocked_by' })
  blockedBy: User;

  @Column({ default: false })
  deleted: boolean;

  @OneToMany(() => AgentBankAccount, (agentBankAccount) => agentBankAccount.agent)
  bankAccounts?: AgentBankAccount[];

  @OneToMany(() => Driver, driver => driver.agent, { cascade: true })
  drivers: Driver[];

  @OneToMany(() => Transaction, (transaction) => transaction.agent)
  transactions: Transaction[];

  @OneToOne(() => User, (user) => user.agent, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) // This should be the primary key column of User
  user: User;
}