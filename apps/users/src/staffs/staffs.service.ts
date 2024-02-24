import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, BpmResponse, CreateStaffDto, InternalErrorException, NoContentException, NotFoundException, ResponseStauses, Role, Staff, SundryService, User, UserTypes } from '..';

@Injectable()
export class StaffsService {

    constructor(
        @InjectRepository(Staff) private readonly staffsRepository: Repository<Staff>,
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
        private sundriesService: SundryService
    ) { }

    async createStaff(createStaffDto: CreateStaffDto): Promise<BpmResponse> {
        try {   
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

    async updateStaff(updateStaffDto: CreateStaffDto): Promise<BpmResponse> {
        try {   
            const staff: Staff = new Staff();
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

    async getAllStaffs(): Promise<BpmResponse> {
        try {   
            const staffs: Staff[] = await this.staffsRepository.find({ where: { deleted: false } });
            if(staffs.length) {
                return new BpmResponse(true, staffs);
            } else {
                throw new NoContentException();
            }
        } catch (err: any) {
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
}