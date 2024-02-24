
import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateClientMerchantDto {
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

export class CreateInStepClientMerchantDto {

  // @IsNumber()
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
}

export class CompleteClientMerchantDto {
  @IsNumber()
  @IsNotEmpty()
  merchantId: number;
  bankAccounts: iBankAccount[];

  @IsString()
  @IsNotEmpty()
  bankName: string;

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

export class ClientMerchantDto {

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
  bankAccounts?: iBankAccount[];
  verifiedBy?: string;
  ibanNumber?: number;
  taxPayerCode?: string;
}

export interface iBankAccount {
  account: string;
  currencyId: string;
}