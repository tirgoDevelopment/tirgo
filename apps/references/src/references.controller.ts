import { Controller, Get } from '@nestjs/common';
import { ReferencesService } from './references.service';

@Controller()
export class ReferencesController {
  constructor(private readonly referencesService: ReferencesService) {}

  @Get()
  getHello(): string {
    return this.referencesService.getHello();
  }
}
