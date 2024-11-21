import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { Order } from './order.entity';
import { Client } from '../../clients/client.entity';
import { DriverOrderOffers } from './offer.entity';

@Entity()
export class ClientRepliesOrderOffer {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @ManyToOne(() => Client, client => client.orders, { nullable: false })
  client: Client;

  @Column({ nullable: false })
  amount: number;

  @Column({ nullable: true, name: 'description' })
  description: string;

  @OneToOne(() => DriverOrderOffers, (driverOrderOffers) => driverOrderOffers.clientReplyOrderOffer)
  driverOrderOffer: DriverOrderOffers;

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

}