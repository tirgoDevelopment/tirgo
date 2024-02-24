import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CurrencyDto {

  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  code: number;
}