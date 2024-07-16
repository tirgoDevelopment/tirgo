import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Client, UserStates } from '../..';


@Injectable()
export class ClientsRepository extends Repository<Client> {
    constructor(private dataSource: DataSource) {
        super(Client, dataSource.createEntityManager());
    }


    async findAllClients(filter: any, order: any, index: number, size: number) {
        const queryBuilder = this.createQueryBuilder('c')
        .leftJoin("c.phoneNumbers", "phoneNumber")
        .addSelect('phoneNumber.phoneNumber')
        .leftJoin("c.user", "user")
        .addSelect(['user.id', 'user.lastLogin']);
    

        // Apply filters conditionally
        if (filter.clientId) {
         queryBuilder.andWhere('c.id = :id', { id: +filter.clientId });
        }
        if (filter.phoneNumber) {
            queryBuilder.andWhere('phoneNumber.phoneNumber LIKE :phoneNumber', { phoneNumber: `%${filter.phoneNumber.trim().replace(/\+/g, '')}%` });
        }
        if (filter.firstName) {
            queryBuilder.andWhere('c.firstName ILIKE :firstName', { firstName: `%${filter.firstName.trim()}%` });
        }
        if (filter.createdAtFrom && filter.createdAtTo) {
            queryBuilder.andWhere('c.createdAt BETWEEN :createdAtFrom AND :createdAtTo', {
                createdAtFrom: filter.createdAtFrom,
                createdAtTo: filter.createdAtTo
            });
        } else if (filter.createdAtFrom) {
            queryBuilder.andWhere('c.createdAt >= :createdAtFrom', { createdAtFrom: filter.createdAtFrom });
        } else if (filter.createdAtTo) {
            queryBuilder.andWhere('c.createdAt <= :createdAtTo', { createdAtTo: filter.createdAtTo });
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
                queryBuilder.andWhere('c.blocked = false');
                break;
            case UserStates.Blocked:
                queryBuilder.andWhere('c.blocked = true');
                break;
            case UserStates.Verified:
                queryBuilder.andWhere('c.verified = true');
                break;
            case UserStates.Unverified:
                queryBuilder.andWhere('c.verified = false');
                break;
            case UserStates.Deleted:
                queryBuilder.andWhere('c.deleted = true');
                break;
        }

          // Clone query for count
          const countQueryBuilder = queryBuilder.clone();
          const clientsCount = await countQueryBuilder.getCount();
      
          // Apply sorting
          if (order && typeof order === 'object') {
              Object.keys(order).forEach(key => {
                  queryBuilder.addOrderBy(`c.${key}`, order[key].toUpperCase());
              });
          } else {
              queryBuilder.addOrderBy('c.id', 'DESC');
          }
      
          // Apply pagination
          queryBuilder.skip(index * size).take(size);
      
          // Get paginated drivers
          const clients = await queryBuilder.getMany();

          return { data: clients, count: clientsCount };
          
      }

}
