
import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateDriverMerchantDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  companyType: string;

  @IsString()
  @IsNotEmpty()
  password: string;

}

export class CreateInStepDriverMerchantDto {

  @IsNumber()
  @IsNotEmpty()
  merchantId: number;

  @IsString()
  @IsNotEmpty()
  supervisorFirstName: string;

  @IsString()
  @IsNotEmpty()
  supervisorLastName: string;

  @IsString()
  @IsNotEmpty()
  responsiblePersonFistName: string;

  @IsString()
  @IsNotEmpty()
  responsiblePersonLastName: string;

  @IsString()
  @IsNotEmpty()
  responsbilePersonPhoneNumber: string;

  factAddress: string;

  @IsString()
  @IsNotEmpty()
  legalAddress: string;

  
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  
  @IsString()
  @IsNotEmpty()
  garageAddress: string;
}

export class CompleteDriverMerchantDto {
  @IsNumber()
  @IsNotEmpty()
  merchantId: number;
  bankAccounts: iBankAccount[];

  @IsString()
  @IsNotEmpty()
  bankName: string;

  @IsString()
  @IsNotEmpty()
  bankBranchName: string;

  @IsString()
  @IsNotEmpty()
  inn: string;

  @IsString()
  @IsNotEmpty()
  taxPayerCode: string;

  @IsString()
  @IsNotEmpty()
  oked: string;

  @IsString()
  @IsNotEmpty()
  mfo: string;
  dunsNumber: number;
  ibanNumber: number;
  notes: string;
}

export class DriverMerchantDto {
  id?: number;
  responsiblePersonLastName: string;
  responsiblePersonFistName: string;
  responsbilePersonPhoneNumber?: string;
  password: string;
  phoneNumber: string;
  companyName: string;
  registrationCertificateFilePath?: string;
  transportationCertificateFilePath?: string; 
  passportFilePath?: string;
  logoFilePath?: string;
  notes?: string;
  mfo?: string;
  inn?: string;
  oked?: string;
  dunsNumber?: number;
  supervisorFirstName?: string;
  supervisorLastName?: string;
  legalAddress?: string;
  factAddress?: string;
  bankName?: string;
  bankBranchName?: string;
  bankAccounts?: iBankAccount[];
  verifiedBy?: string;
  ibanNumber?: number;
  taxPayerCode?: string;
  postalCode: string;
  garageAddress: string;
}

export interface iBankAccount {
  account: string;
  currency: number;
}