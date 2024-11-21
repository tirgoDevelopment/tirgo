import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Client } from '../../clients/client.entity';
import { Currency } from '../../references/entities/currency.entity';
import { CargoType } from '../../references/entities/cargo-type.entity';
import { TransportType } from '../../references/entities/transport-type.entity';
import { Driver } from '../../driver/entities/driver.entity';
import { CargoLoadMethod } from '../../references/entities/cargo-load-method.entity';
import { TransportKind } from '../../references/entities/transport-kind.entity';
import { CargoStatus } from '../../references/entities/cargo-status.entity';
import { User } from '../../users/user.entity';
import { LocationPlace } from './location.entity';
import { DriverOrderOffers } from './offer.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @ManyToOne(() => Client, client => client.orders, { nullable: false })
  client: Client;

  @ManyToOne(() => Client, client => client.additionalOrders, { nullable: true })
  additionalClient: Client;

  @ManyToOne(() => Driver, driver => driver.orders)
  driver: Driver;

  @Column({ nullable: true, name: 'cargo_weight' })
  cargoWeight: number;

  @Column({ nullable: true, name: 'is_adr' })
  isAdr?: boolean;

  @Column({ nullable: true, name: 'is_hook' })
  isHook?: boolean;

  @Column({ nullable: true, name: 'offered_price' })
  offeredPrice?: number;

  @Column({ default: false, name: 'is_cashless_payment' })
  isCashlessPayment: boolean;
  
  @Column({ default: false, name: 'is_secure_transaction' })
  isSecureTransaction: boolean;
  
  @Column({ default: false, name: 'is_border_crossing' })
  isBorderCrossing: boolean;
  
  @Column({ nullable: true, name: 'cargo_dimension' })
  cargoDimension: string;
  
  @Column({ nullable: true, name: 'refrigerator_from_count' })
  refrigeratorFromCount?: string;
  
  @Column({ nullable: true, name: 'refrigerator_to_count' })
  refrigeratorToCount?: string;

  @Column({ nullable: true, name: 'is_refrigerator' })
  isRefrigerator?: boolean;
  
  @Column({ nullable: false, name: 'send_date' })
  sendDate: Date;

  @Column({ nullable: true })
  cisternVolume: string;

  @Column({ nullable: true })
  loadCapacity: string;
  
  @OneToOne(() => LocationPlace, { nullable: false })
  @JoinColumn({ name: 'loading_location_id' })
  loadingLocation: LocationPlace;
  
  @OneToOne(() => LocationPlace, { nullable: false })
  @JoinColumn({ name: 'delivery_location_id' })
  deliveryLocation: LocationPlace;

  @OneToOne(() => LocationPlace, { nullable: true })
  @JoinColumn({ name: 'additional_loading_location_id' })
  additionalLoadingLocation: LocationPlace;

  @OneToOne(() => LocationPlace, { nullable: true })
  @JoinColumn({ name: 'additional_delivery_location_id' })
  additionalDeliveryLocation: LocationPlace;

  @OneToOne(() => LocationPlace, { nullable: true })
  @JoinColumn({ name: 'customs_out_clearance_location_id' })
  customsOutClearanceLocation: LocationPlace;

  @OneToOne(() => LocationPlace, { nullable: true })
  @JoinColumn({ name: 'customs_in_clearance_location_id' })
  customsInClearanceLocation: LocationPlace;
  
  @ManyToOne(() => TransportType, transportType => transportType.orders, { nullable: false })
  @JoinColumn({ name: 'transport_type_id' })
  transportType: TransportType;
  
  @ManyToMany(() => TransportKind, { nullable: false })
  @JoinTable()
  transportKinds: TransportKind[];
  
  @ManyToMany(() => CargoLoadMethod, { nullable: true })
  @JoinTable()
  cargoLoadMethods?: CargoLoadMethod[]
  
  @ManyToOne(() => CargoType, cargoType => cargoType.orders, { nullable: false })
  @JoinColumn({ name: 'cargo_type_id' })
  cargoType: CargoType;
  
  @ManyToOne(() => CargoStatus, cargoStatus => cargoStatus.orders)
  @JoinColumn({ name: 'cargo_status_id' })
  cargoStatus?: CargoStatus;

  @ManyToOne(() => Currency, currency => currency.offeredOrders, { nullable: true })
  @JoinColumn({ name: 'offered_price_currency' })
  offeredPriceCurrency: Currency;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.createdOrders, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ default: false, name: 'is_deleted' })
  isDeleted: boolean;

  @Column({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.deletedOrders, {nullable: true})
  @JoinColumn({ name: 'deleted_by_id' })
  deletedBy: User;

  @Column({ nullable: true })
  deleteReason: string;

  @Column({ default: false, name: 'is_cancelted' })
  isCanceled: boolean;

  @Column({ type: 'timestamp', name: 'canceled_at', nullable: true })
  canceledAt: Date;

  @ManyToOne(() => User, (user) => user.canceledOrders, {nullable: true})
  @JoinColumn({ name: 'canceled_by_id' })
  canceledBy: User;

  @Column({ nullable: true })
  cancelReason: string;

  @OneToMany(() => DriverOrderOffers, orderOffer => orderOffer.order)
  driverOrderOffers: DriverOrderOffers[];
}