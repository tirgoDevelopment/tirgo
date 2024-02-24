import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from "./entites/agent.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Agent]),
    ],
    controllers: [
    ],
    providers: [
    ],
    exports: [
        TypeOrmModule.forFeature([Agent]),
    ]
})
export class AgentsModule {

}