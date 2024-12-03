import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DriversServicesRequests } from '../../driver/entities/drivers-services-requests.entity';

@Entity()
export class DriversServicesRequestsStatuses {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true, unique: true })
  code: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ default: false, name: 'is_deleted' })
  isDeleted: boolean;

  @OneToMany(() => DriversServicesRequests, serviceRequest => serviceRequest.status)
  servicesRequests: DriversServicesRequests[];
}