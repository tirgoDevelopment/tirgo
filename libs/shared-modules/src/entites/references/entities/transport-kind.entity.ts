import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Staff } from '../../staffs/staff.entity';
import { DriverTransport } from '../../driver/entities/driver-transport.entity';

@Entity()
export class TransportKind {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: true })
  isMode: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Staff, user => user.transportTypes)
  createdBy: Staff;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  deleted: boolean;

  @OneToMany(() => DriverTransport, (driverTransport) => driverTransport.transportKind, { nullable: true })
  @JoinColumn({ name: 'driver_transport_id' })
  driverTransports: DriverTransport;
}