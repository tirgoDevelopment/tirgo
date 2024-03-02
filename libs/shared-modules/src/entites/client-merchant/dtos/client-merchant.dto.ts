
import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientMerchantDto {
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

export class CreateInStepClientMerchantDto {

  // @IsNumber()
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
}

export class CompleteClientMerchantDto {

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

  @ApiProperty({ required: false })
  dunsNumber: number;

  @ApiProperty({ required: false })
  ibanNumber: number;

  @ApiProperty({ required: false })
  notes: string;
}

export class ClientMerchantDto {

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
  bankAccounts?: iBankAccount[];
  
  @ApiProperty({ required: false })
  verifiedBy?: string;
  
  @ApiProperty({ required: false })
  ibanNumber?: number;
  
  @ApiProperty({ required: false })
  taxPayerCode?: string;
  
}

export interface iBankAccount {
  account: string;
  currencyId: string;
}