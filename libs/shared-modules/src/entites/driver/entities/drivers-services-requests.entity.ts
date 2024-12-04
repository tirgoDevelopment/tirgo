import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DriversServicesRequestsStatuses } from '../../references/entities/drivers-services-requests-statuses.entity';
import { User } from '../../users/user.entity';
import { Driver } from './driver.entity';
import { DriversServicesRequestsDetails } from './drivers-services-requests-details.entity';
import { DriversServicesRequestsMessages } from './drivers-services-requests-messages.entity';
import { DriversServices } from './drivers-services.entity';

@Entity()
export class DriversServicesRequests {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Driver, driver => driver.orders, { nullable: false })
  driver: Driver;

  @OneToMany(() => DriversServicesRequestsMessages, message => message.driverServiceRequest)
  messages: DriversServicesRequestsMessages[];

  @ManyToMany(() => DriversServices, { nullable: false })
  @JoinTable()
  services: DriversServices[];

  @OneToMany(() => DriversServicesRequestsDetails, (details) => details.request, { nullable: true })
  amountDetails: Driver[];

  @ManyToOne(() => DriversServicesRequestsStatuses, (status) => status.servicesRequests, { nullable: false })
  @JoinColumn({ name: 'status_id' })
  status: DriversServicesRequestsStatuses;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.createdServicesRequests, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ default: false, name: 'is_deleted' })
  isDeleted: boolean;

  @Column({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.deletedDriversServicesRequests, { nullable: true })
  @JoinColumn({ name: 'deleted_by_id' })
  deletedBy: User;
}
