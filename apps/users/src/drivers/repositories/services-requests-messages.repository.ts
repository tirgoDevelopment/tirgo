import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ServicesRequestsStatusesCodes, DriversServicesRequestsMessages } from '../..';


@Injectable()
export class DriversServicesRequestsMessagesRepository extends Repository<DriversServicesRequestsMessages> {
    constructor(private dataSource: DataSource) {
        super(DriversServicesRequestsMessages, dataSource.createEntityManager());
    }

    async findAll(filter: any, order: any, index: number, size: number) {
        const queryBuilder = this.createQueryBuilder('m')
            .leftJoinAndSelect("m.driverServiceRequest", "driverServiceRequest")
            .leftJoin("m.createdBy", "createdBy")
            .addSelect(['createdBy.id', 'createdBy.userType', 'createdBy.lastLogin'])
            .leftJoin("m.deletedBy", "deletedBy")
            .addSelect(['deletedBy.id', 'deletedBy.userType', 'deletedBy.lastLogin'])
            .leftJoin("m.readBy", "readBy")
            .addSelect(['readBy.id', 'readBy.userType', 'readBy.lastLogin'])
            .leftJoin("m.repliedTo", "repliedTo")
            .addSelect(['repliedTo.id', 'repliedTo.messageType', 'repliedTo.message'])
            .where('m.isDeleted = false')
            .andWhere('m.service_request_id = :driverServiceRequestId', { driverServiceRequestId: filter.driverServiceRequestId })
    
        // Apply filters conditionally
        if (filter.createdAtFrom && filter.createdAtTo) {
            queryBuilder.andWhere('m.createdAt BETWEEN :createdAtFrom AND :createdAtTo', {
                createdAtFrom: filter.createdAtFrom,
                createdAtTo: filter.createdAtTo
            });
        } else if (filter.createdAtFrom) {
            queryBuilder.andWhere('m.createdAt >= :createdAtFrom', { createdAtFrom: filter.createdAtFrom });
        } else if (filter.createdAtTo) {
            queryBuilder.andWhere('m.createdAt <= :createdAtTo', { createdAtTo: filter.createdAtTo });
        }
    
        // Clone query for count
        const countQueryBuilder = queryBuilder.clone();
        const count = await countQueryBuilder.getCount();
    
        // Apply sorting
        if (order && typeof order === 'object') {
            Object.keys(order).forEach(key => {
                queryBuilder.addOrderBy(`m.${key}`, order[key].toUpperCase());
            });
        } else {
            console.log('ASC')
            queryBuilder.addOrderBy('m.id', 'ASC');
        }
    
        // Apply pagination
        queryBuilder.skip((index - 1) * size).take(size);
    
        // Get paginated drivers
        const data = await queryBuilder.getMany();
    
        return { data, count };
    }     

}
