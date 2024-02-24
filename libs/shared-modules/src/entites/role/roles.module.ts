import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from "./entities/permission.entity";
import { Role } from "./entities/role.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Role, Permission]),
    ],
    controllers: [
    ],
    providers: [
    ],
    exports: [
        TypeOrmModule.forFeature([Role, Permission]),
    ]
})
export class RolesModule {

}