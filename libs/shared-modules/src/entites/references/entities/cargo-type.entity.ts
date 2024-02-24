import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CargoTypeGroup } from './cargo-type-group.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity()
export class CargoType {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: true })
  codeTNVED: string;

  @ManyToOne(() => CargoTypeGroup, cargoTypeGroup => cargoTypeGroup.cargoTypes)
  group: CargoTypeGroup;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  deleted: boolean;

  @OneToMany(() => Order, order => order.cargoType)
  orders: Order[];
}