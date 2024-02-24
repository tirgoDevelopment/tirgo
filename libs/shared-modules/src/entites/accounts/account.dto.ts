import { IsNotEmpty, IsString, IsUUID } from "class-validator";


export class AccountDto {

    id?: string;

    @IsNotEmpty()
    @IsString()
    accountNumber

    @IsNotEmpty()
    @IsString()
    accountType: string;
  
    @IsNotEmpty()
    @IsUUID()
    currency: string;

}