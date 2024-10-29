import { Injectable, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { TelegramBotUser } from '../entites/bot/bot.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class TelegramBotService implements OnModuleInit {
  private bot: TelegramBot;

  constructor(
    @InjectRepository(TelegramBotUser) private telegramBotUsersRepository: Repository<TelegramBotUser>
  ) {
  
  }
  
  onModuleInit() {
    const token = process.env.TELEGRAM_BOT_TOKEN || '6286374907:AAEvEgm_NDDv-r6ppBEy-qvoJGWFKCb_Rbw';
    const url = process.env.WEBHOOK_URL || 'https://test-api.tirgo.io';
    this.bot = new TelegramBot(token);
    this.bot.setWebHook(`${url}/api/v2/users/telegram-bot/webhook`);
    this.initializeBot();
  }

  private initializeBot() {
    // Handle /start command
    this.bot.onText(/\/start/, (msg) => {
      const chatFirstName = msg.from.first_name;
        const chatLastName = msg.from.last_name;
        const chatId = msg.from.id;

        let replyOptions = {
            reply_markup: {
                resize_keyboard: true,
                one_time_keyboard: true,
                force_reply: true,
                keyboard: [[{ text: "📱Отправить номер", request_contact: true }]],
            },
        };
        const text = `Добро пожаловать, ${chatFirstName ? chatFirstName : '@' + msg.from.username} ${chatLastName ? chatLastName : ''} ! \nПожалуйста отправьте свой номер телефона !`;

        // Reply to the user with the message
        this.bot.sendMessage(chatId, text, replyOptions);
    });

    // Handle generic messages
    this.bot.on('message', (msg) => {
      const chatId = msg.chat.id;
      // this.bot.sendMessage(chatId, `You said: ${msg.text}`);
    });


      // Handle contact sharing
  this.bot.on('contact', async (msg) => {
    const chatId = msg.from.id;
    const phoneNumber = msg.contact?.phone_number.toString().replace('+', '');
    const chatFirstName = msg.from.first_name;
    const chatLastName = msg.from.last_name;
    const username = msg.from.username;

    const botUser = (await this.telegramBotUsersRepository.find({ where: { phoneNumber } }))[0];
    if(!botUser) {
      let user = await this.telegramBotUsersRepository.create();
      user.firstName = chatFirstName;
      user.lastName = chatLastName;
      user.phoneNumber = phoneNumber;
      user.tgChatId = chatId;
      user.tgUsername = username;
     const data = await this.telegramBotUsersRepository.save(user);
     console.log(data)
    } else {
      botUser.firstName = chatFirstName;
      botUser.lastName = chatLastName;
      botUser.phoneNumber = phoneNumber;
      botUser.tgChatId = chatId;
      botUser.tgUsername = username;
      await this.telegramBotUsersRepository.save(botUser);
    }

    // You can customize this message or store the contact in your database
    this.bot.sendMessage(chatId, `Вы успешно зарегистрировались`);
  });

    console.log('Bot initialized')
  }

  // This method is for processing updates from the webhook
  processUpdate(update: TelegramBot.Update) {
    this.bot.processUpdate(update);
  }

  async sendOtpCode(phoneNumber: string, code: number) {
    const user = (await this.telegramBotUsersRepository.find({ where: { phoneNumber } }))[0];
    if(!user) {
      return false;
    } else {
      await this.bot.sendMessage(user.tgChatId, `Ваш код для входа: ${code}.`)
      return true;
    }
  }
  
}
