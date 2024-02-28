import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UsePipes,
  ValidationPipe,
  Query,
  Req,
  Patch
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionDto } from './transaction.dto';

@Controller('transaction')
export class TransactionsController {

constructor(
    private transactionsService: TransactionService
) {
}

@Post()
@UsePipes(ValidationPipe)
async createTransaction(@Body() transactionDto: TransactionDto, @Req() req: Request) {
    return this.transactionsService.createTransaction(transactionDto, req['user']?.id)
}

@Get('merchant-transactions')
async getTransactions(
  @Query('pageSize') pageSize: string,
  @Query('pageIndex') pageIndex: string,
  @Query('sortBy') sortBy: string,
  @Query('sortType') sortType: string,
  @Query('userId') id: number,
  @Query('transactionType') transactionType: string,
  @Query('fromDate') fromDate: string,
  @Query('toDate') toDate: string
) {
    return this.transactionsService.getMerchantTransactionById(sortBy, sortType, pageSize, pageIndex, id, transactionType, fromDate, toDate);
}

@Get('admin-merchant-transactions')
async getAdminTransactions(
  @Query('pageSize') pageSize: string,
  @Query('pageIndex') pageIndex: string,
  @Query('sortBy') sortBy: string,
  @Query('sortType') sortType: string,
  @Query('userId') id: number,
  @Query('transactionType') transactionType: string,
  @Query('fromDate') fromDate: string,
  @Query('toDate') toDate: string
) {
    return this.transactionsService.getAdminMerchantTransactionById(sortBy, sortType, pageSize, pageIndex, id, transactionType, fromDate, toDate);
}

@Get('agent-transactions')
async getAgentTransactions(
  @Query('pageSize') pageSize: string,
  @Query('pageIndex') pageIndex: string,
  @Query('sortBy') sortBy: string,
  @Query('sortType') sortType: string,
  @Query('agentId') id: number,
  @Query('transactionType') transactionType: string,
  @Query('fromDate') fromDate: string,
  @Query('toDate') toDate: string
) {
    return this.transactionsService.getAgentTransactionsById(sortBy, sortType, pageSize, pageIndex, id, transactionType, fromDate, toDate);
}

@Get('merchant-balance')
async getMerchantBalance(@Query('merchantId') id: number) {
    return this.transactionsService.getMerchantBalance(id);
}

@Get('agent-balance')
async getAgentBalance(@Query('agentId') id: number) {
    return this.transactionsService.getAgentBalance(id);
}

@Patch('cancel')
async cancelTransaction(@Query('id') id: number, @Req() req: Request) {
  return this.transactionsService.cancelTransaction(id, req['user']);
}

@Patch('verify')
async verifyTransaction(@Query('id') id: number, @Req() req: Request) {
  return this.transactionsService.verifyTransaction(id, req['user']);
}

@Patch('reject')
async rejectTransaction(@Query('id') id: number, @Req() req: Request) {
  return this.transactionsService.rejectTransaction(id, req['user']);
}

}