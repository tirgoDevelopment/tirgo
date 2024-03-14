import { HttpException, Injectable } from '@nestjs/common';
import { BpmResponse, InternalErrorException, ResponseStauses, NoContentException, BadRequestException, Role, Permission, RoleDto } from '../..';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
        @InjectRepository(Permission) private readonly permissionsRepository: Repository<Permission>
    ) { }

    async createRole(createRoleDto: RoleDto): Promise<BpmResponse> {
        const queryRunner = this.rolesRepository.manager.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const role: Role = new Role();
            role.name = createRoleDto.name;
            role.description = createRoleDto.description;

            // Save role
            const savedRole = await queryRunner.manager.save(Role, role);

            // Create permission associated with the role
            const permission: Permission = new Permission();
            permission.role = savedRole; // Assuming there is a roleId property in the Permission entity
            permission.addDriver = createRoleDto.permission?.addDriver
            permission.addClient = createRoleDto.permission?.addClient
            permission.addOrder = createRoleDto.permission?.addOrder
            permission.cancelOrder = createRoleDto.permission?.cancelOrder
            permission.seeDriversInfo = createRoleDto.permission?.seeDriversInfo
            permission.seeClientsInfo = createRoleDto.permission?.seeClientsInfo
            permission.sendPush = createRoleDto.permission?.sendPush
            permission.chat = createRoleDto.permission?.chat
            permission.tracking = createRoleDto.permission?.tracking
            permission.driverFinance = createRoleDto.permission?.driverFinance
            permission.verifyDriver = createRoleDto.permission?.verifyDriver
            permission.clientMerchantFinance = createRoleDto.permission?.clientMerchantFinance;
            permission.driverMerchantFinance = createRoleDto.permission?.driverMerchantFinance;
            permission.registerClientMerchant = createRoleDto.permission?.registerClientMerchant;
            permission.registerDriverMerchant = createRoleDto.permission?.registerDriverMerchant;
            permission.clientMerchantList = createRoleDto.permission?.clientMerchantList;
            permission.driverMerchantList = createRoleDto.permission?.driverMerchantList;
            permission.adminPage = createRoleDto.permission?.adminPage;
            permission.finRequest = createRoleDto.permission?.finRequest;
            permission.clientMerchantPage = createRoleDto.permission?.clientMerchantPage;
            permission.driverMerchantPage = createRoleDto.permission?.driverMerchantPage;
            permission.driverVerification = createRoleDto.permission?.driverVerification;
            permission.agentPage = createRoleDto.permission?.agentPage;

            // Save permission
            await queryRunner.manager.save(Permission, permission);

            await queryRunner.commitTransaction();

            return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
        } catch (err: any) {
            console.log(err)
            await queryRunner.rollbackTransaction();
            throw new InternalErrorException(ResponseStauses.CreateDataFailed);
        } finally {
            await queryRunner.release();
        }
    }

    async updateRole(updateRoleDto: RoleDto): Promise<BpmResponse> {
        const queryRunner = this.rolesRepository.manager.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Find the existing role 
            const existingRole = await queryRunner.manager.findOne(Role, { where: { id: updateRoleDto.id } });

            if (!existingRole) {
                return new BpmResponse(false, null, [ResponseStauses.NotFound]);
            }

            // Update role properties
            existingRole.name = updateRoleDto.name || existingRole.name;
            existingRole.description = updateRoleDto.description || existingRole.description;

            // Save updated role
            const updatedRole = await queryRunner.manager.save(Role, existingRole);

            // Find the associated permission
            const existingPermission = await queryRunner.manager.findOne(Permission, {
                where: { role: { id: updatedRole.id } },
            });

            if (!existingPermission) {
                return new BpmResponse(false, null, [ResponseStauses.NotFound]);
            }

            // Update permission properties
            existingPermission.addDriver = updateRoleDto.permission?.addDriver
            existingPermission.addClient = updateRoleDto.permission?.addClient
            existingPermission.addOrder = updateRoleDto.permission?.addOrder
            existingPermission.cancelOrder = updateRoleDto.permission?.cancelOrder
            existingPermission.seeDriversInfo = updateRoleDto.permission?.seeDriversInfo
            existingPermission.seeClientsInfo = updateRoleDto.permission?.seeClientsInfo
            existingPermission.sendPush = updateRoleDto.permission?.sendPush
            existingPermission.chat = updateRoleDto.permission?.chat
            existingPermission.tracking = updateRoleDto.permission?.tracking
            existingPermission.driverFinance = updateRoleDto.permission?.driverFinance
            existingPermission.verifyDriver = updateRoleDto.permission?.verifyDriver
            existingPermission.clientMerchantFinance = updateRoleDto.permission?.clientMerchantFinance;
            existingPermission.driverMerchantFinance = updateRoleDto.permission?.driverMerchantFinance;
            existingPermission.registerClientMerchant = updateRoleDto.permission?.registerClientMerchant;
            existingPermission.registerDriverMerchant = updateRoleDto.permission?.registerDriverMerchant;
            existingPermission.clientMerchantList = updateRoleDto.permission?.clientMerchantList;
            existingPermission.driverMerchantList = updateRoleDto.permission?.driverMerchantList;
            existingPermission.adminPage = updateRoleDto.permission?.adminPage;
            existingPermission.finRequest = updateRoleDto.permission?.finRequest;
            existingPermission.clientMerchantPage = updateRoleDto.permission?.clientMerchantPage;
            existingPermission.driverMerchantPage = updateRoleDto.permission?.driverMerchantPage;
            existingPermission.driverVerification = updateRoleDto.permission?.driverVerification;
            existingPermission.agentPage = updateRoleDto.permission?.agentPage;

            // Save updated permission
            await queryRunner.manager.save(Permission, existingPermission);

            await queryRunner.commitTransaction();

            return new BpmResponse(true, null, [ResponseStauses.SuccessfullyUpdated]);
        } catch (err: any) {
            await queryRunner.rollbackTransaction();
            return new BpmResponse(false, null, [ResponseStauses.UpdateDataFailed]);
        } finally {
            await queryRunner.release();
        }
    }

    async getRoleById(id: string): Promise<BpmResponse> {
        try {
            if (!id) {
                throw new BadRequestException(ResponseStauses.IdIsRequired);
            }
            const role = await this.rolesRepository.findOneOrFail({ where: { id, deleted: false } });
            return new BpmResponse(true, role, null);
        } catch (err: any) {
            if (err.name == 'EntityNotFoundError') {
                // Client not found
                throw new NoContentException();
            } else {
                // Other error (handle accordingly)
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
            }
        }
    }

    async getAllRoles(): Promise<BpmResponse> {
        try {
            const roles = await this.rolesRepository.find({ where: { deleted: false }, relations: ['permission'] });
            if (!roles.length) {
                throw new NoContentException();
            }
            return new BpmResponse(true, roles, null);
        } catch (err: any) {
            if (err.name == 'EntityNotFoundError') {
                // Client not found
                throw new NoContentException();
            } else if (err instanceof HttpException) {
                throw err
            } else {
                // Other error (handle accordingly)
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
            }
        }
    }

    async getAllPermissions(): Promise<BpmResponse> {
        try {
            const permissions = await this.permissionsRepository.find({ where: { deleted: false } });
            if (!permissions.length) {
                throw new NoContentException();
            }
            return new BpmResponse(true, permissions, null);
        } catch (err: any) {
            if (err.name == 'EntityNotFoundError') {
                // Client not found
                throw new NoContentException();
            } else if (err instanceof HttpException) {
                throw err
            } else {
                // Other error (handle accordingly)
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
            }
        }
    }

}