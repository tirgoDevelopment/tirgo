import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { Driver } from './driver.entity';
import { DriverMerchant } from '../../driver-merchant/entites/driver-merchant.entity';

@Entity()
export class TmsReqestToDriver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false, name: 'is_accepted' })
  isAccepted: boolean;

  @Column({ default: false, name: 'is_rejected' })
  isRejected: boolean;

  @ManyToOne(() => Driver, (driver) => driver.tmsRequests, { nullable: true }) 
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @ManyToOne(() => DriverMerchant, (driverMerchant) => driverMerchant.requestedDrivers, { nullable: true })
  @JoinColumn({ name: 'merchant_id' })
  driverMerchant: DriverMerchant;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;  

  @Column({ type: 'timestamp', name: 'accepted_at', nullable: true })
  acceptedAt: Date;  

  @Column({ type: 'timestamp', name: 'rejected_at', nullable: true })
  rejectedAt: Date;  

  @ManyToOne(() => User, (user) => user.createdTmsRequestsToDrivers, { nullable: true }) 
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;
}