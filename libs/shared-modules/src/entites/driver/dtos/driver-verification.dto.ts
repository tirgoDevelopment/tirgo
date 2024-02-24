import { IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";

export class TransportVerificationDto {

  @IsNotEmpty()
  @IsString()
  stateNumber: string;

  id?: number;

  @IsNumber()
  @IsNotEmpty()
  transportId?: number;

  @IsUUID()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsString()
  bankCardNumber: string;

  @IsNotEmpty()
  @IsString()
  bankNameOfCardNumber: string;

  @IsNotEmpty()
  @IsString()
  adrPhotoPath: string;

  @IsNotEmpty()
  @IsString()
  transportRegistrationState?: string;

  passportSelfiePhotoPath?: string;

  driversLicensePhotoPath?: string;

  transportFrontPhotoPath?: string;

  transportBackPhotoPath?: string;

  transportSidePhotoPath?: string;

  techPassportFrontPhotoPath?: string;

  techPassportBackPhotoPath?: string;

  goodsTransportationLicenseCardPhotoPath?: string;

}
