import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ClientBankAccount } from './bank-account.entity';
import { Order } from '../../orders/entities/order.entity';
import { ClientMerchantUser } from './client-merchant-user.entity';
import { User } from '../../users/user.entity';

@Entity()
export class ClientMerchant {
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

  @Column({ nullable: true, name: 'tax_payer_code' })
  taxPayerCode?: string;

  @Column({ nullable: true, name: 'responsible_person_phone_number' })
  responsbilePersonPhoneNumber?: string;

  @OneToMany(() => ClientBankAccount, (bankAccount) => bankAccount.clientMerchant)
  bankAccounts?: ClientBankAccount[];
  
  @OneToMany(() => Order, (order) => order.clientMerchant)
  orders?: Order[];

  @Column({ default: false })
  verified?: boolean;

  @Column({ default: false })
  rejected?: boolean;

  @Column({ nullable: true, name: 'rejected_at' })
  rejectedAt?: Date;

  @Column({ nullable: true, name: 'verified_by' })
  verifiedBy?: string;

  @Column({ nullable: true, name: 'verified_at' })
  verifiedAt?: Date;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt?: Date;

  @Column({ default: false })
  completed?: boolean;

  @Column({ default: false })
  deleted?: boolean;

  @Column({ default: true })
  active?: boolean;

  @OneToMany(() => ClientMerchantUser, clientMerchantUser => clientMerchantUser.clientMerchant)
  users: ClientMerchantUser[];

  @OneToOne(() => User, (user) => user.clientMerchant, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
