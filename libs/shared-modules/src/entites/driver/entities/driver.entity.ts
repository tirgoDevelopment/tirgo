import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DriverTransport } from './driver-transport.entity';
import { User } from '../../users/user.entity';
import { Order } from '../../orders/entities/order.entity';
import { DriverPhoneNumber } from './driver-phonenumber.entity';
import { OrderOffer } from '../../orders/entities/offer.entity';
import { Agent } from '../../agents/entites/agent.entity';
import { Subscription } from '../../references/entities/subscription.entity';
import { Transaction } from '../../transactions/transaction.entity';
import { DriverMerchant } from '../../driver-merchant/entites/driver-merchant.entity';

@Entity()
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, name: 'first_name' })
  firstName: string;

  @Column({ nullable: false, name: 'last_name' })
  lastName: string;

  @Column({ nullable: true })
  citizenship?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true, name: 'passport_file_path' })
  passportFilePath?: string;

  @Column({ nullable: true, name: 'driver_license_file_path' })
  driverLicenseFilePath?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'subscribed_at' })
  subscribedAt: Date; 

  @Column({ type: 'timestamp', nullable: true, name: 'subscribed_till' })
  subscribedTill: Date;
  
  @Column({ nullable: true, name: 'otp_code' })
  otpCode: Date;

  @Column({ type: 'bigint', nullable: true, name: 'otp_sent_datetime' })
  otpSentDatetime: BigInt;  

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;  

  @ManyToOne(() => User, (user) => user.createdDrivers, { nullable: true }) 
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ default: false })
  blocked: boolean;

  @ManyToOne(() => User, (user) => user.blockedDrivers) 
  @JoinColumn({ name: 'blocked_by' })
  blockedBy: User;

  @Column({ name: 'blocked_at', nullable: true })
  blockedAt: Date;  

  @Column({ nullable: true, name: 'block_reason' })
  blockReason: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ name: 'verified_at', nullable: true })
  verifiedAt: Date;  

  @ManyToOne(() => User, (user) => user.verifiedDrivers) 
  @JoinColumn({ name: 'verified_by' })
  verifiedBy: User;

  @Column({ default: false })
  deleted: boolean;

  @ManyToOne(() => User, (user) => user.deletedDrivers) 
  @JoinColumn({ name: 'deleted_by' })
  deletedBy: User;

  @Column({ name: 'deleted_at', nullable: true })
  deletedAt: Date;  

  @OneToMany(() => DriverTransport, driverTransport => driverTransport.driver)
  driverTransports: DriverTransport[];

  @OneToMany(() => Order, order => order.client)
  orders: Order[];

  @OneToMany(() => OrderOffer, orderOffer => orderOffer.driver)
  orderOffers: OrderOffer[];

  @OneToMany(() => DriverPhoneNumber, phoneNumber => phoneNumber.driver, { cascade: true })
  phoneNumbers: DriverPhoneNumber[];

  @ManyToOne(() => Agent, Agent => Agent.drivers)
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @ManyToOne(() => Subscription, (subscription) => subscription.driver, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @OneToOne(() => User, (user) => user.driver, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => DriverMerchant, (driverMerchant) => driverMerchant.drivers)
  @JoinColumn({ name: 'driver_merchant_id' })
  driverMerchant: DriverMerchant;

  @OneToMany(() => Transaction, (transaction) => transaction.driver)
  transactions: Transaction[];
}