import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DriversServicesRequestsDetails } from './drivers-services-requests-details.entity';

@Entity()
export class DriversServices {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false })
  tirAmount: string;

  @Column({ nullable: false })
  uzsAmount: string;

  @Column({ nullable: false })
  kztAmount: string;

  @Column({ nullable: false })
  code: string;

  @Column({ nullable: false })
  type: string;

  @Column({ nullable: false, name: 'without_subscription' })
  withoutSubscription: boolean;

  @Column({ nullable: false, name: 'is_legal_entity' })
  isLegalEntity: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;  

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ default: false, name: 'is_deleted' })
  isDeleted: boolean;

  @OneToMany(() => DriversServicesRequestsDetails, (serviceDetails) => serviceDetails.driverService)
  serviceDetails: DriversServicesRequestsDetails[];
}
