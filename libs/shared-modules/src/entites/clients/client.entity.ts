import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/user.entity';
import { ClientPhoneNumber } from './client-phonenumber.entity';
import { OrderOfferReply } from '../orders/entities/offer-reply.entity';

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, name: 'first_name' })
  firstName: string;

  @Column({ nullable: false, name: 'last_name' })
  lastName: string;

  @Column({ nullable: true, unique: true, name: 'additional_phone_number' })
  additionalPhoneNumber: string;

  @Column({ nullable: true })
  citizenship?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true, name: 'passport_file_path' })
  passportFilePath?: string;

  @Column({ default: 0, name: 'login_verification_code' })
  loginVerificationCode: string;

  @Column({ type: 'bigint', default: 0, name: 'login_verification_code_expire_time' })
  loginVerificationCodeExpireTime: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true, name: 'block_reason' })
  blockReason: string;

  @Column({ default: false })
  deleted: boolean;

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