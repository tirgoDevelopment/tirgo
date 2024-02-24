import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Put,
  Query,
  Delete,
} from '@nestjs/common';
import { CurrenciesService } from '../services/currency.service';
import { CurrencyDto } from '../..';

@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) { }

  @Post()
  @UsePipes(ValidationPipe)
  async createCurrency(@Body() createCurrencyDto: CurrencyDto) {
    return this.currenciesService.createCurrency(createCurrencyDto);
  }

  @Put()
  @UsePipes(ValidationPipe)
  async updateCurrency(@Body() updateCurrencyDto: CurrencyDto) {
    return this.currenciesService.updateCurrency(updateCurrencyDto);
  }

  @Get()
  async getCurrency(@Query('id') id: string) {
    return this.currenciesService.getCurrencyById(id);
  }

  @Get('all')
  async getAllCurrencies() {
    return this.currenciesService.getAllCurrencies();
  }

  @Delete('')
  async deleteCurrency(@Query('id') id: string) {
    return this.currenciesService.deleteCurrency(id);
  }

}