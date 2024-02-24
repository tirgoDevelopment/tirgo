import { Module } from "@nestjs/common";
import { Agent, AgentBankAccount, AwsService, Currency, Driver, DriverPhoneNumber, Role, Staff, Subscription, SundryService, Transaction, User } from "..";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AgentsController } from "./controllers/agents.controller";
import { AgentsService } from "./services/agents.service";
import { AgentDriversController } from "./controllers/agent-driver.controller";
import { AgentDriversService } from "./services/agent-driver.service";


@Module({
    imports: [
        TypeOrmModule.forFeature([ Agent, User, Role, AgentBankAccount, Driver, Transaction, Currency, Subscription, DriverPhoneNumber ]),
      ],
      controllers: [
        AgentsController,
        AgentDriversController
      ],
      providers: [
        SundryService,
        AwsService,
        AgentsService,
        AgentDriversService
      ],
      exports: [
        TypeOrmModule.forFeature([ Agent, User, Role, AgentBankAccount, Driver, Transaction, Currency, Subscription, DriverPhoneNumber ]),
      ]
})
export class AgentsModule {

}