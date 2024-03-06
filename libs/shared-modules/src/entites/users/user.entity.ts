import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Staff } from '../staffs/staff.entity';
import { Transaction } from '../transactions/transaction.entity';
import { Client } from '../clients/client.entity';
import { Driver } from '../driver/entities/driver.entity';
import { SubscriptionPayment } from '../references/entities/subscription-payment.entity';
import { ClientMerchantUser } from '../client-merchant/entites/client-merchant-user.entity';
import { ClientMerchant } from '../client-merchant/entites/client-merchant.entity';
import { Role } from '../role/entities/role.entity';
import { DriverMerchantUser } from '../driver-merchant/entites/driver-merchant-user.entity';
import { DriverMerchant } from '../driver-merchant/entites/driver-merchant.entity';
import { Order } from '../orders/entities/order.entity';
import { UserFile } from '../files/file.entity';
import { Account } from '../accounts/account.entity';
import { Agent } from '../agents/entites/agent.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, name: 'user_type' })
    userType: string;

    @Column({ nullable: false })
    password: string;

    @Column({ nullable: true,  type: 'timestamp', name: 'last_login' })
    lastLogin: Date;

    // related users
    @OneToOne(() => Staff, (staff) => staff.user)
    staff: Staff;

    @OneToOne(() => Agent, (agent) => agent.user)
    agent: Agent;

    @OneToOne(() => Client, (client) => client.user)
    client: Client;

    @OneToOne(() => Driver, (driver) => driver.user)
    driver: Driver;

    @OneToOne(() => ClientMerchantUser, (clientMerchantUser) => clientMerchantUser.user)
    clientMerchantUser: ClientMerchantUser;

    @OneToOne(() => DriverMerchantUser, (driverMerchantUser) => driverMerchantUser.user)
    driverMerchantUser: DriverMerchantUser;

    @OneToOne(() => ClientMerchant, (clientMerchant) => clientMerchant.user)
    clientMerchant: ClientMerchant;

    @OneToOne(() => DriverMerchant, (driverMerchant) => driverMerchant.user)
    driverMerchant: DriverMerchant;

    @OneToOne(() => SubscriptionPayment, (subscriptionPayment) => subscriptionPayment.user)
    subscriptionPayment: SubscriptionPayment;
    

    // relations belongs to created by user
    @OneToMany(() => Transaction, (transaction) => transaction.createdBy)
    transactions: Transaction[];

    @OneToMany(() => UserFile, (transaction) => transaction.createdBy)
    files: UserFile [];

    @OneToMany(() => Account, (transaction) => transaction.user)
    account: Account[];

    @OneToMany(() => Order, (order) => order.createdBy)
    orders: Order[];

    @OneToMany(() => Driver, (driver) => driver.createdBy)
    drivers: Driver[];

    @ManyToOne(() => Role, role => role.users)
    @JoinColumn({ name: 'role_id' })
    role: Role;


    // relations belongs to rejected by user
    @OneToMany(() => DriverMerchant, (driverMerchant) => driverMerchant.rejectedBy)
    rejectedDriverMerchants: DriverMerchant[];

    @OneToMany(() => ClientMerchant, (clientMerchant) => clientMerchant.rejectedBy)
    rejectedClientMerchants: ClientMerchant[];

    // relations belongs to verified by user
    @OneToMany(() => DriverMerchant, (driverMerchant) => driverMerchant.verifiedBy)
    verifiedDriverMerchants: DriverMerchant[];

    @OneToMany(() => ClientMerchant, (clientMerchant) => clientMerchant.verifiedBy)
    verifiedClientMerchants: ClientMerchant[];

    // relations belongs to blocked by user
    @OneToMany(() => DriverMerchant, (driverMerchant) => driverMerchant.blockedBy)
    blockedDriverMerchants: DriverMerchant[];

    @OneToMany(() => ClientMerchant, (clientMerchant) => clientMerchant.blockedBy)
    blockedClientMerchants: ClientMerchant[];
}
