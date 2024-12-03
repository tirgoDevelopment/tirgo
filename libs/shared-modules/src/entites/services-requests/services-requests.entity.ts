import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, ManyToOne, JoinColumn, JoinTable, ManyToMany } from 'typeorm';
import { DriverService } from '../driver/entities/driver-service.entity';
import { Driver } from '../driver/entities/driver.entity';

@Entity()
export class ServicesRequests {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => DriverService, { nullable: false })
  @JoinTable()
  services: DriverService[];
      
  @ManyToOne(() => Driver, driver => driver.orders, { nullable: false })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;
}

