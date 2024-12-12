import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Staff } from '../staffs/staff.entity';
import { Transaction } from '../transactions/transaction.entity';
import { Client } from '../clients/client.entity';
import { Driver } from '../driver/entities/driver.entity';
import { DriverPhoneNumber } from '../driver/entities/driver-phone-number.entity';
import { DriverTransport } from '../driver/entities/driver-transport.entity';
import { SubscriptionPayment } from '../references/entities/subscription-payment.entity';
import { ClientMerchantUser } from '../client-merchant/entites/client-merchant-user.entity';
import { ClientMerchant } from '../client-merchant/entites/client-merchant.entity';
import { Role } from '../role/entities/role.entity';
import { DriverMerchantUser } from '../driver-merchant/entites/driver-merchant-user.entity';
import { DriverMerchant } from '../driver-merchant/entites/driver-merchant.entity';
import { Order } from '../orders/entities/order.entity';
import { UserFile } from '../files/file.entity';
import { Agent } from '../agents/entites/agent.entity';
import { DriverOrderOffers } from '../orders/entities/offer.entity';
import { DriverDocuments } from '../driver/entities/driver-documents.entity';
import { ClientPhoneNumber } from '../clients/client-phonenumber.entity';
import { ClientRepliesOrderOffer } from 'apps/orders/src';
import { DriversServicesRequestsDetails } from '../driver/entities/drivers-services-requests-details.entity';
import { DriversServicesRequests } from '../driver/entities/drivers-services-requests.entity';
import { DriversServicesRequestsMessages } from '../driver/entities/drivers-services-requests-messages.entity';
import { DriversServicesRequestsStatusesChangesHistory } from '../driver/entities/drivers-services-requests-statuses-history.entity';
import { ServicesRequestsDocuments } from '../driver/entities/services-requests-documents.entity';
import { TmsReqestToDriver } from '../driver/entities/driver-tms-request.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, name: 'user_type' })
    userType: string;

    @Column({ nullable: true })
    password: string;

    @Column({ nullable: true, type: 'timestamp', name: 'last_login' })
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
    createdFiles: UserFile[];

    @OneToMany(() => Order, (order) => order.createdBy)
    createdOrders: Order[];

    @OneToMany(() => DriverOrderOffers, (orderOffer) => orderOffer.createdBy)
    createdDriverOrderOffers: DriverOrderOffers[];

    @OneToMany(() => Driver, (driver) => driver.createdBy)
    createdDrivers: Driver[];

    @OneToMany(() => TmsReqestToDriver, (tmsReqestToDriver) => tmsReqestToDriver.createdBy)
    createdTmsRequestsToDrivers: TmsReqestToDriver[];

    @OneToMany(() => DriverPhoneNumber, (driverPhoneNumber) => driverPhoneNumber.createdBy)
    createdDriverPhoneNumbers: DriverPhoneNumber[];

    @OneToMany(() => DriverTransport, (driverTransports) => driverTransports.createdBy)
    createdDriverTransports: DriverTransport[];

    @OneToMany(() => DriversServicesRequestsDetails, (driverRequestDetail) => driverRequestDetail.createdBy)
    createdServicesRequestsDetails: DriversServicesRequestsDetails[];

    @OneToMany(() => DriversServicesRequests, (driverRequest) => driverRequest.createdBy)
    createdServicesRequests: DriversServicesRequests[];

    @OneToMany(() => DriversServicesRequestsMessages, (driverRequest) => driverRequest.createdBy)
    createdServicesRequestsMessages: DriversServicesRequestsMessages[];
    
    @OneToMany(() => DriversServicesRequestsStatusesChangesHistory, (driverRequestStatusHistory) => driverRequestStatusHistory.createdBy)
    createdDriverRequestStatusHistory: DriversServicesRequestsStatusesChangesHistory[];

    @OneToMany(() => Client, (client) => client.createdBy)
    createdClients: Client[];

    @OneToMany(() => ClientPhoneNumber, (clientPhoneNumber) => clientPhoneNumber.createdBy)
    createdClientPhoneNumbers: ClientPhoneNumber[];

    @ManyToOne(() => Agent, role => role.createdBy)
    createdAgents: Agent;

    @OneToMany(() => DriverDocuments, (driverDocuments) => driverDocuments.createdBy)
    createdDriverDocuments: DriverDocuments[];

    @OneToMany(() => ServicesRequestsDocuments, (requestDocuments) => requestDocuments.createdBy)
    createdServicesRequestsDocuments: ServicesRequestsDocuments[];


    // relations belongs to rejected by user
    @OneToMany(() => DriverMerchant, (driverMerchant) => driverMerchant.rejectedBy)
    rejectedDriverMerchants: DriverMerchant[];

    @OneToMany(() => ClientMerchant, (clientMerchant) => clientMerchant.rejectedBy)
    rejectedClientMerchants: ClientMerchant[];

    @OneToMany(() => DriverOrderOffers, (orderOffer) => orderOffer.rejectedBy)
    rejectedOrderOffers: DriverOrderOffers[];

    @OneToMany(() => DriverOrderOffers, (orderOffer) => orderOffer.rejectedBy)
    rejectedDriverOrderOffers: DriverOrderOffers[];

    // relations belongs to verified by user
    @OneToMany(() => DriverMerchant, (driverMerchant) => driverMerchant.verifiedBy)
    verifiedDriverMerchants: DriverMerchant[];

    @OneToMany(() => ClientMerchant, (clientMerchant) => clientMerchant.verifiedBy)
    verifiedClientMerchants: ClientMerchant[];

    @OneToMany(() => Driver, (driver) => driver.verifiedBy)
    verifiedDrivers: Driver[];

    @OneToMany(() => DriverTransport, (driverTransports) => driverTransports.verifiedBy)
    verifiedDriverTransports: DriverTransport[];

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

    @OneToMany(() => DriverPhoneNumber, (driverPhoneNumber) => driverPhoneNumber.createdBy)
    deletedDriverPhoneNumbers: DriverPhoneNumber[];

    @OneToMany(() => DriverDocuments, (driverDocuments) => driverDocuments.deletedBy)
    deletedDriverDocuments: DriverDocuments[];

    @OneToMany(() => ServicesRequestsDocuments, (requestDocuments) => requestDocuments.deletedBy)
    deletedServicesRequestsDocuments: ServicesRequestsDocuments[];

    @OneToMany(() => DriverTransport, (driverTransports) => driverTransports.deletedBy)
    deletedDriverTransports: DriverTransport[];

    @OneToMany(() => DriversServicesRequests, (driversServicesRequests) => driversServicesRequests.deletedBy)
    deletedDriversServicesRequests: DriversServicesRequests[];

    @OneToMany(() => DriversServicesRequestsMessages, (driversServicesRequestsMessages) => driversServicesRequestsMessages.deletedBy)
    deletedDriversServicesRequestsMessages: DriversServicesRequestsMessages[];

    @OneToMany(() => Client, (client) => client.deletedBy)
    deletedClients: Client[];

    @OneToMany(() => DriverMerchant, (driverMerchant) => driverMerchant.deletedBy)
    deletedDriverMerchants: DriverMerchant[];

    @OneToMany(() => ClientMerchant, (clientMerchant) => clientMerchant.deletedBy)
    deletedClientMerchants: ClientMerchant[];

    @OneToMany(() => Order, (order) => order.deletedBy)
    deletedOrders: Order[];

    // canceltedrelations belongs to  by user
    @OneToMany(() => DriverOrderOffers, (orderOffer) => orderOffer.rejectedBy)
    canceledOrderOffers: DriverOrderOffers[];

    @OneToMany(() => Order, (order) => order.canceledBy)
    canceledOrders: Order[];

    @OneToMany(() => DriverOrderOffers, (orderOffer) => orderOffer.canceledBy)
    canceledDriverOrderOffers: DriverOrderOffers[];

    @OneToMany(() => DriversServicesRequests, (driversServicesRequests) => driversServicesRequests.canceledBy)
    canceledDriversServicesRequests: DriversServicesRequests[];

    // relations belongs to updated by user
    @OneToMany(() => DriverDocuments, (driverDocuments) => driverDocuments.updatedBy)
    updatedDriverDocuments: DriverDocuments[];

    @OneToMany(() => ServicesRequestsDocuments, (requestDocuments) => requestDocuments.updatedBy)
    updatedServicesRequestsDocuments: ServicesRequestsDocuments[];

    // relations belongs to accepted by user
    @OneToMany(() => DriverOrderOffers, (orderOffer) => orderOffer.acceptedBy)
    acceptedDriverOrderOffers: DriverOrderOffers[];


    // relations belongs to finished by user
    @OneToMany(() => DriverOrderOffers, (orderOffer) => orderOffer.finishedBy)
    finishedDriverOrderOffers: DriverOrderOffers[];

    @OneToMany(() => ClientRepliesOrderOffer, (reply) => reply.finishedBy)
    finishedClientOrderOfferReplies: ClientRepliesOrderOffer[];

    @OneToMany(() => DriverOrderOffers, (orderOffer) => orderOffer.repliedBy)
    repliedDriverOrderOffers: DriverOrderOffers[];

    // relations belongs to activated by user
    @OneToMany(() => Order, (order) => order.activatedBy)
    activatedOrders: Order[];

    // relations belongs to completed by user
    @OneToMany(() => Order, (order) => order.completedBy)
    completedOrders: Order[];

    // relations belongs to finished by user
    @OneToMany(() => Order, (order) => order.finishedBy)
    finishedOrders: Order[];

    // relations belongs to read by user
    @OneToMany(() => DriversServicesRequestsMessages, (driversServicesRequestsMessages) => driversServicesRequestsMessages.readBy)
    readDriversServicesRequestsMessages: DriversServicesRequestsMessages[];

    // relations belongs to sent by user
    @OneToMany(() => DriversServicesRequestsMessages, (driverRequest) => driverRequest.sentBy)
    sentServicesRequestsMessages: DriversServicesRequestsMessages[];
}

