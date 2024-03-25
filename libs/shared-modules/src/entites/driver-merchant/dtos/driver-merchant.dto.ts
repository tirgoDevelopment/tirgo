
import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateDriverMerchantDto {
  @ApiProperty({ required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  companyType: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  password: string;

}

export class CreateInStepDriverMerchantDto {

  @ApiProperty({ required: true })
  @IsNotEmpty()
  merchantId: number;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  supervisorFirstName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  supervisorLastName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  responsiblePersonFistName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  responsiblePersonLastName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  responsbilePersonPhoneNumber: string;

  @ApiProperty({ required: false })
  factAddress: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  legalAddress: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  garageAddress: string;
}

export class CompleteDriverMerchantDto {

  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  merchantId: number;
  bankAccounts: iBankAccount[];

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  bankBranchName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  inn: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  taxPayerCode: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  oked: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  mfo: string;
  dunsNumber: number;
  ibanNumber: number;
  notes: string;
}


export class DriverMerchantDto {

  @ApiProperty({ required: false })
  id?: number;

  @ApiProperty({ required: false })
  responsiblePersonLastName: string;

  @ApiProperty({ required: false })
  responsiblePersonFistName: string;

  @ApiProperty({ required: false })
  responsbilePersonPhoneNumber?: string;

  @ApiProperty({ required: false })
  password: string;

  @ApiProperty({ required: false })
  phoneNumber: string;

  @ApiProperty({ required: false })
  companyName: string;

  @ApiProperty({ required: false })
  registrationCertificateFilePath?: string;

  @ApiProperty({ required: false })
  transportationCertificateFilePath?: string; 

  @ApiProperty({ required: false })
  passportFilePath?: string;

  @ApiProperty({ required: false })
  logoFilePath?: string;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ required: false })
  mfo?: string;

  @ApiProperty({ required: false })
  inn?: string;

  @ApiProperty({ required: false })
  oked?: string;

  @ApiProperty({ required: false })
  dunsNumber?: number;

  @ApiProperty({ required: false })
  supervisorFirstName?: string;

  @ApiProperty({ required: false })
  supervisorLastName?: string;

  @ApiProperty({ required: false })
  legalAddress?: string;

  @ApiProperty({ required: false })
  factAddress?: string;

  @ApiProperty({ required: false })
  bankName?: string;

  @ApiProperty({ required: false })
  bankBranchName?: string;

  @ApiProperty({ required: false })
  bankAccounts?: iBankAccount[];

  @ApiProperty({ required: false })
  verifiedBy?: string;

  @ApiProperty({ required: false })
  ibanNumber?: number;

  @ApiProperty({ required: false })
  taxPayerCode?: string;

  @ApiProperty({ required: false })
  postalCode: string;

  @ApiProperty({ required: false })
  garageAddress: string;

  @ApiProperty({ required: false })
  email: string;
  
  @ApiProperty({ required: false })
  companyType: string;
}

export interface iBankAccount {
  account: string;
  currency: number;
}

export class AppendDriverMerchantDto {
  @ApiProperty({ required: true })
  phoneNumber: number;
}