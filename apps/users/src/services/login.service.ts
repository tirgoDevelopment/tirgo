import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, BpmResponse, ClientMerchant, ClientMerchantUser, CustomJwtService, Driver, DriverMerchant, DriverMerchantUser, InternalErrorException, NotFoundException, ResponseStauses, SmsService, Staff, SundryService, User, UserTypes, } from '..';
import { LoginDto } from '../auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoginService {

    constructor(
        @InjectRepository(ClientMerchant) private readonly clientMerchantsRepository: Repository<ClientMerchant>,
        @InjectRepository(ClientMerchantUser) private readonly clientMerchantUsersRepository: Repository<ClientMerchantUser>,
        @InjectRepository(DriverMerchant) private readonly driverMerchantsRepository: Repository<DriverMerchant>,
        @InjectRepository(DriverMerchantUser) private readonly driverMerchantUsersRepository: Repository<DriverMerchantUser>,
        @InjectRepository(Driver) private readonly driversRepository: Repository<Driver>,
        @InjectRepository(Staff) private readonly staffsRepository: Repository<Staff>,
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        private customJwtService: CustomJwtService,
        private smsService: SmsService
    ) { }

    async login(loginDto: LoginDto): Promise<BpmResponse> {
        const { username, password, userType } = loginDto;
        try {
            let user;
            if (userType == UserTypes.ClientMerchantUser) {

                user = await this.clientMerchantUsersRepository.findOneOrFail({ where: { username, active: true, deleted: false }, relations: ['clientMerchant', 'user', 'user.role', 'user.role.permission'] });
            } else if (userType == UserTypes.DriverMerchantUser) {

                user = await this.driverMerchantUsersRepository.findOneOrFail({ where: { username, active: true, deleted: false }, relations: ['driverMerchant', 'user', 'user.role', 'user.role.permission'] });

            } else if (userType == UserTypes.Client) {

                user = await this.driversRepository
                    .createQueryBuilder('driver')
                    .leftJoinAndSelect('driver.phoneNumbers', 'phoneNumber')
                    .leftJoinAndSelect('driver.user', 'user') // Joining the user entity
                    .where('phoneNumber.phoneNumber = :phoneNumber', { phoneNumber: username })
                    .andWhere('driver.active = :active', { active: true })
                    .andWhere('driver.deleted = :deleted', { deleted: false })
                    .getOneOrFail();

            } else if (userType == UserTypes.Driver) {

                user = await this.driversRepository
                    .createQueryBuilder('client')
                    .leftJoinAndSelect('client.user', 'user') // Joining the user entity
                    .leftJoinAndSelect('client.phoneNumbers', 'phoneNumber')
                    .where('phoneNumber.phoneNumber = :phoneNumber', { phoneNumber: username })
                    .andWhere('client.active = :active', { active: true })
                    .andWhere('client.deleted = :deleted', { deleted: false })
                    .getOneOrFail();

            } else if (userType == UserTypes.Staff) {
                user = await this.staffsRepository.findOneOrFail({ where: { username }, relations: ['user', 'user.role', 'user.role.permission'] })
            } else if (userType == UserTypes.Agent) {

            } else {
                throw new NotFoundException(ResponseStauses.UserNotFound)
            }
            const isPasswordValid: boolean = await bcrypt.compare(password, user.user.password);
            if (!isPasswordValid) {
                throw new BadRequestException(ResponseStauses.InvalidPassword);
            } else {
                let payload: any = { sub: user.id, userId: user.user.id, userType: user.user.userType, role: user.user?.role };
                if (userType == UserTypes.ClientMerchantUser) {
                    payload.merchantId = user.clientMerchant?.id;
                    payload.verified = user.clientMerchant?.verified;
                    payload.rejected = user.clientMerchant?.rejected;
                    payload.completed = user.clientMerchant?.completed;
                } else if (userType == UserTypes.DriverMerchantUser) {
                    payload.merchantId = user.driverMerchant?.id;
                    payload.verified = user.driverMerchant?.verified;
                    payload.rejected = user.driverMerchant?.rejected;
                    payload.completed = user.driverMerchant?.completed;
                }
                const token: string = await this.customJwtService.generateToken(payload);
                return new BpmResponse(true, { token }, []);
            }
        } catch (err: any) {
            console.log(err)
            if (err.name == 'EntityNotFoundError') {
                if (err.message.includes('Could not find any entity of type "ClientMerchantUser') || err.message.includes('Could not find any entity of type "DriverMerchantUser')) {
                    let merchant: any;
                    if (err.message.includes('Could not find any entity of type "DriverMerchantUser')) {
                        merchant = (await this.driverMerchantsRepository.find({ where: { email: username }, relations: ['user', 'user.role', 'user.role.permission'] }))[0];
                    } else if (err.message.includes('Could not find any entity of type "ClientMerchantUser')) {
                        merchant = (await this.clientMerchantsRepository.find({ where: { email: username }, relations: ['user', 'user.role', 'user.role.permission'] }))[0];
                    }
                    if (merchant) {
                        const isPasswordValid: boolean = await bcrypt.compare(password, merchant.user.password);
                        if (!isPasswordValid) {
                            throw new BadRequestException(ResponseStauses.InvalidPassword);
                        }
                        let payload: any = {
                            sub: merchant.id,
                            merchantId: merchant.id,
                            verified: merchant.verified,
                            rejected: merchant.rejected,
                            completed: merchant.completed
                        }
                        const token = await this.customJwtService.generateToken(payload);
                        return new BpmResponse(true, { token }, []);
                    } else {
                        throw new NotFoundException(ResponseStauses.UserNotFound)
                    }
                } else {
                    throw new NotFoundException(ResponseStauses.UserNotFound)
                }


                // if (err.message.includes('clientMerchantsRepository')) {
                // } else if (err.message.includes('clientMerchantUsersRepository')) {
                //     throw new NotFoundException(ResponseStauses.UserNotFound)
                // } else if (err.message.includes('driverMerchantsRepository')) {
                //     throw new NotFoundException(ResponseStauses.UserNotFound)
                // } else if (err.message.includes('driverMerchantUsersRepository')) {
                //     throw new NotFoundException(ResponseStauses.UserNotFound)
                // } else if (err.message.includes('driversRepository')) {
                //     throw new NotFoundException(ResponseStauses.UserNotFound)
                // } else if (err.message.includes('clientsRepository')) {
                //     throw new NotFoundException(ResponseStauses.UserNotFound)
                // }

            } else if (err instanceof HttpException) {
                throw err
            } else {
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
            }
        }
    }

    }