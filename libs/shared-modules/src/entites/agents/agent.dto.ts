  import { IsNotEmpty, IsString } from "class-validator";
  import { ApiProperty } from '@nestjs/swagger';

  export class AgentDto {

    @ApiProperty({ required: false })
    id: number;

    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    password: string;

    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    companyName: string;

    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    managerLastName: string;

    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    managerFirstName: string;

    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    legalAddress: string;

    @ApiProperty({ required: false })
    physicalAddress: string;

    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    bankBranchName: string;

    @ApiProperty({ required: false })
    registrationCertificateFilePath: string;

    @ApiProperty({ required: false })
    managerPassportFilePath: string;
    
    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    mfo: string;

    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    oked: string;

    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    inn: string;

    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    bankAccounts?: any[];
  }