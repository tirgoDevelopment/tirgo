import { Injectable, HttpException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BpmResponse, InternalErrorException, ResponseStauses, SundryService, User, NotFoundException, DriverMerchantUser, NoContentException, SmsService, MailService } from '../..';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DriverMerchantUsersService {

  constructor(
    @InjectRepository(DriverMerchantUser) private readonly driverMerchantUsersRepository: Repository<DriverMerchantUser>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private sundriesService: SundryService,
    private smsService: SmsService,
    private mailService: MailService
  ) { }

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
        const driverMerchant: DriverMerchantUser = await this.driverMerchantUsersRepository.findOneOrFail({ where: { active: true, username: email }, relations: ['user'] });
        const user: User = await this.usersRepository.findOneOrFail({ where: { id: driverMerchant.user?.id } })
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
            const user = await this.driverMerchantUsersRepository.findOneOrFail({ where: { username: sendCodeDto.email, active: true } });
            const info = await this.mailService.sendMail(sendCodeDto.email, 'Verification code', code)
            const timestamp = new Date().getTime(); // Capture the timestamp when the code is generated
            const expirationTime = 3 * 60 * 1000; // 3 minutes in milliseconds
            console.log('Message sent: %s', info.messageId);
            user.resetPasswordCode = code;
            user.resetPasswordCodeSentDate = (timestamp + expirationTime).toString();
            const res = await this.driverMerchantUsersRepository.update({ id: user.id }, user);
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
        const user = await this.driverMerchantUsersRepository.findOneOrFail({ where: { username: verifyCodeDto.email, active: true } });
        if (user.resetPasswordCode == verifyCodeDto.code && await this.isCodeValid(+user.resetPasswordCodeSentDate)) {
            bpmResponse = new BpmResponse(true, null);
            user.resetPasswordCode = null;
            user.resetPasswordCodeSentDate = null;
            this.driverMerchantUsersRepository.update({ id: user.id }, user);
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
          this.smsService.sendSmsGlobal(phone, code)
      }
      bpmResponse = new BpmResponse(true, { code });
      return bpmResponse;
  } catch (error) {
      console.error('Error sending email:', error);
      return new BpmResponse(false, null, [ResponseStauses.CreateDataFailed]);
  }
}
}