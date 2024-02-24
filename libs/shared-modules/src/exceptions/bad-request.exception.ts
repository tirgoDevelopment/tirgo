import { HttpException, HttpStatus } from "@nestjs/common";
import { ResponseStauses } from "..";

export class BadRequestException extends HttpException {
    constructor(message: string = ResponseStauses.InternalServerError, logMessage?: string) {
      super(message, HttpStatus.BAD_REQUEST);
    }
  }