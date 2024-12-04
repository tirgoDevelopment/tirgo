import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { DriversServicesRequests } from './drivers-services-requests.entity';

@Entity()
export class DriversServicesRequestsMessages {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, name: 'message_type' })
  messageType: string;

  @Column({ nullable: false })
  message: string;

  @Column({ nullable: false, name: 'sender_user_type' })
  senderUserType: string;

  @ManyToOne(() => User, (user) => user.sentServicesRequestsMessages, { nullable: false })
  @JoinColumn({ name: 'sent_by_id' })
  sentBy: User;

  @ManyToOne(() => DriversServicesRequests, serviceRequest => serviceRequest.messages, { nullable: false })
  driverServiceRequest: DriversServicesRequests;

  @Column({ default: false, name: 'is_replied' })
  isReplied: boolean;

  @Column({ name: 'replied_to_id', nullable: true })
  repliedToId: number;

  @Column({ default: false, name: 'is_read' })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'read_at' })
  readAt: Date;

  @ManyToOne(() => User, (user) => user.readDriversServicesRequestsMessages, { nullable: true })
  @JoinColumn({ name: 'read_by_id' })
  readBy: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.createdServicesRequestsMessages, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ default: false, name: 'is_deleted' })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deleteAt: Date;

  @ManyToOne(() => User, (user) => user.deletedDriversServicesRequestsMessages, { nullable: true })
  @JoinColumn({ name: 'deleted_by_id' })
  deletedBy: User;
}
