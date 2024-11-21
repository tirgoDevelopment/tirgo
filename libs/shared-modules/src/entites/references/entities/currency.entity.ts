import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Transaction } from '../../transactions/transaction.entity';
import { ClientBankAccount } from '../../client-merchant/entites/bank-account.entity';
import { DriverOrderOffers } from '../../orders/entities/offer.entity';
import { Subscription } from './subscription.entity';

@Entity()
export class Currency {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: true })
  code: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  deleted: boolean;

  @OneToMany(() => DriverOrderOffers, order => order.currency  )
  orderOffer: DriverOrderOffers[];

  @OneToMany(() => ClientBankAccount, bankAccount => bankAccount.currency)
  bankAccounts: ClientBankAccount[];

  @OneToMany(() => Order, order => order.offeredPriceCurrency)
  offeredOrders: Order[];
  
  @OneToMany(() => Transaction, (transaction) => transaction.currency)
  transactions: Transaction[];

  @OneToMany(() => Subscription, (subscription) => subscription.currency)
  subscriptions: Subscription[];
}