import { Controller, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AwsService } from '../..';

@Controller('files')
export class FilesController {
  constructor(private readonly awsService: AwsService) {}

  @Get(':key/:fileName')
  async downloadFile(
    @Param('key') keyName: string,
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    const fileStream: any = await this.awsService.getFileStream(keyName, fileName);
    fileStream.pipe(res);
  }
}
