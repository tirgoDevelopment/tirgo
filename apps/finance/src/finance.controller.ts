import { Controller, Get } from '@nestjs/common';
import { FinanceService } from './finance.service';

@Controller()
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}


}
