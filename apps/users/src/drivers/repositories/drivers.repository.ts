import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CargoStatusCodes, Driver, DriverMerchant, DriverMerchantUser, User, UserStates, UserTypes } from '../..';


@Injectable()
export class DriversRepository extends Repository<Driver> {
    constructor(private dataSource: DataSource) {
        super(Driver, dataSource.createEntityManager());
    }

    async findAllDrivers(filter: any, order: any, index: number, size: number) {
        const queryBuilder = this.createQueryBuilder('d')
            .leftJoinAndSelect("d.profileFile", "profileFile")
            .leftJoinAndSelect("d.driverTransports", "driverTransport")
            .leftJoin("d.user", "user")
            .addSelect(['user.id', 'user.lastLogin'])
            .leftJoin("d.driverMerchant", "driverMerchant")
            .addSelect(['driverMerchant.id', 'driverMerchant.email', 'driverMerchant.companyName'])
            .leftJoin("d.phoneNumbers", "phoneNumber")
            .addSelect(['phoneNumber.id', 'phoneNumber.number', 'phoneNumber.code', 'phoneNumber.isMain'])
            .leftJoin("d.createdBy", "createdBy")
            .addSelect('createdBy.id')
            .leftJoin("driverTransport.transportType", "transportType")
            .addSelect(['transportType.name', 'transportType.id'])
            .leftJoin("driverTransport.transportKind", "transportKind")
            .addSelect(['transportKind.name', 'transportKind.id'])
            .leftJoin("driverTransport.cargoLoadMethods", "cargoLoadMethod")
            .addSelect(['cargoLoadMethod.name', 'cargoLoadMethod.id']);
    
        // Apply filters conditionally
        if (filter.driverId) {
            queryBuilder.andWhere('d.id = :id', { id: +filter.driverId });
        }
        if (filter.merchantId) {
            queryBuilder.andWhere('driverMerchant.id = :id', { id: +filter.merchantId });
        }
        if (filter.phoneNumber) {
            queryBuilder.andWhere('phoneNumber.phoneNumber LIKE :phoneNumber', { phoneNumber: `%${filter.phoneNumber.trim().replace(/\+/g, '')}%` });
        }
        if (filter.phoneCode) {
            queryBuilder.andWhere('phoneNumber.code LIKE :phoneCode', { phoneCode: `%${filter.phoneCode.trim().replace(/\+/g, '')}%` });
        }
        if (filter.firstName) {
            queryBuilder.andWhere('d.firstName ILIKE :firstName', { firstName: `%${filter.firstName.trim()}%` });
        }
        if (filter.transportKindId) {
            queryBuilder.andWhere('transportKind.id = :transportKindId', { transportKindId: filter.transportKindId });
        }
        if (filter.transportTypeId) {
            queryBuilder.andWhere('transportType.id = :transportTypeId', { transportTypeId: filter.transportTypeId });
        }
        if (filter.isVerified === 'true') {
            queryBuilder.andWhere('d.is_verified = :verified', { verified: true });
        }
        if (filter.isVerified === 'false') {
            queryBuilder.andWhere('d.is_verified = :verified', { verified: false });
        }
        if (filter.createdAtFrom && filter.createdAtTo) {
            queryBuilder.andWhere('d.createdAt BETWEEN :createdAtFrom AND :createdAtTo', {
                createdAtFrom: filter.createdAtFrom,
                createdAtTo: filter.createdAtTo
            });
        } else if (filter.createdAtFrom) {
            queryBuilder.andWhere('d.createdAt >= :createdAtFrom', { createdAtFrom: filter.createdAtFrom });
        } else if (filter.createdAtTo) {
            queryBuilder.andWhere('d.createdAt <= :createdAtTo', { createdAtTo: filter.createdAtTo });
        }
        if (filter.lastLoginFrom && filter.lastLoginTo) {
            queryBuilder.andWhere('user.lastLogin BETWEEN :lastLoginFrom AND :lastLoginTo', {
                lastLoginFrom: filter.lastLoginFrom,
                lastLoginTo: filter.lastLoginTo
            });
        } else if (filter.lastLoginFrom) {
            queryBuilder.andWhere('user.lastLogin >= :lastLoginFrom', { lastLoginFrom: filter.lastLoginFrom });
        } else if (filter.lastLoginTo) {
            queryBuilder.andWhere('user.lastLogin <= :lastLoginTo', { lastLoginTo: filter.lastLoginTo });
        }
        switch (filter.state) {
            case UserStates.Active:
                queryBuilder.andWhere('d.is_blocked = false');
                break;
            case UserStates.Blocked:
                queryBuilder.andWhere('d.is_blocked = true');
                break;
            case UserStates.Verified:
                queryBuilder.andWhere('d.is_verified = true');
                break;
            case UserStates.Unverified:
                queryBuilder.andWhere('d.is_verified = false');
                break;
            case UserStates.Deleted:
                queryBuilder.andWhere('d.is_deleted = true');
                break;
            case UserStates.NotDeleted:
                queryBuilder.andWhere('d.is_deleted = false');
                break;
        }
    
        // Handle isSubscribed filter
        if (filter.isSubscribed !== undefined) {
            if (filter.isSubscribed === 'true') {
                queryBuilder.andWhere('d.subscription IS NOT NULL');
                queryBuilder.andWhere('d.subscribedAt <= :now AND d.subscribedTill >= :now', { now: new Date() });
            } else {
                queryBuilder.andWhere('d.subscription IS NULL');
            }
        }
    
        // Add logic to check if driver is busy
        queryBuilder.addSelect(subQuery => {
            return subQuery
                .select('COUNT(oo.id)', 'isBusy')
                .from('driver_order_offers', 'oo')
                .innerJoin('oo.order', 'o')
                .innerJoin('o.cargoStatus', 'cs')
                .where('oo.is_accepted = TRUE')
                .andWhere('oo.driver_id = d.id')
                .andWhere('(o.is_secure_transaction = FALSE AND cs.code = :acceptedCode)')
                .orWhere('(o.is_secure_transaction = TRUE AND cs.code IN (:...safeCodes))')
                .setParameters({
                    acceptedCode: CargoStatusCodes.Accepted,
                    safeCodes: [CargoStatusCodes.Accepted, CargoStatusCodes.Completed]
                });
        }, 'isBusy');
    
        // Clone query for count
        const countQueryBuilder = queryBuilder.clone();
        const driversCount = await countQueryBuilder.getCount();
    
        // Apply sorting
        if (order && typeof order === 'object') {
            Object.keys(order).forEach(key => {
                queryBuilder.addOrderBy(`d.${key}`, order[key].toUpperCase());
            });
        } else {
            queryBuilder.addOrderBy('d.id', 'DESC');
        }
    
        // Apply pagination
        queryBuilder.skip(index * size).take(size);
    
        // Get paginated drivers
        const drivers = await queryBuilder.getMany();
    
        // Ensure isBusy property is boolean
        drivers.forEach(driver => {
            driver['isBusy'] = !!driver['isBusy']; // Convert count to boolean
        });
    
        return { data: drivers, count: driversCount };
    } 

