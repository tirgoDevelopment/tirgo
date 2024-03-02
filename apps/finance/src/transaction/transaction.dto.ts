import { TransactionTypes } from "@app/shared-modules";
import { IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class TransactionDto {

  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  // @IsNumber()
  // @IsNotEmpty()
  @ApiProperty({ required: false })
  taxAmount: number;

  // @IsNumber()
  // @IsNotEmpty()
  @ApiProperty({ required: false })
  additionalAmount: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(TransactionTypes)
  @ApiProperty({ required: true })
  transactionType: TransactionTypes;

  @ApiProperty({ required: false })
  comment: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  currencyId: string;

  @ApiProperty({ required: false })
  merchantId: number;

  @ApiProperty({ required: false })
  agentId: number;

  @ApiProperty({ required: false })
  userType: string;

  @ApiProperty({ required: false })
  userId: number;

  @ApiProperty({ required: false })
  id?: number;

}