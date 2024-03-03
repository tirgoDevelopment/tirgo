import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class OrderOfferDto {

  
  @ApiProperty({ required: false })
  id?: number;
  
  
  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  
  @ApiProperty({ required: false })
  driverId: number;

  
  @ApiProperty({ required: false })
  offerIndex: number;

  
  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  
  @ApiProperty({ required: true })
  @IsUUID()
  @IsNotEmpty()
  curencyId: string;
}