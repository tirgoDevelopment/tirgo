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
            .leftJoinAndSelect("d.agent", "agent")
            .leftJoinAndSelect("d.subscription", "subscription")
            .leftJoinAndSelect("d.driverTransports", "driverTransport")
            .leftJoin("d.user", "user")
            .addSelect(['user.id', 'user.lastLogin'])
            .leftJoin("d.driverMerchant", "driverMerchant")
            .addSelect(['driverMerchant.id', 'driverMerchant.email', 'driverMerchant.companyName'])
            .leftJoin("d.phoneNumbers", "phoneNumber")
            .addSelect('phoneNumber.phoneNumber')
            .leftJoin("d.createdBy", "createdBy")
            .addSelect('createdBy.id')
            .leftJoin("driverTransport.transportTypes", "transportType")
            .addSelect(['transportType.name', 'transportType.id'])
            .leftJoin("driverTransport.transportKinds", "transportKind")
            .addSelect(['transportKind.name', 'transportKind.id']);
    
        // Apply filters conditionally
        if (filter.driverId) {
            queryBuilder.andWhere('d.id = :id', { id: +filter.driverId });
        }
        if (filter.phoneNumber) {
            queryBuilder.andWhere('phoneNumber.phoneNumber LIKE :phoneNumber', { phoneNumber: `%${filter.phoneNumber.trim().replace(/\+/g, '')}%` });
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
            queryBuilder.andWhere('d.verified = :verified', { verified: true });
        }
        if (filter.isVerified === 'false') {
            queryBuilder.andWhere('d.verified = :verified', { verified: false });
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
                queryBuilder.andWhere('d.blocked = false');
                break;
            case UserStates.Blocked:
                queryBuilder.andWhere('d.blocked = true');
                break;
            case UserStates.Verified:
                queryBuilder.andWhere('d.verified = true');
                break;
            case UserStates.Unverified:
                queryBuilder.andWhere('d.verified = false');
                break;
            case UserStates.Deleted:
                queryBuilder.andWhere('d.deleted = true');
                break;
            case UserStates.NotDeleted:
                queryBuilder.andWhere('d.deleted = false');
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
                .from('order_offer', 'oo')
                .innerJoin('oo.order', 'o')
                .innerJoin('o.cargoStatus', 'cs')
                .where('oo.accepted = TRUE')
                .andWhere('oo.driver_id = d.id')
                .andWhere('(o.isSafeTransaction = FALSE AND cs.code = :acceptedCode)')
                .orWhere('(o.isSafeTransaction = TRUE AND cs.code IN (:...safeCodes))')
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

    async findAllMerchantDrivers(filter: any, order: any, index: number, size: number) {
        const queryBuilder = this.createQueryBuilder('d')
            .leftJoinAndSelect('d.subscription', 'subscription')
            .leftJoinAndSelect('d.driverTransports', 'driverTransports')
            .leftJoinAndSelect('driverTransports.transportKinds', 'transportKinds')
            .leftJoinAndSelect('d.agent', 'agent')
            .leftJoin('d.phoneNumbers', 'phoneNumber')
            .addSelect('phoneNumber.phoneNumber')
            .addSelect('phoneNumber.id')
            .leftJoin('d.user', 'user')
            .addSelect('user.lastLogin')
            .addSelect('user.id')
            .addSelect('user.userType')
            .leftJoin(User, 'u', 'u.id = d.created_by')
            .leftJoin(DriverMerchantUser, 'dmu', 'dmu.user_id = u.id')
            .leftJoin(DriverMerchant, 'dm', 'dm.id = dmu.driver_merchant_id')
            .where('u.user_type = :userType AND dm.id = :merchantId AND d.deleted = true', {
                userType: UserTypes.DriverMerchantUser,
                merchantId: filter.merchantId
            });
    
        // Apply state filter
        switch (filter.state) {
            case UserStates.Active:
                queryBuilder.andWhere('d.blocked = false');
                break;
            case UserStates.Blocked:
                queryBuilder.andWhere('d.blocked = true');
                break;
            case UserStates.Verified:
                queryBuilder.andWhere('d.verified = true');
                break;
            case UserStates.Unverified:
                queryBuilder.andWhere('d.verified = false');
                break;
            case UserStates.Deleted:
                queryBuilder.andWhere('d.deleted = true');
                break;
        }
    
        
        // Add logic to check if driver is busy
        queryBuilder.addSelect(subQuery => {
            return subQuery
                .select('COUNT(oo.id)', 'isBusy')
                .from('order_offer', 'oo')
                .innerJoin('oo.order', 'o')
                .innerJoin('o.cargoStatus', 'cs')
                .where('oo.accepted = TRUE')
                .andWhere('oo.driver_id = d.id')
                .andWhere('(o.isSafeTransaction = FALSE AND cs.code = :acceptedCode)')
                .orWhere('(o.isSafeTransaction = TRUE AND cs.code IN (:...safeCodes))')
                .setParameters({
                    acceptedCode: CargoStatusCodes.Accepted,
                    safeCodes: [CargoStatusCodes.Accepted, CargoStatusCodes.Completed]
                });
        }, 'isBusy');

        // Get the count of drivers with filters applied
        const driversCount = await queryBuilder.getCount();
    
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
            .leftJoinAndSelect("d.subscription", "subscription")
            .leftJoinAndSelect("d.driverTransports", "driverTransport")
            .leftJoin("d.user", "user")
            .addSelect(['user.id', 'user.lastLogin'])
            .leftJoin("d.driverMerchant", "driverMerchant")
            .addSelect(['driverMerchant.id', 'driverMerchant.email', 'driverMerchant.companyName'])
            .leftJoin("d.phoneNumbers", "phoneNumber")
            .addSelect('phoneNumber.phoneNumber')
            .leftJoin("d.createdBy", "createdBy")
            .addSelect('createdBy.id')
            .leftJoin("driverTransport.transportTypes", "transportType")
            .addSelect(['transportType.name', 'transportType.id'])
            .leftJoin("driverTransport.transportKinds", "transportKind")
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
                queryBuilder.andWhere('d.blocked = false');
                break;
            case UserStates.Blocked:
                queryBuilder.andWhere('d.blocked = true');
                break;
            case UserStates.Verified:
                queryBuilder.andWhere('d.verified = true');
                break;
            case UserStates.Unverified:
                queryBuilder.andWhere('d.verified = false');
                break;
            case UserStates.Deleted:
                queryBuilder.andWhere('d.deleted = true');
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
                .from('order_offer', 'oo')
                .innerJoin('oo.order', 'o')
                .innerJoin('o.cargoStatus', 'cs')
                .where('oo.accepted = TRUE')
                .andWhere('oo.driver_id = d.id')
                .andWhere('(o.isSafeTransaction = FALSE AND cs.code = :acceptedCode)')
                .orWhere('(o.isSafeTransaction = TRUE AND cs.code IN (:...safeCodes))')
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
