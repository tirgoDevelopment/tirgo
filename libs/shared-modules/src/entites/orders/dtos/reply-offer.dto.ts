import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";

export class ReplyOfferDto {

  id?: number;
  
  @IsNumber()
  @IsNotEmpty()
  offerId: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsUUID()
  @IsNotEmpty()
  curencyId: string;
}