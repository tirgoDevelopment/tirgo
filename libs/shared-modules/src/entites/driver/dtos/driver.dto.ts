import { IsNotEmpty, IsString, MinLength, MaxLength, IsNumber } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class DriverDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  phoneNumbers: any;

  @ApiProperty({ required: false })
  birthdayDate?: Date;
 
  @ApiProperty({ required: false })
  profilePhotoFilePath?: string;

  @ApiProperty({ required: false })
  citizenship?: string;

  @ApiProperty({ required: false })
  passportFilePath?: string;

  @ApiProperty({ required: false })
  driverLicenseFilePath?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  id?: number;

  @ApiProperty({ required: false })
  agentId: number;

}

export class UpdateDriverDto {
  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  phoneNumbers: any;

  @ApiProperty({ required: false })
  additionalPhoneNumber?: string;

  @ApiProperty({ required: false })
  citizenship?: string;

  @ApiProperty({ required: false })
  passportFilePath?: string;

  @ApiProperty({ required: false })
  driverLicenseFilePath?: string;

  @ApiProperty({ required: false })
  email?: string;
  
  @ApiProperty({ required: false })
  birthdayDate?: Date;
 
  @ApiProperty({ required: false })
  profilePhotoFilePath?: string;

  @ApiProperty({ required: false })
  agentId: number;

}
