import { ServicesRequestsService } from './services-requests.service';
import { ServicesRequestsController } from './services-requests.controller';

import { Module } from '@nestjs/common';

@Module({
    imports: [],
    controllers: [
        ServicesRequestsController,],
    providers: [
        ServicesRequestsService,],
})
export class ServicesRequestsModule { }
