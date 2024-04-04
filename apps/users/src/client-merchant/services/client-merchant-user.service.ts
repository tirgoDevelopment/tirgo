import { Injectable, HttpException, BadRequestException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, DataSource } from 'typeorm';
import { BpmResponse, ClientMerchant, InternalErrorException, ResponseStauses, SundryService, User, NotFoundException, UserTypes, CreateClientMerchantUserDto, ClientMerchantUser, Role, NoContentException, UpdateClientMerchantUserDto, SmsService, MailService } from '../..';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ClientMerchantUsersService {

  constructor(
    @InjectRepository(ClientMerchant) private readonly clientMerchantsRepository: Repository<ClientMerchant>,
    @InjectRepository(ClientMerchantUser) private readonly clientMerchantUsersRepository: Repository<ClientMerchantUser>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private sundriesService: SundryService,
    private dataSource: DataSource,
    private smsService: SmsService,
    private mailService: MailService
  ) { }

  async createUser(createUserDto: CreateClientMerchantUserDto): Promise<BpmResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
        await queryRunner.startTransaction();
        const passwordHash = await this.sundriesService.generateHashPassword(createUserDto.password);
        const role: Role = await this.rolesRepository.findOneOrFail({ where: { id: createUserDto.roleId } });
        const user: User = await this.usersRepository.save({ userType: UserTypes.ClientMerchantUser, password: passwordHash, role: role });
        const merchant: ClientMerchant = await this.clientMerchantsRepository.findOneOrFail({ where: { id: createUserDto.merchantId } });
        const clientMerchantUser: ClientMerchantUser = new ClientMerchantUser();
        clientMerchantUser.user = user;
        clientMerchantUser.clientMerchant = merchant;
        clientMerchantUser.fullName = createUserDto.fullName;
        clientMerchantUser.username = createUserDto.username;
        clientMerchantUser.phoneNumber = createUserDto.phoneNumber.toString().replaceAll('+', '').trim();
  
        const newMerchantUser = await this.clientMerchantUsersRepository.save(clientMerchantUser);
        await queryRunner.commitTransaction();
        return new BpmResponse(true, newMerchantUser, [ResponseStauses.SuccessfullyCreated]);
      } catch (err: any) {
        console.log(err)
        await queryRunner.rollbackTransaction();
        if (err.code == '23505') {
          throw new InternalErrorException(ResponseStauses.DuplicateError, err.message);
        } else if (err.name == 'EntityNotFoundError') {
          if (err.message.includes('rolesRepository')) {
            throw new NotFoundException(ResponseStauses.RoleNotFound)
          } else if (err.message.includes('clientMerchantsRepository')) {
            throw new NotFoundException(ResponseStauses.MerchantNotFound)
          }
        } else if (err instanceof HttpException) {
          throw err
        } else {
          throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
        }
      } finally {
        await queryRunner.release();
      }
  } 
  
  async updateUser(id: number, updates: UpdateClientMerchantUserDto): Promise<BpmResponse> {
    try {
        // const user: ClientMerchantUser = await this.merchantUsersRepository.findOneOrFail({ where: { id, active: true } });
        // user.fullName = updates.fullName || user.fullName;
        // user.username = updates.username || user.username;
        // user.phoneNumber = updates.phoneNumber || user.phoneNumber;
        // user.role = updates.role || user.role;
        // user.lastLogin = updates.lastLogin || user.lastLogin;
        // user.password = user.password;
        // const updated = await this.merchantUsersRepository.save(user);
        return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
        if (err.name == 'EntityNotFoundError') {
            throw new NoContentException();
        } else if (err instanceof HttpException) {
            throw err
        } else {
            throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
        }
    }
}

async deleteUser(id: string) {
    // try {
    //     const isDeleted = await this.merchantUsersRepository.createQueryBuilder()
    //         .update(MerchantUser)
    //         .set({ active: false })
    //         .where("id = :id", { id })
    //         .execute();
    //     if (isDeleted.affected) {
    //         return new BpmResponse(true, null, [ResponseStauses.SuccessfullyDeleted]);
    //     } else {
    //         return new BpmResponse(true, null, [ResponseStauses.DeleteDataFailed]);
    //     }
    // } catch (err: any) {
    //     if (err instanceof HttpException) {
    //         throw err
    //     } else {
    //         throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
    //     }
    // }
}

