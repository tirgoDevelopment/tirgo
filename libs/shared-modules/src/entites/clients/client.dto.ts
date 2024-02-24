import { IsNotEmpty, IsString } from "class-validator";

export class ClientDto {

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  phoneNumbers: string[];
  
  @IsNotEmpty()
  phoneNumber: string;

  additionalPhoneNumber?: string;
  citizenship?: string;
  pasportFilePath?: string;
  email?: string;

  @IsString()
  @IsNotEmpty()
  password?: string;
  id?: number;

}

export class QueryDto {

  @IsNotEmpty()
  id: number;
}