    async findAllAgentDrivers(filter: any, order: any, index: number, size: number) {

        const queryBuilder = this.createQueryBuilder('d')
            .leftJoinAndSelect("d.agent", "agent")
            .leftJoinAndSelect("d.profileFile", "profileFile")
            .leftJoinAndSelect("d.driverTransports", "driverTransport")
            .leftJoin("d.user", "user")
            .addSelect(['user.id', 'user.lastLogin'])
            .leftJoin("d.driverMerchant", "driverMerchant")
            .addSelect(['driverMerchant.id', 'driverMerchant.email', 'driverMerchant.companyName'])
            .leftJoin("d.phoneNumbers", "phoneNumber")
            .addSelect(['phoneNumber.id', 'phoneNumber.number', 'phoneNumber.code', 'phoneNumber.isMain'])
            .leftJoin("d.createdBy", "createdBy")
            .addSelect('createdBy.id')
            .leftJoin("driverTransport.transportType", "transportType")
            .addSelect(['transportType.name', 'transportType.id'])
            .leftJoin("driverTransport.transportKind", "transportKind")
            .addSelect(['transportKind.name', 'transportKind.id'])
            .where('agent.id = :id', { id: +filter.agentId });
    
        // Apply filters conditionally
        if (filter.driverId) {
            queryBuilder.andWhere('d.id = :id', { id: +filter.driverId });
        }
        if (filter.firstName) {
            queryBuilder.andWhere('d.firstName ILIKE :firstName', { firstName: `%${filter.firstName.trim()}%` });
        }
        if (filter.createdAtFrom && filter.createdAtTo) {
            queryBuilder.andWhere('d.createdAt BETWEEN :createdAtFrom AND :createdAtTo', {
                createdAtFrom: filter.createdAtFrom,
                createdAtTo: filter.createdAtTo
            });
        } else if (filter.createdAtFrom) {
            queryBuilder.andWhere('d.createdAt >= :createdAtFrom', { createdAtFrom: filter.createdAtFrom });
        } else if (filter.createdAtTo) {
            queryBuilder.andWhere('d.createdAt <= :createdAtTo', { createdAtTo: filter.createdAtTo });
        }

        switch (filter.state) {
            case UserStates.Active:
                queryBuilder.andWhere('d.is_blocked = false');
                break;
            case UserStates.Blocked:
                queryBuilder.andWhere('d.is_blocked = true');
                break;
            case UserStates.Verified:
                queryBuilder.andWhere('d.is_verified = true');
                break;
            case UserStates.Unverified:
                queryBuilder.andWhere('d.is_verified = false');
                break;
            case UserStates.Deleted:
                queryBuilder.andWhere('d.is_deleted = true');
                break;
        }
    
        // Handle isSubscribed filter
        if (filter.isSubscribed !== undefined) {
            if (filter.isSubscribed === 'true') {
                queryBuilder.andWhere('d.subscription IS NOT NULL');
                queryBuilder.andWhere('d.subscribedAt <= :now AND d.subscribedTill >= :now', { now: new Date() });
            } else {
                queryBuilder.andWhere('d.subscription IS NULL');
            }
        }
    
        // Add logic to check if driver is busy
        queryBuilder.addSelect(subQuery => {
            return subQuery
                .select('COUNT(oo.id)', 'isBusy')
                .from('driver_order_offers', 'oo')
                .innerJoin('oo.order', 'o')
                .innerJoin('o.cargoStatus', 'cs')
                .where('oo.is_accepted = TRUE')
                .andWhere('oo.driver_id = d.id')
                .andWhere('(o.is_secure_transaction = FALSE AND cs.code = :acceptedCode)')
                .orWhere('(o.is_secure_transaction = TRUE AND cs.code IN (:...safeCodes))')
                .setParameters({
                    acceptedCode: CargoStatusCodes.Accepted,
                    safeCodes: [CargoStatusCodes.Accepted, CargoStatusCodes.Completed]
                });
        }, 'isBusy');
    
        // Clone query for count
        const countQueryBuilder = queryBuilder.clone();
        const driversCount = await countQueryBuilder.getCount();
    
        // Apply sorting
        if (order && typeof order === 'object') {
            Object.keys(order).forEach(key => {
                queryBuilder.addOrderBy(`d.${key}`, order[key].toUpperCase());
            });
        } else {
            queryBuilder.addOrderBy('d.id', 'DESC');
        }
    
        // Apply pagination
        queryBuilder.skip(index * size).take(size);
    
        // Get paginated drivers
        const drivers = await queryBuilder.getMany();
    
        // Ensure isBusy property is boolean
        drivers.forEach(driver => {
            driver['isBusy'] = !!driver['isBusy']; // Convert count to boolean
        });
    
        return { data: drivers, count: driversCount };
    }
    

}
