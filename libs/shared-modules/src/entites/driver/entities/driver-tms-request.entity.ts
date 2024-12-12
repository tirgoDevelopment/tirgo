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
  driver: User;

  @ManyToMany(() => DriverMerchant)
  @JoinTable()
  driverMerchants: DriverMerchant[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;  

  @ManyToOne(() => User, (user) => user.createdTmsRequestsToDrivers, { nullable: true }) 
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;
}