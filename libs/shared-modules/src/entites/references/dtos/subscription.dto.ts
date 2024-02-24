import { IsEmail, IsNotEmpty, IsNumber, IsString, IsUUID, Matches, MaxLength, MinLength } from "class-validator";

export class SubscriptionDto {

  id?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsUUID()
  @IsNotEmpty()
  currencyId: string;

  @IsNumber()
  @IsNotEmpty() 
  duration: number;
}

export class SubscriptionPaymentDto {

  id?: number;

  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  subscriptionId: number;
}