import { Injectable } from '@nestjs/common';

@Injectable()
export class ReferencesService {
  getHello(): string {
    return 'Hello World!';
  }
}
