import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransportType } from '../entites/references/entities/transport-type.entity';
import { CargoType } from '../entites/references/entities/cargo-type.entity';
import { CargoTypeGroup } from '../entites/references/entities/cargo-type-group.entity';
import { CargoStatus } from '../entites/references/entities/cargo-status.entity';
import { Currency } from '../entites/references/entities/currency.entity';
import { Role } from '../entites/role/entities/role.entity';
import { Staff } from '../entites/staffs/staff.entity';
import { User } from '../entites/users/user.entity';
import { Driver } from '../entites/driver/entities/driver.entity';
import { DriverTransport } from '../entites/driver/entities/driver-transport.entity';
import { TransportVerification } from '../entites/driver/entities/transport-verification.entity';
import { Order } from '../entites/orders/entities/order.entity';
import { CargoLoadMethod } from '../entites/references/entities/cargo-load-method.entity';
import { CargoPackage } from '../entites/references/entities/cargo-package.entity';
import { Client } from '../entites/clients/client.entity';
import { TransportKind } from '../entites/references/entities/transport-kind.entity';
import { SubscriptionPayment } from '../entites/references/entities/subscription-payment.entity';
import { ClientMerchant } from '../entites/client-merchant/entites/client-merchant.entity';
import { ClientBankAccount } from '../entites/client-merchant/entites/bank-account.entity';
import { ClientMerchantUser } from '../entites/client-merchant/entites/client-merchant-user.entity';
import { DriverPhoneNumber } from '../entites/driver/entities/driver-phone-number.entity';
import { ClientPhoneNumber } from '../entites/clients/client-phonenumber.entity';
import { DriverMerchant } from '../entites/driver-merchant/entites/driver-merchant.entity';
import { DriverBankAccount } from '../entites/driver-merchant/entites/bank-account.entity';
import { UserFile } from '../entites/files/file.entity';
import { DriverMerchantUser } from '../entites/driver-merchant/entites/driver-merchant-user.entity';
import { OrderOffer } from '../entites/orders/entities/offer.entity';
import { AgentBankAccount } from '../entites/agents/entites/bank-account.entity';
import { Agent } from '../entites/agents/entites/agent.entity';
import { Config } from '../entites/config/config.entity';
import { Account } from '../entites/accounts/account.entity';
import { Subscription } from '../entites/references/entities/subscription.entity';
import { Transaction } from '../entites/transactions/transaction.entity';
import { Permission } from '../entites/role/entities/permission.entity';
import { LocationPlace } from '../entites/orders/entities/location.entity';
import { TelegramBotUser } from '../entites/bot/bot.entity';
import { DriverDocuments } from '../entites/driver/entities/driver-documents.entity';
import { ClientDocuments } from '../entites/clients/clients-documents.entity';

const entities = [
    TransportType,
    CargoType,
    CargoTypeGroup,
    CargoStatus,
    Currency,
    Subscription,
    Role,
    Permission,
    Staff,
    Transaction,
    User,
    Client,
    Driver,
    DriverTransport,
    TransportVerification,
    Config,
    Order,
    CargoLoadMethod,
    CargoPackage,
    TransportKind,
    SubscriptionPayment,
    ClientMerchant,
    ClientBankAccount,
    ClientMerchantUser,
    DriverPhoneNumber,
    DriverDocuments,
    ClientDocuments,
    ClientPhoneNumber,
    DriverMerchant,
    DriverBankAccount,
    UserFile,
    DriverMerchantUser,
    OrderOffer,
    Account,
    Agent,
    AgentBankAccount,
    LocationPlace,
    TelegramBotUser
];

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: '65.1.148.56',
            port: 5432,
            password: 'postgres',
            username: 'postgres',
            entities: entities,
            database: 'test',
            synchronize: true,
        }),
    ],
})
export class DatabaseModule { }



