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
import { DriversSubscriptionDto, TransactionDto } from './transaction.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Transactions')
@Controller('transaction')
export class TransactionsController {

constructor(
    private transactionsService: TransactionService
) {
}

@ApiOperation({ summary: 'Create transaction' })
@Post()
@UsePipes(ValidationPipe)
async createTransaction(@Body() transactionDto: TransactionDto, @Req() req: Request) {
    return this.transactionsService.createTransaction(transactionDto, req['user']?.id)
}

@ApiOperation({ summary: 'Get merchant transactions' })
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

@ApiOperation({ summary: 'Get merchant transactions' })
@Get('driver-merchant-transactions')
async getDriverTransactions(
  @Query('pageSize') pageSize: string,
  @Query('pageIndex') pageIndex: string,
  @Query('sortBy') sortBy: string,
  @Query('sortType') sortType: string,
  @Query('userId') id: number,
  @Query('transactionType') transactionType: string,
  @Query('fromDate') fromDate: string,
  @Query('toDate') toDate: string
) {
    return this.transactionsService.getDriverMerchantTransactionById(sortBy, sortType, pageSize, pageIndex, id, transactionType, fromDate, toDate);
}

@ApiOperation({ summary: 'Admin get merchant transactions' })
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

@ApiOperation({ summary: 'Get agent transaction' })
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

@ApiOperation({ summary: 'Get merchant balance' })
@Get('merchant-balance')
async getMerchantBalance(@Query('merchantId') id: number) {
    return this.transactionsService.getMerchantBalance(id);
}

@ApiOperation({ summary: 'Get agent balance' })
@Get('agent-balance')
async getAgentBalance(@Query('agentId') id: number) {
    return this.transactionsService.getAgentBalance(id);
}

@ApiOperation({ summary: 'Cancel transaction' })
@Patch('cancel')
async cancelTransaction(@Query('id') id: number, @Req() req: Request) {
  return this.transactionsService.cancelTransaction(id, req['user']);
}

@ApiOperation({ summary: 'Verify transaction' })
@Patch('verify')
async verifyTransaction(@Query('id') id: number, @Req() req: Request) {
  return this.transactionsService.verifyTransaction(id, req['user']);
}

@ApiOperation({ summary: 'Reject transaction' })
@Patch('reject')
async rejectTransaction(@Query('id') id: number, @Req() req: Request) {
  return this.transactionsService.rejectTransaction(id, req['user']);
}

@ApiOperation({ summary: 'Driver merchant add subscription to driver' })
@Post('driver-merchant/add-subscription-driver') 
@UsePipes(ValidationPipe)
async addSubscriptionToDriver(@Req() req: Request, @Body() dto: DriversSubscriptionDto) {
    return this.transactionsService.addSubscriptionToDriver(dto, req['user'])
}

}