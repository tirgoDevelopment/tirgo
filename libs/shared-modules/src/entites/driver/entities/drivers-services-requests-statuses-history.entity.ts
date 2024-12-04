import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne , PrimaryGeneratedColumn } from 'typeorm';
import { DriversServicesRequestsStatuses } from '../../references/entities/drivers-services-requests-statuses.entity';
import { User } from '../../users/user.entity';
import { DriversServicesRequests } from './drivers-services-requests.entity';

@Entity()
export class DriversServicesRequestsStatusesChangesHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DriversServicesRequests, serviceRequest => serviceRequest.statusesHistory, { nullable: false })
  driverServiceRequest: DriversServicesRequests;

  @ManyToOne(() => DriversServicesRequestsStatuses, (status) => status.servicesRequestsStatusesHistory, { nullable: false })
  @JoinColumn({ name: 'status_id' })
  status: DriversServicesRequestsStatuses;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.createdDriverRequestStatusHistory, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

}
