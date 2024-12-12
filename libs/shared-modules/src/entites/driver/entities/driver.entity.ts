import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DriverTransport } from './driver-transport.entity';
import { User } from '../../users/user.entity';
import { Order } from '../../orders/entities/order.entity';
import { DriverPhoneNumber } from './driver-phone-number.entity';
import { DriverOrderOffers } from '../../orders/entities/offer.entity';
import { Agent } from '../../agents/entites/agent.entity';
import { Subscription } from '../../references/entities/subscription.entity';
import { Transaction } from '../../transactions/transaction.entity';
import { DriverMerchant } from '../../driver-merchant/entites/driver-merchant.entity';
import { DriverDocuments } from './driver-documents.entity';
import { DriversServicesRequests } from './drivers-services-requests.entity';
import { TmsReqestToDriver } from './driver-tms-request.entity';

@Entity()
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, name: 'first_name' })
  firstName: string;

  @Column({ nullable: false, name: 'last_name' })
  lastName: string;

  @Column({ nullable: true, name: 'birthday_date' })
  birthdayDate?: Date;
  
  @Column({ nullable: true })
  citizenship?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true, name: 'is_own_balance', default: true })
  isOwnBalance?: boolean;

  @Column({ nullable: true, name: 'is_own_service', default: true })
  isOwnService?: boolean;

  @Column({ nullable: true, name: 'is_own_order', default: true })
  isOwnOrder?: boolean;

  @Column({ nullable: true, name: 'is_kz_paid_way', default: false })
  isKzPaidWay?: boolean;

  @OneToOne(() => DriverDocuments, (document) => document.driverId, { cascade: true, onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'profile_file_id' })
  profileFile?: DriverDocuments;

  @OneToOne(() => DriverDocuments, (document) => document.driverId, { cascade: true, onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'passport_file_id' })
  passportFile?: DriverDocuments;

  @OneToOne(() => DriverDocuments, (document) => document.driverId, { cascade: true, onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'driver_license_file_id' })
  driverLicenseFile?: DriverDocuments;

  @OneToMany(() => TmsReqestToDriver, (driver) => driver.driver, { nullable: true })
  tmsRequests: TmsReqestToDriver[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;  

  @ManyToOne(() => User, (user) => user.createdDrivers, { nullable: true }) 
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ default: false, name: 'is_blocked' })
  isBlocked: boolean;

  @ManyToOne(() => User, (user) => user.blockedDrivers, { nullable: true }) 
  @JoinColumn({ name: 'blocked_by_id' })
  blockedBy: User;

  @Column({ name: 'blocked_at', nullable: true })
  blockedAt: Date;  

  @Column({ nullable: true, name: 'block_reason' })
  blockReason: string;

  @Column({ default: false, name: 'is_verified' })
  isVerified: boolean;

  @Column({ name: 'verified_at', nullable: true })
  verifiedAt: Date;  

  @ManyToOne(() => User, (user) => user.verifiedDrivers, { nullable: true }) 
  @JoinColumn({ name: 'verified_by_id' })
  verifiedBy: User;

  @Column({ default: false, name: 'is_deleted' })
  isDeleted: boolean;

  @ManyToOne(() => User, (user) => user.deletedDrivers, { nullable: true }) 
  @JoinColumn({ name: 'deleted_by_id' })
  deletedBy: User;

  @Column({ name: 'deleted_at', nullable: true })
  deletedAt: Date;  

  //relations
  @OneToMany(() => DriverPhoneNumber, phoneNumber => phoneNumber.driver, { cascade: true })
  phoneNumbers: DriverPhoneNumber[];

  @OneToMany(() => DriverTransport, driverTransport => driverTransport.driver)
  driverTransports: DriverTransport[];

  @OneToMany(() => Order, order => order.client)
  orders: Order[];

  @OneToMany(() => DriversServicesRequests, driversServicesRequests => driversServicesRequests.driver)
  servicesRequests: DriversServicesRequests[];

  @OneToMany(() => DriverOrderOffers, orderOffer => orderOffer.driver)
  orderOffers: DriverOrderOffers[];

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