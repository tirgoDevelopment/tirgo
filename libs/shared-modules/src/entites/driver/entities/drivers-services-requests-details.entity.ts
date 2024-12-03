import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { DriversServicesRequests } from './drivers-services-requests.entity';
import { DriversServices } from './drivers-services.entity';

@Entity()
export class DriversServicesRequestsDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DriversServicesRequests, driversServicesRequests => driversServicesRequests.amountDetails, { nullable: false })
  request: DriversServicesRequests;

  @ManyToOne(() => DriversServices, driversServices => driversServices.serviceDetails, { nullable: false })
  driverService: DriversServices;

  @Column({ nullable: false })
  amount: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.servicesRequestsDetails, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;
}
