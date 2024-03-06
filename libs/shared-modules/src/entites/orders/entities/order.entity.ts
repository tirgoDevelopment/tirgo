import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Client } from '../../clients/client.entity';
import { Currency } from '../../references/entities/currency.entity';
import { CargoType } from '../../references/entities/cargo-type.entity';
import { TransportType } from '../../references/entities/transport-type.entity';
import { Driver } from '../../driver/entities/driver.entity';
import { CargoPackage } from '../../references/entities/cargo-package.entity';
import { CargoLoadMethod } from '../../references/entities/cargo-load-method.entity';
import { TransportKind } from '../../references/entities/transport-kind.entity';
import { CargoStatus } from '../../references/entities/cargo-status.entity';
import { ClientMerchant } from '../../client-merchant/entites/client-merchant.entity';
import { User } from '../../users/user.entity';
import { OrderOffer } from './offer.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @ManyToOne(() => Client, client => client.orders)
  client: Client;

  @ManyToOne(() => Client, client => client.additionalOrders)
  additionalClient: Client;

  @ManyToOne(() => Driver, driver => driver.orders)
  driver: Driver;

  @Column({ nullable: true, name: 'send_date' })
  sendDate: Date;

  @ManyToOne(() => CargoType, cargoType => cargoType.orders)
  @JoinColumn({ name: 'cargo_type_id' })
  cargoType: CargoType;

  @Column({ nullable: true, name: 'cargo_weight' })
  cargoWeight: number;

  @Column({ nullable: true, name: 'cargo_length' })
  cargoLength: number;

  @Column({ nullable: true, name: 'cargo_width' })
  cargoWidth: number;

  @Column({ nullable: true, name: 'cargo_height' })
  cargoHeight: number;

  @ManyToMany(() => TransportType)
  @JoinTable()
  transportTypes: TransportType[];

  @ManyToMany(() => TransportKind)
  @JoinTable()
  transportKinds: TransportKind[];

  @Column({ nullable: true, name: 'is_safe_transaction' })
  isSafeTransaction: boolean;

  @Column({ nullable: true, name: 'loading_location' })
  loadingLocation: string;

  @Column({ nullable: true, name: 'delivery_location' })
  deliveryLocation: string;

  @Column({ nullable: true })
  volume: number

  @ManyToOne(() => CargoLoadMethod, cargoLoadMethod => cargoLoadMethod.orders)
  @JoinColumn({ name: 'loading_method_id' })
  loadingMethod?: CargoLoadMethod

  @ManyToOne(() => CargoPackage, cargoPackage => cargoPackage.orders)
  @JoinColumn({ name: 'cargo_package_id' })
  cargoPackage?: CargoPackage;

  @ManyToOne(() => CargoStatus, cargoStatus => cargoStatus.orders)
  @JoinColumn({ name: 'cargo_status_id' })
  cargoStatus?: CargoStatus;

  @Column({ nullable: true, name: 'customs_place_location' })
  customsPlaceLocation?: string;

  @Column({ nullable: true, name: 'customs_clearance_place_location' })
  customsClearancePlaceLocation?: string;

  @Column({ nullable: true, name: 'additional_loading_location' })
  additionalLoadingLocation?: string;

  @Column({ nullable: true, name: 'additional_delivery_location' })
  additionalDeliveryLocation?: string;

  @Column({ nullable: true, name: 'refrigerator_from' })
  refrigeratorFrom?: string;

  @Column({ nullable: true, name: 'refrigerator_to' })
  refrigeratorTo?: string;

  @Column({ nullable: true, name: 'refrigerator_count' })
  refrigeratorCount?: number;

  @Column({ nullable: true, name: 'is_adr' })
  isAdr?: boolean;

  @Column({ nullable: true, name: 'is_carnet_tir' })
  isCarnetTir?: boolean;

  @Column({ nullable: true, name: 'is_glonas' })
  isGlonas?: boolean;

  @Column({ nullable: true, name: 'is_paranom' })
  isParanom?: boolean;

  @Column({ nullable: true, name: 'offered_price' })
  offeredPrice?: number;

  @Column({ nullable: true, name: 'payment_method' })
  paymentMethod?: string;

  @Column({ nullable: true, name: 'in_advance_price' })
  inAdvancePrice?: number;

  @ManyToOne(() => Currency, currency => currency.offeredOrders)
  @JoinColumn({ name: 'offered_price_currency' })
  offeredPriceCurrency: Currency;

  @ManyToOne(() => Currency, currency => currency.inAdvanceOrders)
  @JoinColumn({ name: 'in_advance_price_currency' })
  inAdvancePriceCurrency: Currency;

  @ManyToOne(() => ClientMerchant, (ClientMerchant) => ClientMerchant.orders)
  clientMerchant: ClientMerchant;

  @Column({ nullable: true, name: 'is_urgent' })
  isUrgent: boolean;

  @Column({ nullable: true, name: 'is_two_days' })
  isTwoDays: boolean

  @Column({ nullable: true, name: 'is_hook' })
  isHook: boolean;

  @Column({ nullable: true, name: 'cistern_volume' })
  cisternVolume: number;

  @Column({ nullable: true, name: 'container_volume' })
  containerVolume: number;

  @Column({ nullable: true, name: 'capacity' })
  capacity:number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @Column({ default: false, name: 'is_client_merchant' })
  isClientMerchant: boolean;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  deleted: boolean;

  @ManyToOne(() => User, (user) => user.createdOrders, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => OrderOffer, orderOffer => orderOffer.order)
  driverOffers: OrderOffer[];

  @Column({ default: false })
  canceled: boolean;
}