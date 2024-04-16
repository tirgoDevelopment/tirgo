import { HttpException, Injectable } from '@nestjs/common';
import { Agent, BadRequestException, BpmResponse, Client, ClientMerchantUser, Driver, DriverMerchantUser, InternalErrorException, NotFoundException, ResponseStauses, Staff, User, UserTypes } from '.';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>
  ) { }
  getHello(): string {
    return 'Hello World!';
  }

  async getArchivedUsers(id: number, userType: string): Promise<BpmResponse> {
    try {
      const filter: any = {};
      if(id) {
        filter.id = id;
      } 
       const queryRunner = await this.usersRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.client', 'client')
        .leftJoinAndSelect('client.phoneNumbers', 'phoneNumbers')
        .leftJoinAndSelect('user.driver', 'driver')
        .leftJoinAndSelect('user.clientMerchantUser', 'clientMerchantUser')
        .leftJoinAndSelect('user.agent', 'agent')
        .leftJoinAndSelect('user.staff', 'staff')
        .leftJoinAndSelect('user.driverMerchantUser', 'driverMerchantUser')
        .leftJoinAndSelect('user.clientMerchant', 'clientMerchant')
        .select([
          'user.id',
          'user.userType',
          'client',
          'agent',
          'driver',
          'clientMerchantUser',
          'clientMerchant',
          'staff',
          'driverMerchantUser',
          'phoneNumbers'
      ])
        .where(`(client.deleted = true AND user.user_type = '${ userType ? userType : UserTypes.Client}')`)
        .orWhere(`(driver.deleted = true AND user.user_type = '${userType ? userType : UserTypes.Driver}')`)
        .orWhere(`(clientMerchantUser.deleted = true AND user.user_type = '${ userType ? userType : UserTypes.ClientMerchantUser}')`)
        .orWhere(`(clientMerchant.deleted = true AND user.user_type = '${ userType ? userType : UserTypes.ClientMerchant}')`)
        .orWhere(`(driverMerchantUser.deleted = true AND user.user_type = '${ userType ? userType : UserTypes.DriverMerchantUser}')`)
        .orWhere(`(agent.deleted = true AND user.user_type = '${ userType ? userType : UserTypes.Agent}')`)
        .orWhere(`(staff.deleted = true AND user.user_type = '${ userType ? userType : UserTypes.Staff}')`);
        if(id) {
          queryRunner.andWhere(`user.id = ${id}`)
        }
        const users = await queryRunner.getMany();

      return new BpmResponse(true, users, null);
    } catch (err: any) {
      console.log(err)
      if (err instanceof HttpException) {
        throw err;
      } else if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.RoleNotFound);
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async getArchivedUser(userId: number): Promise<BpmResponse> {
    try {

      if(!userId || isNaN(userId)) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
       const users = await this.usersRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.client', 'client')
        .leftJoinAndSelect('client.phoneNumbers', 'phoneNumbers')
        .leftJoinAndSelect('user.driver', 'driver')
        .leftJoinAndSelect('user.clientMerchantUser', 'clientMerchantUser')
        .leftJoinAndSelect('user.clientMerchant', 'clientMerchant')
        .leftJoinAndSelect('user.agent', 'agent')
        .leftJoinAndSelect('user.staff', 'staff')
        .leftJoinAndSelect('user.driverMerchantUser', 'driverMerchantUser')
        .select([
          'user.id',
          'user.userType',
          'client',
          'driver',
          'clientMerchantUser',
          'clientMerchant',
          'agent',
          'staff',
          'driverMerchantUser',
          'phoneNumbers'
      ])
        .where(`(client.deleted = true AND user.id = ${userId} AND user.user_type = '${UserTypes.Client}')`)
        .orWhere(`(driver.deleted = true AND user.id = ${userId} AND user.user_type = '${UserTypes.Driver}')`)
        .orWhere(`(clientMerchantUser.deleted = true AND user.id = ${userId} AND user.user_type = '${UserTypes.ClientMerchantUser}')`)
        .orWhere(`(clientMerchant.deleted = true AND user.id = ${userId} AND user.user_type = '${UserTypes.ClientMerchant}')`)
        .orWhere(`(driverMerchantUser.deleted = true AND user.id = ${userId} AND user.user_type = '${UserTypes.DriverMerchantUser}')`)
        .orWhere(`(agent.deleted = true AND user.id = ${userId} AND user.user_type = '${UserTypes.Agent}')`)
        .orWhere(`(staff.deleted = true AND user.id = ${userId} AND user.user_type = '${UserTypes.Staff}')`)
        .getOneOrFail();

      return new BpmResponse(true, users, null);
    } catch (err: any) {
      console.log(err)
      if (err instanceof HttpException) {
        throw err;
      } else if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.NotFound);
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }
}

// `
// SELECT * FROM "user" u
// LEFT JOIN client c on c.user_id = u.id AND c.deleted = true
// LEFT JOIN driver d on d.user_id = u.id AND d.deleted = true
// WHERE (
//   (c.deleted = true AND u.user_type = 'client') OR
//   (d.deleted = true AND u.user_type = 'driver')
//   );
// `