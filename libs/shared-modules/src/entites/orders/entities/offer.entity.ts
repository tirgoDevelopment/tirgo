import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Currency } from '../../references/entities/currency.entity';
import { User } from '../../users/user.entity';
import { Driver } from '../../driver/entities/driver.entity';
import { Order } from './order.entity';

@Entity()
export class OrderOffer {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @Column({ nullable: false })
  amount: number;
  
  @Column({ default: 0, name: 'offer_index' })
  offerIndex: number;
  
  @Column({ default: false })
  accepted: boolean;
  
  @Column({ default: false })
  canceled: boolean;

  @Column({ default: false })
  rejected: boolean;

  @ManyToOne(() => User, (user) => user.createdOrderOffers, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;
  
  @ManyToOne(() => Driver, driver => driver.orderOffers)
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @ManyToOne(() => Order, order => order.driverOffers)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Currency, currency => currency.orderOffer)
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

}