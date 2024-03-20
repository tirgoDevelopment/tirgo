import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Driver } from './driver.entity';
import { TransportVerification } from './transport-verification.entity';
import { TransportType } from '../../references/entities/transport-type.entity';
import { TransportKind } from '../../references/entities/transport-kind.entity';
import { CargoType } from '../../references/entities/cargo-type.entity';
import { CargoPackage } from '../../references/entities/cargo-package.entity';
import { CargoLoadMethod } from '../../references/entities/cargo-load-method.entity';

@Entity()
export class DriverTransport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true, name: 'cubic_capacity' })
  cubicCapacity?: number;

  @Column({ nullable: true, name: 'state_number' })
  stateNumber?: string

  @Column({ nullable: true, name: 'is_adr' })
  isAdr?: boolean;

  @Column({ nullable: true, name: 'refrigerator_from' })
  refrigeratorFrom: number;

  @Column({ nullable: true, name: 'refrigerator_to' })
  refrigeratorTo: number;

  @Column({ nullable: true, name: 'refrigerator_count' })
  refrigeratorCount: number;

  @Column({ nullable: true, name: 'is_hook' })
  isHook: boolean;

  @Column({ nullable: true, name: 'load_capacity' })
  loadCapacity: string;

  @Column({ nullable: true, name: 'tech_passport_front_file_path' })
  techPassportFrontFilePath?: string;

  @Column({ nullable: true, name: 'tech_passport_back_file_path' })
  techPassportBackFilePath?: string;

  @Column({ nullable: true, name: 'transport_front_file_path' })
  transportFrontFilePath:string; 

  @Column({ nullable: true, name: 'transport_back_file_path' })
  transportBackFilePath:string; 

  @Column({ nullable: true, name: 'transport_side_file_path' })
  transportSideFilePath:string; 
  
  @Column({ nullable: true, name: 'passport_file_path' })
  passportFilePath?: string;
    
  @Column({ nullable: true, name: 'driver_license_file_path' })
  driverLicenseFilePath?: string;

  @Column({ nullable: true, name: 'goods_transportation_license_card_file_path' })
  goodsTransportationLicenseCardFilePath?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;  

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  deleted: boolean;

  @Column({ default: false })
  verified: boolean;

  @Column({ default: false })
  requestToVerification: boolean;

  @ManyToMany(() => TransportType)
  @JoinTable()
  transportTypes: TransportType[];

  @ManyToMany(() => TransportKind)
  @JoinTable()
  transportKinds: TransportKind[];

  @ManyToMany(() => CargoType)
  @JoinTable()
  cargoTypes: CargoType[];

  @ManyToMany(() => CargoLoadMethod)
  @JoinTable()
  cargoLoadMethods: CargoLoadMethod[];

  @ManyToOne(() => Driver, driver => driver.driverTransports)
  @JoinColumn({ name: 'driver_id' })
  driver?: Driver;

  @OneToOne(() => TransportVerification, { cascade: true })
  @JoinColumn({ name: 'transport_verification_id' })
  transportVerification: TransportVerification;
}
