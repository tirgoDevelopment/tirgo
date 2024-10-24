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
import { Agent } from '../agents/entites/agent.entity';
import { OrderOffer } from '../orders/entities/offer.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, name: 'user_type' })
    userType: string;

    @Column({ nullable: true })
    password: string;

    @Column({ nullable: true,  type: 'timestamp', name: 'last_login' })
    lastLogin: Date;

    @ManyToOne(() => Role, role => role.users)
    @JoinColumn({ name: 'role_id' })
    role: Role;


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
    createdTransactions: Transaction[];

    @OneToMany(() => UserFile, (transaction) => transaction.createdBy)
    createdFiles: UserFile [];

    @OneToMany(() => Order, (order) => order.createdBy)
    createdOrders: Order[];

    @OneToMany(() => OrderOffer, (orderOffer) => orderOffer.createdBy)
    createdOrderOffers: OrderOffer[];

    @OneToMany(() => Driver, (driver) => driver.createdBy)
    createdDrivers: Driver[];

    @OneToMany(() => Client, (client) => client.createdBy)
    createdClients: Client[];

    @ManyToOne(() => Agent, role => role.createdBy)
    createdAgents: Agent;

  

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

    @OneToMany(() => Driver, (driver) => driver.verifiedBy)
    verifiedDrivers: Driver[];

    // relations belongs to blocked by user
    @OneToMany(() => DriverMerchant, (driverMerchant) => driverMerchant.blockedBy)
    blockedDriverMerchants: DriverMerchant[];

    @OneToMany(() => ClientMerchant, (clientMerchant) => clientMerchant.blockedBy)
    blockedClientMerchants: ClientMerchant[];

    @OneToMany(() => Agent, (clientMerchant) => clientMerchant.blockedBy)
    blockedAgents: Agent[];

    @OneToMany(() => Client, (client) => client.blockedBy)
    blockedClients: Client[];

    @OneToMany(() => Driver, (driver) => driver.blockedBy)
    blockedDrivers: Driver[];

    @OneToMany(() => Agent, (agent) => agent.blockedBy)
    blockedStaffs: Agent[];

    // relations belongs to deleted by user
    @OneToMany(() => Driver, (driver) => driver.deletedBy)
    deletedDrivers: Driver[];

    @OneToMany(() => Client, (client) => client.deletedBy)
    deletedClients: Client[];

    @OneToMany(() => DriverMerchant, (driverMerchant) => driverMerchant.deletedBy)
    deletedDriverMerchants: DriverMerchant[];

    @OneToMany(() => ClientMerchant, (clientMerchant) => clientMerchant.deletedBy)
    deletedClientMerchants: ClientMerchant[];
}