async changeUserState(id: number): Promise<BpmResponse> {
    try {
        const user: ClientMerchantUser = await this.clientMerchantUsersRepository.findOneOrFail({ where: { id } })
        if (!user) {
            throw new NotFoundException(ResponseStauses.NotFound);
        }
        user.disabled = !user.disabled;
        const save = await this.clientMerchantUsersRepository.save(user);
        if (save) {
            return new BpmResponse(true, null, [ResponseStauses.SuccessfullyDeleted]);
        } else {
            return new BpmResponse(true, null, [ResponseStauses.DeleteDataFailed]);
        }
    } catch (err: any) {
        if (err.name == 'EntityNotFoundError') {
            throw new NoContentException();
        } else if (err instanceof HttpException) {
            throw err
        } else {
            throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
        }
    }
}

async changeUserPassword(password: string, newPassword: string, id: number): Promise<BpmResponse> {
    try {
        if (!password || !newPassword || !id) {
            throw new BadRequestException(ResponseStauses.AllFieldsRequired);
        }
        const user: User = await this.usersRepository.findOneOrFail({ where: { id } });
        if (!user) {
            throw new NotFoundException(ResponseStauses.UserNotFound);
        }
        if (!(await bcrypt.compare(password, user.password))) {
            throw new BadRequestException(ResponseStauses.InvalidPassword)
        } else {
            const passwordHash = await this.sundriesService.generateHashPassword(newPassword);
            user.password = passwordHash;
            await this.usersRepository.save(user);
                return new BpmResponse(true, null, [ResponseStauses.SuccessfullyUpdated]);
          }
    } catch (err: any) {
        if (err.name == 'EntityNotFoundError') {
            throw new NoContentException();
        } else if (err instanceof HttpException) {
            throw err
        } else {
            throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
        }
    }
}

async resetUserPassword(password: string, email: string): Promise<BpmResponse> {
    try {
        if (!password || !email) {
            throw new BadRequestException(ResponseStauses.AllFieldsRequired);
        }
        const clientMerchant: ClientMerchantUser = await this.clientMerchantUsersRepository.findOneOrFail({ where: { active: true, username: email }, relations: ['user'] });
        const user: User = await this.usersRepository.findOneOrFail({ where: { id: clientMerchant.user?.id } })
        const saltOrRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltOrRounds);
        user.password = passwordHash;
        const res = await this.usersRepository.save(user);
        return new BpmResponse(true, null, [ResponseStauses.SuccessfullyUpdated]);
    } catch (err: any) {
        if (err.name == 'EntityNotFoundError') {
            throw new NoContentException();
        } else if (err instanceof HttpException) {
            throw err
        } else {
            throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
        }
    }
}

async sendMailToResetPassword(sendCodeDto: any) {
    try {
        const code = await this.generateRoomCode();
        try {
            const user = await this.clientMerchantUsersRepository.findOneOrFail({ where: { username: sendCodeDto.email, active: true } });
            const info = await this.mailService.sendMail(sendCodeDto.email, 'Verification code', code)
            const timestamp = new Date().getTime(); // Capture the timestamp when the code is generated
            const expirationTime = 3 * 60 * 1000; // 3 minutes in milliseconds
            console.log('Message sent: %s', info.messageId);
            user.resetPasswordCode = code;
            user.resetPasswordCodeSentDate = (timestamp + expirationTime).toString();
            const res = await this.clientMerchantUsersRepository.update({ id: user.id }, user);
            if (res.affected) {
                return new BpmResponse(true, null, ['ok']);
            } else {
                throw new InternalErrorException(ResponseStauses.InternalServerError);
            }

        } catch (error) {
            console.error('Error sending email:', error);
            return new BpmResponse(false, null, [ResponseStauses.CreateDataFailed]);
        }
    } catch (err: any) {
        if (err.name == 'EntityNotFoundError') {
            throw new NotFoundException(ResponseStauses.UserNotFound);
        } else if (err instanceof HttpException) {
            throw err
        } else {
            throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
        }
    }
}

