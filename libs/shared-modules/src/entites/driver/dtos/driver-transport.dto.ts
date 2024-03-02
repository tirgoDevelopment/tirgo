import { IsNotEmpty, IsUUID } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class DriverTransportDto {

  @ApiProperty({ required: false })
  id?: number;
  
  @ApiProperty({ required: true })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  transportKindIds: any;

  @ApiProperty({ required: false })
  transportTypeIds: any;

  @ApiProperty({ required: false })
  loadingMethodIds: any;

  @ApiProperty({ required: false })
  cargoTypeIds: any;

  @ApiProperty({ required: false })
  driverId: number;

  @ApiProperty({ required: false })
  cubicCapacity:number;

  @ApiProperty({ required: false })

  @ApiProperty({ required: false })
  stateNumber:string; 

  @ApiProperty({ required: false })
  refrigeratorFrom: number;

  @ApiProperty({ required: false })
  refrigeratorTo: number;

  @ApiProperty({ required: false })
  refrigeratorCount: number;

  @ApiProperty({ required: false })
  isHook: boolean;

  @ApiProperty({ required: false })
  isAdr: boolean;

  @ApiProperty({ required: false })
  techPassportFrontFilePath:string; 

  @ApiProperty({ required: false })
  techPassportBackFilePath:string; 

  @ApiProperty({ required: false })
  transportFrontFilePath:string; 

  @ApiProperty({ required: false })
  transportBackFilePath:string; 

  @ApiProperty({ required: false })
  transportSideFilePath:string; 

  @ApiProperty({ required: false })
  goodsTransportationLicenseCardFilePath:string; 

  @ApiProperty({ required: false })
  driverLicenseFilePath:string; 

  @ApiProperty({ required: false })
  passportFilePath:string;
}

export class DriverTransportVerificationDto {

  @ApiProperty({ required: false })
  id?: number;
  
  @IsNotEmpty()
  @ApiProperty({ required: true })
  name: string;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  transportKindIds: any;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  transportTypeIds: any;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  loadingMethodIds: any;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  cargoTypeIds: any;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  driverId: number;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  cubicCapacity:number;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  stateNumber:string; 

  @ApiProperty({ required: false })
  refrigeratorFrom: number;

  @ApiProperty({ required: false })
  refrigeratorTo: number;

  @ApiProperty({ required: false })
  refrigeratorCount: number;

  @ApiProperty({ required: false })
  isHook: boolean;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  isAdr: boolean;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  transportId: number;

  @ApiProperty({ required: false })
  techPassportFrontFilePath:string; 

  @ApiProperty({ required: false })
  techPassportBackFilePath:string; 

  @ApiProperty({ required: false })
  transportFrontFilePath:string; 

  @ApiProperty({ required: false })
  transportBackFilePath:string; 

  @ApiProperty({ required: false })
  transportSideFilePath:string; 

  @ApiProperty({ required: false })
  goodsTransportationLicenseCardFilePath:string; 

  @ApiProperty({ required: false })
  driverLicenseFilePath:string; 

  @ApiProperty({ required: false })
  passportFilePath:string;

}