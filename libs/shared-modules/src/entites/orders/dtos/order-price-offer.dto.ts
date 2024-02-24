import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";

export class OrderOfferDto {

  id?: number;
  
  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  driverId: number;
  offerIndex: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsUUID()
  @IsNotEmpty()
  curencyId: string;
}