async generateRoomCode() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
}

async isCodeValid(date) {
    const currentTimestamp = Date.now();
    return currentTimestamp <= date;
}

async verifyResetPasswordCode(verifyCodeDto: any) {
    let bpmResponse;
    try {
        const user = await this.clientMerchantUsersRepository.findOneOrFail({ where: { username: verifyCodeDto.email, active: true } });
        if (user.resetPasswordCode == verifyCodeDto.code && await this.isCodeValid(+user.resetPasswordCodeSentDate)) {
            bpmResponse = new BpmResponse(true, null);
            user.resetPasswordCode = null;
            user.resetPasswordCodeSentDate = null;
            this.clientMerchantUsersRepository.update({ id: user.id }, user);
        } else {
            bpmResponse = new BpmResponse(false, null, ['Code is Invalid']);
        }
        return bpmResponse;
    } catch (error) {
        console.error('Error sending email:', error);
        return new BpmResponse(false, null, [ResponseStauses.CreateDataFailed]);
    }
}

async phoneVerify(verifyPhoneDto: any) {
  let bpmResponse;
  try {
      const code = await this.generateRoomCode()
      const phone = verifyPhoneDto.phone;
      const countryCode = verifyPhoneDto.countryCode;
      if (phone.startsWith('+998') || phone.startsWith('998')) {
          this.smsService.sendSmsLocal(phone, code)
      } else if (phone.startsWith('+77') || phone.startsWith('77')) {
          this.smsService.sendSmsRu(phone, code)
      } else {
          this.smsService.sendSmsGlobal(phone, code, countryCode)
      }
      bpmResponse = new BpmResponse(true, { code });
      return bpmResponse;
  } catch (error) {
      console.error('Error sending email:', error);
      return new BpmResponse(false, null, [ResponseStauses.CreateDataFailed]);
  }
}

findUserById(id: number) {
    return this.clientMerchantUsersRepository.findOne({ where: { id, active: true }, relations: ['role'] });
}

findUserByIot(id: number) {
    return this.clientMerchantUsersRepository.findOne({ where: { id, active: true }, relations: ['role'] });
}

findUserByUsername(username: string) {
    return this.clientMerchantUsersRepository.findOne({ where: { username, active: true }, relations: ['role', 'merchant'] });
}

async getUsers() {
    try {
        const data = (await this.clientMerchantUsersRepository.find({ where: { active: true }, relations: ['role'] })).map((el: any) => {
            return {
                id: el.id,
                fullName: el.fullName,
                username: el.username,
                createdAt: el.createdAt,
                active: el.active,
                disabled: el.disabled,
                lastLogin: el.lastLogin,
                role: { id: el.role.id, name: el.role.name, description: el.role.description }
            }
        });
        if (data.length) {
            return new BpmResponse(true, data)
        } else {
            throw new NoContentException()
        }
    } catch (err: any) {
        if (err instanceof HttpException) {
            throw err
        } else {
            throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
        }
    }
}

async getMerchantUsers(id: number) {
    try {
        const data = (await this.clientMerchantUsersRepository.find({ where: { active: true, clientMerchant: { id } }, relations: ['role'] })).map((el: any) => {
            return {
                id: el.id,
                fullName: el.fullName,
                username: el.username,
                createdAt: el.createdAt,
                active: el.active,
                disabled: el.disabled,
                lastLogin: el.lastLogin,
                role: { id: el.role.id, name: el.role.name, description: el.role.description }
            }
        });
        if (data.length) {
            return new BpmResponse(true, data)
        } else {
            throw new NoContentException()
        }
    } catch (err: any) {
        if (err instanceof HttpException) {
            throw err
        } else {
            throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
        }
    }
}

}