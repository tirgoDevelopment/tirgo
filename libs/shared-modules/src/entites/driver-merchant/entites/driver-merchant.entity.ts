import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DriverBankAccount } from './bank-account.entity';
import { Order } from '../../orders/entities/order.entity';
import { DriverMerchantUser } from './driver-merchant-user.entity';
import { User } from '../../users/user.entity';
import { Driver } from '../../driver/entities/driver.entity';
import { Transaction } from '../../transactions/transaction.entity';

@Entity()
export class DriverMerchant {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: true, name: 'phone_number' })
  phoneNumber: string;

  @Column({ nullable: false, name: 'company_name' })
  companyName: string;

  @Column({ nullable: false, name: 'company_type' })
  companyType: string;

  @Column({ nullable: true, name: 'responsible_person_last_name' })
  responsiblePersonLastName: string;

  @Column({ nullable: true, name: 'responsible_person_first_name' })
  responsiblePersonFistName: string;

  @Column({ nullable: true, name: 'registration_certificate_file_path' })
  registrationCertificateFilePath?: string;

  @Column({ nullable: true, name: 'passport_file_path' })
  passportFilePath?: string;

  @Column({ nullable: true, name: 'transportation_certificate_file_path' })
  transportationCertificateFilePath?: string;

  @Column({ nullable: true, name: 'logo_file_path' })
  logoFilePath?: string;

  @Column({ nullable: true })
  notes?: string;

  @Column({ nullable: true })
  mfo?: string;

  @Column({ nullable: true })
  inn?: string;

  @Column({ nullable: true })
  oked?: string;

  @Column({ nullable: true, name: 'duns_number', type: 'bigint' })
  dunsNumber?: number;

  @Column({ nullable: true, name: 'iban_number', type: 'bigint' })
  ibanNumber?: number;

  @Column({ nullable: true, name: 'supervisor_first_name' })
  supervisorFirstName?: string;

  @Column({ nullable: true, name: 'speervisor_last_name' })
  supervisorLastName?: string;

  @Column({ nullable: true, name: 'egal_address' })
  legalAddress?: string;

  @Column({ nullable: true, name: 'fact_address' })
  factAddress?: string;

  @Column({ nullable: true, name: 'bank_name' })
  bankName?: string;

  @Column({ nullable: true, name: 'bank_branch_name' })
  bankBranchName?: string;

  @Column({ nullable: true, name: 'postal_code' })
  postalCode: string;

  @Column({ nullable: true, name: 'garage_address' })
  garageAddress: string;

  @Column({ nullable: true, name: 'tax_payer_code' })
  taxPayerCode?: string;

  @Column({ nullable: true, name: 'responsible_person_phone_number' })
  responsbilePersonPhoneNumber?: string;

  @OneToMany(() => DriverBankAccount, (bankAccount) => bankAccount.driverMerchant)
  bankAccounts?: DriverBankAccount[];
  
  @OneToMany(() => Order, (order) => order.clientMerchant)
  orders?: Order[];

  @Column({ default: false })
  verified?: boolean;

  @Column({ default: false })
  deleted?: boolean;

  @Column({ name: "deleted_at", nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => User, (user) => user.deletedDriverMerchants)
  @JoinColumn({ name: 'deleted_by' })
  deletedBy: User;

  @Column({ name: "verified_at", nullable: true })
  verifiedAt?: Date;

  @ManyToOne(() => User, (user) => user.verifiedDriverMerchants)
  @JoinColumn({ name: 'verified_by' })
  verifiedBy: User;

  @Column({ default: false })
  rejected?: boolean;

  @Column({ name: "rejected_at", nullable: true })
  rejectedAt?: Date;

  @ManyToOne(() => User, (user) => user.rejectedDriverMerchants)
  @JoinColumn({ name: 'rejected_by' })
  rejectedBy: User;

  @Column({ default: false })
  blocked?: boolean;

  @Column({ name: "blocked_at", nullable: true })
  blockedAt?: Date;

  @ManyToOne(() => User, (user) => user.blockedDriverMerchants)
  @JoinColumn({ name: 'blocked_by' })
  blockedBy: User;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt?: Date;

  @Column({ default: false })
  completed?: boolean;

  @OneToMany(() => DriverMerchantUser, driverMerchantUser => driverMerchantUser.driverMerchant)
  users: DriverMerchantUser[];

  @OneToMany(() => Driver, driverMerchantUser => driverMerchantUser.driverMerchant)
  drivers: Driver[];

  @OneToMany(() => Transaction, (transaction) => transaction.agent)
  transactions: Transaction[];

  @OneToOne(() => User, (user) => user.driverMerchant, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
