import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DriverService {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  amount: string;

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

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  deleted: boolean;
}
