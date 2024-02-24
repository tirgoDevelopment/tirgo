import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { Subscription } from './subscription.entity';

@Entity()
export class SubscriptionPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;
  
  @Column({ default: true })
  active: boolean;
  
  @Column({ default: false })
  deleted: boolean;

  @OneToOne(() => User, (user) => user.subscriptionPayment, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}