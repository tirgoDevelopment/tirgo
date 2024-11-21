import { IsNotEmpty } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CancelOfferDto {
  @ApiProperty({ required: false })
  id?: number;
  
  @ApiProperty({ required: false })
  cancelReason: string;
}