import { IsNotEmpty } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class RejectOfferDto {
  @ApiProperty({ required: false })
  id?: number;
  
  @ApiProperty({ required: true })
  @IsNotEmpty()
  rejectReason: string;
}