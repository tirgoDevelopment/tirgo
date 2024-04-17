import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AppendDriversToTmsDto, BadRequestException, BpmResponse, CreateStaffDto, Driver, DriverMerchant, InternalErrorException, NoContentException, NotFoundException, ResponseStauses, Role, Staff, SundryService, User, UserTypes } from '..';
import { UpdateStaffDto } from '@app/shared-modules/entites/staffs/staff.dto';

@Injectable()
export class StaffsService {

    constructor(
        @InjectRepository(Staff) private readonly staffsRepository: Repository<Staff>,
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
        @InjectRepository(Driver) private readonly driversRepository: Repository<Driver>,
        @InjectRepository(DriverMerchant) private readonly driverMerchantsRepository: Repository<DriverMerchant>,
        private sundriesService: SundryService
    ) { }

    async createStaff(createStaffDto: CreateStaffDto): Promise<BpmResponse> {
        try {   
            if (!(/[a-zA-Z]/.test(createStaffDto.password) && /\d/.test(createStaffDto.password))) {
                throw new BadRequestException(ResponseStauses.PasswordShouldCointainNumStr);
              }
            const passwordHash = await this.sundriesService.generateHashPassword(createStaffDto.password);
            const role: Role = await this.rolesRepository.findOneOrFail({ where: { id: createStaffDto.roleId } });
            const user: User =  await this.usersRepository.save({ userType: UserTypes.Staff, password: passwordHash, role: role });
            const staff: Staff = new Staff();
            staff.user = user;
            staff.fullName = createStaffDto.fullName;
            staff.phone = createStaffDto.phone;
            staff.username = createStaffDto.username;

            await this.staffsRepository.save(staff);

            return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
        } catch (err: any) {
            if (err instanceof HttpException) {
                throw err;
            } else if(err.name == 'EntityNotFoundError') {
                throw new NotFoundException(ResponseStauses.RoleNotFound);
            } else if (err.code === '23505') {
                throw new InternalErrorException(ResponseStauses.DuplicateError, err.message);
            } else {
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
            }
        }
    }

    async updateStaff(updateStaffDto: UpdateStaffDto): Promise<BpmResponse> {
        try {   
            if(!updateStaffDto.id || isNaN(updateStaffDto.id)) {
                throw  new BadRequestException(ResponseStauses.IdIsRequired);
            }
            const staff: Staff = await this.staffsRepository.findOneOrFail({ where: { id: updateStaffDto.id } })
            staff.fullName = updateStaffDto.fullName;
            staff.phone = updateStaffDto.phone;
            staff.username = updateStaffDto.username;

            await this.staffsRepository.save(staff);

            return new BpmResponse(true, null, [ResponseStauses.SuccessfullyUpdated]);
        } catch (err: any) {
            if (err instanceof HttpException) {
                throw err;
            } else if(err.name == 'EntityNotFoundError') {
                throw new NotFoundException(ResponseStauses.RoleNotFound);
            } else if (err.code === '23505') {
                throw new InternalErrorException(ResponseStauses.DuplicateError, err.message);
            } else {
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
            }
        }
    }

    async getAllStaffs(pageSize: string, pageIndex: string, sortBy: string, sortType: string): Promise<BpmResponse> {
        try {   
            const size = +pageSize || 10; // Number of items per page
            const index = +pageIndex || 1
            const sort: any = {};
            if(sortBy && sortType) {
                // Sort by the specified column and type
                sort[`staff.${sortBy}`] = sortType.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'; 
            } else {
                // Default sorting by 'id' column in descending order
                sort['staff.id'] = 'DESC';
            }
    
            const staffs: Staff[] = await this.staffsRepository.createQueryBuilder("staff")
            .leftJoin("staff.user", "user")
            .addSelect('user.id')
            .addSelect('user.userType')
            .addSelect('user.lastLogin')
            .leftJoinAndSelect('user.role', 'role')
            .where("staff.deleted = :deleted", { deleted: false })
            .skip((index - 1) * size) // Skip the number of items based on the page number
            .take(size)
            .orderBy(sort)
            .getMany();

            if(staffs.length) {
                const staffsCount = await this.staffsRepository.count({ where: { deleted: false } })
                const totalPagesCount = Math.ceil(staffsCount / size);
                return new BpmResponse(true, { content: staffs, totalPagesCount, pageIndex: index, pageSize: size });
            } else {
                throw new NoContentException();
            }
        } catch (err: any) {
            console.log(err)
            if (err instanceof HttpException) {
                throw err;
            } else {
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
            }
        }
    }

