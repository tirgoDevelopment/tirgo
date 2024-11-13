import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent, BadRequestException, BpmResponse, Client, ClientMerchant, ClientMerchantUser, CustomJwtService, Driver, DriverMerchant, DriverMerchantUser, InternalErrorException, NotFoundException, ResponseStauses, SendOtpTypes, SmsService, Staff, SundryService, TelegramBotService, User, UserTypes, } from '..';
import { LoginDto, SendOtpDto, VerifyOtpDto } from '../auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoginService {

    constructor(
        @InjectRepository(ClientMerchant) private readonly clientMerchantsRepository: Repository<ClientMerchant>,
        @InjectRepository(ClientMerchantUser) private readonly clientMerchantUsersRepository: Repository<ClientMerchantUser>,
        @InjectRepository(DriverMerchant) private readonly driverMerchantsRepository: Repository<DriverMerchant>,
        @InjectRepository(DriverMerchantUser) private readonly driverMerchantUsersRepository: Repository<DriverMerchantUser>,
        @InjectRepository(Driver) private readonly driversRepository: Repository<Driver>,
        @InjectRepository(Client) private readonly clientsRepository: Repository<Client>,
        @InjectRepository(Staff) private readonly staffsRepository: Repository<Staff>,
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        @InjectRepository(Agent) private readonly agentsRepository: Repository<Agent>,
        private customJwtService: CustomJwtService,
        private smsService: SmsService,
        private sundryService: SundryService,
        private telegramBotService: TelegramBotService
    ) { }

    async login(loginDto: LoginDto): Promise<BpmResponse> {
        const { username, password, userType } = loginDto;
        try {
            let user;
            if (userType == UserTypes.ClientMerchantUser) {
 
                user = await this.clientMerchantUsersRepository.findOneOrFail({ where: { username, active: true, deleted: false }, relations: ['clientMerchant', 'user'] });
            } else if (userType == UserTypes.DriverMerchantUser) {

                user = await this.driverMerchantUsersRepository.findOneOrFail({ where: { username, active: true, deleted: false }, relations: ['driverMerchant', 'user'] });

            } else if (userType == UserTypes.Driver) {

                user = await this.driversRepository
                    .createQueryBuilder('driver')
                    .leftJoinAndSelect('driver.phoneNumbers', 'phoneNumber')
                    .leftJoinAndSelect('driver.user', 'user') // Joining the user entity
                    .where('phoneNumber.phoneNumber = :phoneNumber', { phoneNumber: username })
                    .andWhere('driver.active = :active', { active: true })
                    .andWhere('driver.deleted = :deleted', { deleted: false })
                    .getOneOrFail();

            } else if (userType == UserTypes.Client) {

                user = await this.clientsRepository
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
                user = await this.agentsRepository.findOneOrFail({ where: { username }, relations: ['user', 'user.role', 'user.role.permission'] })
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
                        merchant = (await this.driverMerchantsRepository.find({ where: { email: username }, relations: ['user'] }))[0];
                    } else if (err.message.includes('Could not find any entity of type "ClientMerchantUser')) {
                        merchant = (await this.clientMerchantsRepository.find({ where: { email: username }, relations: ['user'] }))[0];
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

    async sendOtp(sendOtp: SendOtpDto): Promise<BpmResponse> {
        const { phoneNumber, userType, sendBy } = sendOtp;
        try {
            let user;
            const code = await this.sundryService.generateOtpCode();
            switch (userType) {
                case UserTypes.Client:
                    user = (await this.clientsRepository.find({ where: { phoneNumbers: { phoneNumber } } }))[0];
                    break;
                case UserTypes.Driver:
                    user = (await this.driversRepository.find({ where: { phoneNumbers: { number: phoneNumber } } }))[0];
                    if(user) {
                        user.otpCode = code;
                        user.otpSentDatetime = new Date().getTime();
                        await this.driversRepository.save(user);
                    }
                    break;
                default:
                    // Handle other user types or throw an error if unexpected
                    throw new Error('Invalid user type');
            } 
            let isCodeSent;
            switch (sendBy) {
                case SendOtpTypes.Sms:
                    isCodeSent = await this.smsService.sendOtp(phoneNumber, code);
                break
                case SendOtpTypes.Telegram: 
                    isCodeSent = await this.telegramBotService.sendOtpCode(phoneNumber, code)
                break
            }
            if(!isCodeSent) {
                throw new InternalErrorException(ResponseStauses.InternalServerError)
            }
            if(!user) {
                return new BpmResponse(true, { isRegistered: false, code });
            } else {
                return new BpmResponse(true, { isRegistered: true })
            }

        } catch (err: any) {
            console.log(err)
            if (err instanceof HttpException) {
                throw err
            } else {
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
            }
        }
    }

    async verifyCode(verifyCodeDto: VerifyOtpDto): Promise<BpmResponse> {
        try {
            const { phoneNumber, userType, code } = verifyCodeDto;
            let user;
            switch (userType) {
                case UserTypes.Client:
                    user = (await this.clientsRepository.find({ where: { phoneNumbers: { phoneNumber } }, relations: ['user'] }))[0];
                    break;
                case UserTypes.Driver:
                    user = (await this.driversRepository.find({ where: { phoneNumbers: { number: phoneNumber } }, relations: ['user'] }))[0];
                    break;
                default:
                    // Handle other user types or throw an error if unexpected
                    throw new Error('Invalid user type');
            }

            const oneMinute = 60 * 1000
            if ((new Date().getTime() - user.otpSentDatetime) > oneMinute) {
                throw new BadRequestException(ResponseStauses.OtpExpired);
            } else if(code !== user.otpCode) {
                throw new BadRequestException(ResponseStauses.InvalidCode);
            }

            const payload: any = { sub: user.id, userId: user.user.id, userType };
            const token: string = await this.customJwtService.generateToken(payload);
            return new BpmResponse(true, { token })
        } catch(err: any) {
            console.log(err)
            if (err instanceof HttpException) {
                throw err
            } else {
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
            }
        }
    }
}