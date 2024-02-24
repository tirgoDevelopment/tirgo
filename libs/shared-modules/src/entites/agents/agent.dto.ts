import { IsNotEmpty, IsString } from "class-validator";

export class AgentDto {
  id: number;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  managerLastName: string;

  @IsString()
  @IsNotEmpty()
  managerFirstName: string;

  @IsString()
  @IsNotEmpty()
  legalAddress: string;

  physicalAddress: string;

  @IsString()
  @IsNotEmpty()
  bankBranchName: string;
  
  registrationCertificateFilePath: string;
  managerPassportFilePath: string;
  
  @IsString()
  @IsNotEmpty()
  mfo: string;

  @IsString()
  @IsNotEmpty()
  oked: string;

  @IsString()
  @IsNotEmpty()
  inn: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsNotEmpty()
  bankAccounts?: any[];
}