    async getStaff(id: number): Promise<BpmResponse> {
        try {   
            if(!id || isNaN(id)) {
                throw new BadRequestException(ResponseStauses.IdIsRequired)
            }
            const staff: Staff = await this.staffsRepository.findOneOrFail({ where: { deleted: false, id } });
            return new BpmResponse(true, staff);
        } catch (err: any) {
            if (err instanceof HttpException) {
                throw err;
            } else if(err.name == 'EntityNotFoundError') {
                throw new NotFoundException(ResponseStauses.RoleNotFound);
            } else {
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
            }
        }
    }

    async deleteStaff(id: number): Promise<BpmResponse> {
        try {   
            if(!id || isNaN(id)) {
                throw new BadRequestException(ResponseStauses.IdIsRequired)
            }
            const staff: Staff = await this.staffsRepository.findOneOrFail({ where: { deleted: false, id } });
            staff.deleted = true;
            staff.username = '_'+staff.username;
            await this.staffsRepository.save(staff);
            return new BpmResponse(true, staff);
        } catch (err: any) {
            if (err instanceof HttpException) {
                throw err;
            } else if(err.name == 'EntityNotFoundError') {
                throw new NotFoundException(ResponseStauses.RoleNotFound);
            } else {
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
            }
        }
    }

    async blockStaff(id: number, blockReason: string, user: User): Promise<BpmResponse> {
        try {   
            if(!id || isNaN(id)) {
                throw new BadRequestException(ResponseStauses.IdIsRequired)
            }
            const staff: Staff = await this.staffsRepository.findOneOrFail({ where: { deleted: false, id } });
            staff.blocked = true;
            staff.blockedAt = new Date();
            staff.blockReason = blockReason;
            staff.blockedBy = user;

            await this.staffsRepository.save(staff);
            return new BpmResponse(true, staff);
        } catch (err: any) {
            if (err instanceof HttpException) {
                throw err;
            } else if(err.name == 'EntityNotFoundError') {
                throw new NotFoundException(ResponseStauses.RoleNotFound);
            } else {
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
            }
        }
    }

    
  async appendDriverToMerchant(dto: AppendDriversToTmsDto, user: User): Promise<BpmResponse> {
    try {
      if(user.userType !== UserTypes.Staff) {
          throw new BadRequestException(ResponseStauses.AccessDenied);
      }
      const drivers: Driver[] = await this.driversRepository.find({ where: { id: In(dto.driverIds) }, relations: ['driverMerchant'] });
      const isAppandedExists = drivers.some((el: any) => el.driverMerchant);
      if(isAppandedExists) {
        throw new BadRequestException(ResponseStauses.AlreadyAppended);
      }
      const merchant: DriverMerchant = await this.driverMerchantsRepository.findOneOrFail({ where: { id: dto.driverMerchantId }, relations: ['drivers'] });
      if(merchant.drivers?.length) {
        merchant.drivers = [ ...merchant.drivers, ...drivers];
      } else {
        merchant.drivers = drivers;
      }
      await this.driverMerchantsRepository.save(merchant);
      return new BpmResponse(true, null, null);
    } catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(ResponseStauses.UserNotFound);
      } else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError);
      }
    }
  }
}