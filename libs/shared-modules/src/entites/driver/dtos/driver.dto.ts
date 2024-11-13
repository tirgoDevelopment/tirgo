import { IsNotEmpty, IsString, MinLength, MaxLength, IsNumber, IsOptional, IsBoolean, IsDateString } from "class-validator";
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
  profilePhoto?: string;

  @ApiProperty({ required: false })
  citizenship?: string;

  @ApiProperty({ required: false })
  passport?: string;

  @ApiProperty({ required: false })
  driverLicense?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  id?: number;

  @ApiProperty({ required: false })
  agentId: number;

  @ApiProperty({ required: false })
  password: string;

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
  passport?: string;
  
  @ApiProperty({ required: false })
  driverLicense?: string;

  @ApiProperty({ required: false })
  email?: string;
  
  @ApiProperty({ required: false })
  birthdayDate?: Date;
 
  @ApiProperty({ required: false })
  profilePhoto?: string;

  @ApiProperty({ required: false })
  agentId: number;

}

export class UpdateDriverPhoneDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  number: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  code: number;
}

export class UpdateDriverBirthDayDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  birthdayDate: Date;

}

export class GetDriversDto {
  @IsOptional()
  @IsNumber()
  pageSize?: number;

  @IsOptional()
  @IsNumber()
  pageIndex?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortType?: 'asc' | 'desc';

  @IsOptional()
  @IsNumber()
  driverId?: number;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsNumber()
  transportKindId?: number;

  @IsOptional()
  @IsNumber()
  transportTypeId?: number;

  @IsOptional()
  @IsBoolean()
  isSubscribed?: boolean;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  userState?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsDateString()
  createdAtFrom?: string;

  @IsOptional()
  @IsDateString()
  createdAtTo?: string;

  @IsOptional()
  @IsDateString()
  lastLoginFrom?: string;

  @IsOptional()
  @IsDateString()
  lastLoginTo?: string;
}
