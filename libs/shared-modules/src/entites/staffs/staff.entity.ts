import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Timestamp } from 'typeorm';
import { Role } from '../role/entities/role.entity';
import { TransportType } from '../references/entities/transport-type.entity';
import { User } from '../users/user.entity';

@Entity()
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, name: 'fullname' })
  fullName: string;

  @Column({ nullable: false, unique: true })
  username: string;

  @Column({ nullable: false })
  phone: string;

  @OneToMany(() => TransportType, transportType => transportType.createdBy)
  transportTypes: TransportType[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;
  
  @Column({ default: false })
  blocked: boolean;

  @ManyToOne(() => User, (user) => user.blockedDrivers) 
  @JoinColumn({ name: 'blocked_by' })
  blockedBy: User;

  @Column({ name: 'blocked_at', nullable: true })
  blockedAt: Date;  

  @Column({ nullable: true, name: 'block_reason' })
  blockReason: string;

  @Column({ default: false })
  deleted: boolean;

  @OneToOne(() => User, (user) => user.staff, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) // This should be the primary key column of User
  user: User;
}