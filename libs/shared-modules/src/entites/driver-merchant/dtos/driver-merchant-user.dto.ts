
import { IsEmail, IsNotEmpty, IsUUID } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateDriverMerchantUserDto {

  @ApiProperty({ required: true })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  merchantId: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsUUID()
  roleId: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  password: string;

  // @IsEmail()
  // @IsNotEmpty()
  @ApiProperty({ required: false })
  phoneNumber?: string;
}

export class UpdateDriverMerchantUserDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsUUID()
  role: string;

  @ApiProperty({ required: false })
  phoneNumber?: string;
  
  @ApiProperty({ required: false })
  lastLogin?: Date;

}

export class SendCodeDto {
  @ApiProperty({ required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyCodeDto {
  @ApiProperty({ required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  code: string;
}

export class VerifyPhoneDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  countryCode: string;
}