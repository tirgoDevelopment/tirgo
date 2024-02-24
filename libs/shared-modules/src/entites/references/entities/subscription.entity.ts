import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SubscriptionPayment } from './subscription-payment.entity';
import { Currency } from './currency.entity';
import { Driver } from '../../driver/entities/driver.entity';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: false })
  duration: number;

  @Column({ nullable: false })
  price: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  deleted: boolean;

  @OneToMany(() => Driver, (driver) => driver.subscription,)
  driver: Driver;

  @ManyToOne(() => Currency, (currency) => currency.subscriptions)
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;
}