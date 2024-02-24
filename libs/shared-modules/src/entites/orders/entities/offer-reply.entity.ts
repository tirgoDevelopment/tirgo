import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Currency } from '../../references/entities/currency.entity';
import { User } from '../../users/user.entity';
import { Driver } from '../../driver/entities/driver.entity';
import { Order } from './order.entity';
import { OrderOffer } from './offer.entity';

@Entity()
export class OrderOfferReply {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @Column({ nullable: false })
  amount: number;

  @Column({ default: false })
  deleted: boolean;

  @Column({ default: false })
  canceled: boolean;

  @Column({ default: false })
  rejected: boolean;

  @ManyToOne(() => Driver, driver => driver.orderOfferReplies)
  driver: Driver;

  @OneToOne(() => OrderOffer, (orderOffer) => orderOffer.orderOfferReply)
  orderOffer?: OrderOffer;

  @ManyToOne(() => Order, order => order.driverOffers)
  order: Order;

  @ManyToOne(() => Currency, currency => currency.orderOffer)
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @ManyToOne(() => User, (user) => user.orders, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;


}