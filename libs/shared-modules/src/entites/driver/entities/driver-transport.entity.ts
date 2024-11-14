import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Driver } from './driver.entity';
import { TransportType } from '../../references/entities/transport-type.entity';
import { TransportKind } from '../../references/entities/transport-kind.entity';
import { CargoLoadMethod } from '../../references/entities/cargo-load-method.entity';
import { User } from '../../users/user.entity';

@Entity()
export class DriverTransport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true, name: 'transport_number' })
  transportNumber: string;

  @Column({ nullable: true, name: 'is_adr' })
  isAdr?: boolean;

  @Column({ nullable: true, name: 'is_main' })
  isMain?: boolean;
  
  @Column({ nullable: true, name: 'is_hook' })
  isHook: boolean;

  @Column({ nullable: true })
  capacity: string;

  @Column({ nullable: true })
  volume: number;

  @Column({ nullable: true })
  cubature: number;

  @Column({ nullable: true, name: 'height_cubature' })
  heightCubature: string;
  
  @Column({ nullable: true, name: 'is_refrigerator' })
  isRefrigerator: number;

  @Column({ nullable: true, name: 'refrigerator_from_count' })
  refrigeratorFromCount: number;

  @Column({ nullable: true, name: 'refrigerator_to_count' })
  refrigeratorToCount: number;

  @Column({ nullable: true, name: 'load_capacity' })
  loadCapacity: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;  

  @ManyToOne(() => User, (user) => user.createdDriverTransports, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ nullable: true, name: 'is_deleted' })
  isDeleted: boolean;

  @Column({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date; 

  @ManyToOne(() => User, (user) => user.deletedDriverTransports, { nullable: true })
  @JoinColumn({ name: 'deleted_by_id' })
  deletedBy: User;

  @Column({ nullable: true, name: 'delete_reason' })
  deleteReason: string;

  @Column({ nullable: true, name: 'is_verified' })
  isVerified: boolean;

  @Column({ type: 'timestamp', name: 'verified_at' })
  verifiedAt: Date; 

  @ManyToOne(() => User, (user) => user.verifiedDriverTransports, { nullable: true })
  @JoinColumn({ name: 'verified_by_id' })
  verifiedBy: User;

  @OneToOne(() => TransportType)
  @JoinTable()
  transportType: TransportType;

  @OneToOne(() => TransportKind)
  @JoinTable()
  transportKind: TransportKind;

  @ManyToMany(() => CargoLoadMethod)
  @JoinTable()
  cargoLoadMethods: CargoLoadMethod[];
  
  @ManyToOne(() => Driver, driver => driver.driverTransports)
  @JoinColumn({ name: 'driver_id' })
  driver?: Driver;
}
