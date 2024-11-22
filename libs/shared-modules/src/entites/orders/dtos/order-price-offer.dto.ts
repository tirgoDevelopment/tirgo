import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class OrderOfferDto {
  @ApiProperty({ required: false })
  id?: number;
  
  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
  
  @ApiProperty({ required: true })
  @IsUUID()
  @IsNotEmpty()
  curencyId: string;
}

export class AdminOrderOfferDto {

 
  @ApiProperty({ required: false })
  id?: number;
  
  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  driverId: number;
  
  @ApiProperty({ required: true })
  @IsUUID()
  @IsNotEmpty()
  curencyId: string;
}

export class CancelOfferDto {
  @ApiProperty({ required: false })
  id?: number;
  
  @ApiProperty({ required: false })
  cancelReason: string;
}

export class ReplyDriverOrderOfferDto {
  @ApiProperty({ required: false })
  id?: number;
  
  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}