import { TransactionTypes } from "@app/shared-modules";
import { IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";

export class TransactionDto {

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  // @IsNumber()
  // @IsNotEmpty()
  taxAmount: number;

  // @IsNumber()
  // @IsNotEmpty()
  additionalAmount: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(TransactionTypes)
  transactionType: TransactionTypes;

  comment: string;

  @IsUUID()
  @IsNotEmpty()
  currencyId: string;

  merchantId: number;
  agentId: number;

  userType: string;
  userId: number;

  id?: number;

}