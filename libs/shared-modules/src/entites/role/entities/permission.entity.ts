import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Timestamp } from 'typeorm';
import { Role } from './role.entity';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ nullable: false, default: false, name: 'add_driver' })
  addDriver: boolean;

  @Column({ nullable: false, default: false, name: 'add_client' })
  addClient: boolean;

  @Column({ nullable: false, default: false, name: 'add_order' })
  addOrder: boolean;

  @Column({ nullable: false, default: false, name: 'cancel_order' })
  cancelOrder: boolean;

  @Column({ nullable: false, default: false, name: 'see_drivers_info' })
  seeDriversInfo: boolean;

  @Column({ nullable: false, default: false, name: 'see_client_info' })
  seeClientsInfo: boolean;

  @Column({ nullable: false, default: false, name: 'send_push' })
  sendPush: boolean;

  @Column({ nullable: false, default: false })
  chat: boolean;

  @Column({ nullable: false, default: false })
  tracking: boolean;

  @Column({ nullable: false, default: false, name: 'driver_finance' })
  driverFinance: boolean;

  @Column({ nullable: false, default: false, name: 'ClientMerchant_finance' })
  ClientMerchantFinance: boolean;

  @Column({ nullable: false, default: false, name: 'register_ClientMerchant' })
  registrClientMerchant: boolean;

  @Column({ nullable: false, default: false, name: 'verify_order' })
  verifyDriver: boolean;

  @Column({ nullable: false, default: false, name: 'ClientMerchant_list' })
  ClientMerchantList: boolean;

  @OneToOne(() => Role, (role) => role.permission)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  deleted: boolean;

}