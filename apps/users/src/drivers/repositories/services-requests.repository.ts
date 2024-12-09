import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ServicesRequestsStatusesCodes, DriversServicesRequests } from '../..';


@Injectable()
export class DriversServicesRequestsRepository extends Repository<DriversServicesRequests> {
    constructor(private dataSource: DataSource) {
        super(DriversServicesRequests, dataSource.createEntityManager());
    }

    async findAll(filter: any, order: any, index: number, size: number) {
        const queryBuilder = this.createQueryBuilder('sr')
            .leftJoinAndSelect("sr.amountDetails", "amountDetails")
            .leftJoinAndSelect("amountDetails.driverService", "driverService")
            .leftJoinAndSelect("sr.statusesHistory", "statusesHistory")
            .leftJoin("statusesHistory.createdBy", "historyCreatedBy")
            .addSelect(['historyCreatedBy.id', 'historyCreatedBy.userType', 'historyCreatedBy.lastLogin'])
            .leftJoinAndSelect("statusesHistory.status", "historyStatus")
            .leftJoinAndSelect("sr.driver", "driver")
            .leftJoinAndSelect("driver.driverTransports", "driverTransports")
            .leftJoinAndSelect("driverTransports.transportType", "transportType")
            .leftJoinAndSelect("driverTransports.transportKind", "transportKind")
            .leftJoinAndSelect("driverTransports.cargoLoadMethods", "cargoLoadMethods")
            .leftJoinAndSelect("sr.services", "services")
            .leftJoinAndSelect("sr.status", "status")
            .leftJoin("sr.createdBy", "createdBy")
            .addSelect(['createdBy.id', 'createdBy.userType', 'createdBy.lastLogin'])
            .leftJoin("sr.canceledBy", "canceledBy")
            .addSelect(['canceledBy.id', 'canceledBy.userType', 'canceledBy.lastLogin'])
            .leftJoin("sr.deletedBy", "deletedBy")
            .addSelect(['deletedBy.id', 'deletedBy.userType', 'deletedBy.lastLogin'])
            .where('sr.isDeleted = false')
    
        // Apply filters conditionally
        if (filter.driverId) {
            queryBuilder.andWhere('driver.id = :id', { id: +filter.driverId });
        }
        if (filter.createdAtFrom && filter.createdAtTo) {
            queryBuilder.andWhere('sr.createdAt BETWEEN :createdAtFrom AND :createdAtTo', {
                createdAtFrom: filter.createdAtFrom,
                createdAtTo: filter.createdAtTo
            });
        } else if (filter.createdAtFrom) {
            queryBuilder.andWhere('sr.createdAt >= :createdAtFrom', { createdAtFrom: filter.createdAtFrom });
        } else if (filter.createdAtTo) {
            queryBuilder.andWhere('sr.createdAt <= :createdAtTo', { createdAtTo: filter.createdAtTo });
        }
        switch (+filter.statusCode) {
            case ServicesRequestsStatusesCodes.Active:
                queryBuilder.andWhere('status.code IN (:...statusCodes)', { statusCodes: [ServicesRequestsStatusesCodes.Working, ServicesRequestsStatusesCodes.Waiting, ServicesRequestsStatusesCodes.Priced] });
                break;
            case ServicesRequestsStatusesCodes.Completed:
                console.log(filter.statusCode)
                queryBuilder.andWhere('status.code = :statusCode', { statusCode: ServicesRequestsStatusesCodes.Completed });
                break;
        }

    
        // Clone query for count
        const countQueryBuilder = queryBuilder.clone();
        const count = await countQueryBuilder.getCount();
    
        // Apply sorting
        if (order && typeof order === 'object') {
            Object.keys(order).forEach(key => {
                queryBuilder.addOrderBy(`sr.${key}`, order[key].toUpperCase());
            });
        } else {
            queryBuilder.addOrderBy('sr.id', 'DESC');
        }
    
        // Apply pagination
        queryBuilder.skip((index - 1) * size).take(size);
    
        // Get paginated drivers
        const data = await queryBuilder.getMany();
    
        return { data, count };
    }     

}
