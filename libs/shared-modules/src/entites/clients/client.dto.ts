import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class ClientDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ required: false })
  phoneNumbers: any;
  
  @ApiProperty({ required: false })
  additionalPhoneNumber?: string;

  @ApiProperty({ required: false })
  citizenship?: string;

  @ApiProperty({ required: false })
  pasportFilePath?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsOptional()
  @MinLength(8)
  @MaxLength(16)
  password?: string;
  id?: number;

}

export class UpdateClientDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ required: false })
  phoneNumbers: string[];
  
  @ApiProperty({ required: false })
  additionalPhoneNumber?: string;

  @ApiProperty({ required: false })
  citizenship?: string;

  @ApiProperty({ required: false })
  pasportFilePath?: string;

  @ApiProperty({ required: false })
  email?: string;

  id?: number;

}

export class QueryDto {
  @IsNotEmpty()
  id: number;
}

export class GetClientsDto {
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
  clientId?: number;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  phoneCode?: string;

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

export class UpdateClientPhoneDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  number: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  code: string;
}

export class UpdateClientBirthDayDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  birthdayDate: Date;

}