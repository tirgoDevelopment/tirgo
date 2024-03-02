import { IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class TransportVerificationDto {

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  stateNumber: string;

  @ApiProperty({ required: false })
  id?: number;

  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  transportId?: number;

  @ApiProperty({ required: true })
  @IsUUID()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  bankCardNumber: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  bankNameOfCardNumber: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  adrPhotoPath: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  transportRegistrationState?: string;

  @ApiProperty({ required: false })
  passportSelfiePhotoPath?: string;

  @ApiProperty({ required: false })
  driversLicensePhotoPath?: string;

  @ApiProperty({ required: false })
  transportFrontPhotoPath?: string;

  @ApiProperty({ required: false })
  transportBackPhotoPath?: string;

  @ApiProperty({ required: false })
  transportSidePhotoPath?: string;

  @ApiProperty({ required: false })
  techPassportFrontPhotoPath?: string;

  @ApiProperty({ required: false })
  techPassportBackPhotoPath?: string;

  @ApiProperty({ required: false })
  goodsTransportationLicenseCardPhotoPath?: string;

}
