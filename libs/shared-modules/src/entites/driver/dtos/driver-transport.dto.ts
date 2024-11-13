import { IsBoolean, IsNotEmpty, IsNumber, IsUUID } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class DriverTransportDto {

  @ApiProperty({ required: false })
  id?: number;
  
  @ApiProperty({ required: true })
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  transportKindId: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  transportTypeId: string;

  @ApiProperty({ required: false })
  loadCapacity: string;

  @ApiProperty({ required: false })
  cargoLoadMethodIds: any;

  @ApiProperty({ required: false })
  capacity: string;

  @ApiProperty({ required: false })
  volume:number;

  @ApiProperty({ required: false })
  cubature:number;

  @ApiProperty({ required: false })
  heightCubature: string;

  @ApiProperty({ required: false })
  transportNumber:string; 

  @ApiProperty({ required: false })
  isRefrigerator: number;

  @ApiProperty({ required: false })
  refrigeratorFromCount: number;

  @ApiProperty({ required: false })
  refrigeratorToCount: number;

  @ApiProperty({ required: false })
  isHook: boolean;

  @ApiProperty({ required: false })
  isAdr: boolean;

  @ApiProperty({ required: false })
  isMain: boolean;

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

  @ApiProperty({ required: false })
  cisternVolume: number;

  @ApiProperty({ required: false })
  containerVolume: number;
}

export class RemoveDriverTransportDto {

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsNumber()
  transportId?: number;
  
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  driverId: number;
}

export class ChangeStatusDriverTransportDto {

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  transportId?: number;
  
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  driverId: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsBoolean()
  status: boolean;
}