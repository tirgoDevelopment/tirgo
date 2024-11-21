import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Currency } from '../../references/entities/currency.entity';
import { User } from '../../users/user.entity';
import { Driver } from '../../driver/entities/driver.entity';
import { Order } from './order.entity';
import { ClientRepliesOrderOffer } from './client-reply-order-offer.entity';

@Entity()
export class DriverOrderOffers {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @Column({ nullable: false })
  amount: number;

  @ManyToOne(() => Currency, currency => currency.orderOffer, { nullable: false })
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @Column({ nullable: true, name: 'description' })
  description: string;

  @Column({ nullable: true, name: 'request_index', default: 1 })
  requestIndex: number;

  @Column({ nullable: true, name: 'is_replied', default: false })
  isReplied: boolean;

  @OneToOne(() => ClientRepliesOrderOffer, (clientReplyOrderOffer) => clientReplyOrderOffer.driverOrderOffer, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_reply_id' })
  clientReplyOrderOffer: ClientRepliesOrderOffer;

  @ManyToOne(() => Driver, driver => driver.orderOffers)
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @ManyToOne(() => Order, order => order.driverOrderOffers)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.createdDriverOrderOffers, { nullable: false })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'is_canceled', default: false })
  isCanceled: boolean;

  @Column({ type: 'timestamp', name: 'canceled_at', nullable: true })
  canceledAt: Date;

  @ManyToOne(() => User, (user) => user.canceledDriverOrderOffers, { nullable: true })
  @JoinColumn({ name: 'canceled_by_id' })
  canceledBy: User;
  
  @Column({ nullable: true, name: 'cancel_reason' })
  cancelReason: string;

  @Column({ name: 'is_rejected', default: false })
  isRejected: boolean;

  @Column({ type: 'timestamp', name: 'rejected_at', nullable: true })
  rejectedAt: Date;

  @ManyToOne(() => User, (user) => user.rejectedDriverOrderOffers, { nullable: true })
  @JoinColumn({ name: 'rejected_by_id' })
  rejectedBy: User;
  
  @Column({ nullable: true, name: 'reject_reason' })
  rejectReason: string;

  @Column({ name: 'is_accepted', default: false })
  isAccepted: boolean;

  @Column({ type: 'timestamp', name: 'accepted_at', nullable: true })
  acceptedAt: Date;

  @ManyToOne(() => User, (user) => user.acceptedDriverOrderOffers, { nullable: true })
  @JoinColumn({ name: 'accepted_by_id' })
  acceptedBy: User;
  
  @Column({ nullable: true, name: 'accept_reason' })
  acceptReason: string;

  @Column({ name: 'is_finished', default: false })
  isFinished: boolean;

  @Column({ type: 'timestamp', name: 'finished_at', nullable: true })
  finishedAt: Date;

  @ManyToOne(() => User, (user) => user.finishedDriverOrderOffers, { nullable: true })
  @JoinColumn({ name: 'finished_by_id' })
  finishedBy: User;
  
}