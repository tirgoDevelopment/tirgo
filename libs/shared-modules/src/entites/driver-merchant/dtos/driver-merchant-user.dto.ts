
import { IsEmail, IsNotEmpty, IsUUID } from "class-validator";

export class CreateDriverMerchantUserDto {

  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  merchantId: number;

  @IsNotEmpty()
  @IsUUID()
  roleId: string;

  @IsNotEmpty()
  password: string;

  // @IsEmail()
  // @IsNotEmpty()
  phoneNumber?: string;
}

export class UpdateDriverMerchantUserDto {
  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsUUID()
  role: string;

  phoneNumber?: string;
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