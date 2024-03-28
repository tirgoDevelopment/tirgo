import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Timestamp } from 'typeorm';
import { Role } from './role.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @ApiProperty({ required: true })
  @Column({ nullable: false, default: false, name: 'add_driver' })
  addDriver: boolean;

  @ApiProperty({ required: true })
  @Column({ nullable: false, default: false, name: 'add_client' })
  addClient: boolean;

  @ApiProperty({ required: true })
  @Column({ nullable: false, default: false, name: 'add_order' })
  addOrder: boolean;

  @ApiProperty({ required: true })
  @Column({ nullable: false, default: false, name: 'cancel_order' })
  cancelOrder: boolean;

  @ApiProperty({ required: true })
  @Column({ nullable: false, default: false, name: 'see_drivers_info' })
  seeDriversInfo: boolean;

  @ApiProperty({ required: true })
  @Column({ nullable: false, default: false, name: 'see_client_info' })
  seeClientsInfo: boolean;

  @ApiProperty({ required: true })
  @Column({ nullable: false, default: false, name: 'send_push' })
  sendPush: boolean;

  @ApiProperty({ required: true })
  @Column({ nullable: false, default: false })
  chat: boolean;

  @ApiProperty({ required: true })
  @Column({ nullable: false, default: false })
  tracking: boolean;

  @ApiProperty({ required: true })
  @Column({ nullable: false, default: false, name: 'driver_finance' })
  driverFinance: boolean;

  @ApiProperty({ required: true })
  @Column({ nullable: false, default: false, name: 'client_merchant_finance' })
  clientMerchantFinance: boolean;

  @ApiProperty({ required: true })
  @Column({ nullable: false, default: false, name: 'driver_merchant_finance' })
  driverMerchantFinance: boolean;

  @ApiProperty({ required: true })
  @Column({ nullable: false, default: false, name: 'register_client_merchant' })
  registerClientMerchant: boolean;

  @ApiProperty({ required: true })
  @Column({ nullable: false, default: false, name: 'register_driver_merchant' })
  registerDriverMerchant: boolean;

  @ApiProperty({ required: true })
  @Column({ nullable: false, default: false, name: 'verify_order' })
  verifyDriver: boolean;

  @ApiProperty({ required: true })
  @Column({ nullable: false, default: false, name: 'client_merchant_list' })
  clientMerchantList: boolean;

  @ApiProperty({ required: true })
  @Column({ nullable: false, default: false, name: 'driver_merchant_list' })
  driverMerchantList: boolean;

  @ApiProperty({ required: true })
  @Column({ nullable: false, default: false, name: 'admin_page' })
  adminPage: boolean;

  @ApiProperty({ required: true })
  @Column({ nullable: false, default: false, name: 'fin_request' })
  finRequest: boolean;

  @ApiProperty({ required: true })
  @Column({ nullable: false, default: false, name: 'driver_merchant_page' })
  driverMerchantPage: boolean;

  @ApiProperty({ required: true })
  @Column({ nullable: false, default: false, name: 'client_merchant_page' })
  clientMerchantPage: boolean;

  @ApiProperty({ required: true })
  @Column({ nullable: false, default: false, name: 'driver_verification' })
  driverVerification: boolean;

  @ApiProperty({ required: true })
  @Column({ nullable: false, default: false, name: 'agent_page' })
  agentPage: boolean;

  @Column({ nullable: false, default: false, name: 'dashboard_page' })
  @ApiProperty({ required: true })
  dashboardPage : boolean;
  
  @Column({ nullable: false, default: false, name: 'archive_page' })
  @ApiProperty({ required: true })
  archivedPage: boolean;

  @Column({ nullable: false, default: false, name: 'order_page' })
  @ApiProperty({ required: true })
  orderPage: boolean;
  
  @Column({ nullable: false, default: false, name: 'references_page' })
  @ApiProperty({ required: true })
  referencesPage: boolean;
  
  @Column({ nullable: false, default: false, name: 'active_page' })
  @ApiProperty({ required: true })
  activePage: boolean;
  
  @Column({ nullable: false, default: false, name: 'admin_agent_page' })
  @ApiProperty({ required: true })
  adminAgentPage: boolean;
  
  @Column({ nullable: false, default: false, name: 'attach_driver_agent' })
  @ApiProperty({ required: true })
  attachDriverAgent: boolean;
  
  @Column({ nullable: false, default: false, name: 'add_balance_agent' })
  @ApiProperty({ required: true })
  addBalanceAgent: boolean;
  
  @Column({ nullable: false, default: false, name: 'see_subscription_transaction_agent' })
  @ApiProperty({ required: true })
  seeSubscriptionTransactionAgent: boolean;
  
  @Column({ nullable: false, default: false, name: 'see_payment_transaction_admin' })
  @ApiProperty({ required: true })
  seePaymentTransactionAdmin: boolean;
  
  @Column({ nullable: false, default: false, name: 'see_service_transaction_admin' })
  @ApiProperty({ required: true })
  seeServiceTransactionAdmin: boolean;

  @OneToOne(() => Role, (role) => role.permission, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  deleted: boolean;

}