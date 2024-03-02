
import { IsEmail, IsNotEmpty, IsUUID } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientMerchantUserDto {

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

export class UpdateClientMerchantUserDto {
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
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  code: string;
}

export class VerifyPhoneDto {
  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  countryCode: string;
}