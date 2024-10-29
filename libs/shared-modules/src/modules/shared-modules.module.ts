import { Module } from '@nestjs/common';
import { SharedModulesService } from '../shared-modules.service';
import { AwsService } from '../services/aws.service';
import { SundryService } from '../services/sundry.service';
import { CustomJwtService } from '../services/jwt.service';
import { SmsService } from '../services/sms.service';
import { MailService } from '../services/mail.service';
import { TelegramBotService } from '../services/telegram-bot.service';
@Module({
  providers: [
    SharedModulesService,
    SundryService,
    CustomJwtService,
    AwsService,
    SmsService,
    MailService,
    TelegramBotService
  ],
  exports: [
    SharedModulesService,
    SundryService,
    CustomJwtService,
    SmsService,
    MailService,
    TelegramBotService
  ],
})
export class SharedModulesModule {}
