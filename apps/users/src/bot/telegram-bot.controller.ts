import { TelegramBotService } from '@app/shared-modules';
import { Controller, Post, Body } from '@nestjs/common';

@Controller('telegram-bot')
export class TelegramBotController {
  constructor(private readonly telegramBotService: TelegramBotService) {}

  @Post('webhook')
  async handleWebhook(@Body() update: any) {
    this.telegramBotService.processUpdate(update);
    return { status: 'success' };
  }
}
