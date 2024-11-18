import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/user.entity';
import { ClientPhoneNumber } from './client-phonenumber.entity';
import { ClientDocuments } from './clients-documents.entity';

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, name: 'first_name' })
  firstName: string;

  @Column({ nullable: false, name: 'last_name' })
  lastName: string;

  @Column({ nullable: true, name: 'birthday_date' })
  birthdayDate?: Date;

  @OneToOne(() => ClientDocuments, (document) => document.clientId  , { cascade: true, onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'profile_file_id' })
  profileFile?: ClientDocuments;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.createdClients) 
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ default: false, name: 'is_blocked' })
  isBlocked: boolean;

  @Column({ name: 'blocked_at', nullable: true })
  blockedAt: Date;

  @Column({ nullable: true, name: 'block_reason' })
  blockReason: string;

  @ManyToOne(() => User, (user) => user.blockedClients) 
  @JoinColumn({ name: 'blocked_by' })
  blockedBy: User;

  @Column({ default: false, name: 'is_deleted' })
  isDeleted: boolean;

  @Column({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.deletedClients) 
  @JoinColumn({ name: 'deleted_by' })
  deletedBy: User;

  @OneToMany(() => Order, order => order.client)
  orders: Order[];

  @OneToMany(() => Order, order => order.client)
  additionalOrders: Order[];

  @OneToMany(() => ClientPhoneNumber, phoneNumber => phoneNumber.client, { cascade: true })
  phoneNumbers: ClientPhoneNumber[];

  @OneToOne(() => User, (user) => user.client, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

}