import { IsNotEmpty, IsUUID } from "class-validator";

export class DriverTransportDto {

  id?: number;
  
  @IsNotEmpty()
  name: string;

  transportKindIds: any;
  transportTypeIds: any;
  loadingMethodIds: any;
  cargoTypeIds: any;
  driverId: number;
  cubicCapacity:number;
  stateNumber:string; 
  refrigeratorFrom: number;
  refrigeratorTo: number;
  refrigeratorCount: number;
  isHook: boolean;
  isAdr: boolean;
  techPassportFrontFilePath:string; 
  techPassportBackFilePath:string; 
  transportFrontFilePath:string; 
  transportBackFilePath:string; 
  transportSideFilePath:string; 
  goodsTransportationLicenseCardFilePath:string; 
  driverLicenseFilePath:string; 
  passportFilePath:string;
}

export class DriverTransportVerificationDto {

  id?: number;
  
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  transportKindIds: any;

  @IsNotEmpty()
  transportTypeIds: any;

  @IsNotEmpty()
  loadingMethodIds: any;

  @IsNotEmpty()
  cargoTypeIds: any;

  @IsNotEmpty()
  driverId: number;

  @IsNotEmpty()
  cubicCapacity:number;

  @IsNotEmpty()
  stateNumber:string; 

  refrigeratorFrom: number;
  refrigeratorTo: number;
  refrigeratorCount: number;
  isHook: boolean;

  @IsNotEmpty()
  isAdr: boolean;

  @IsNotEmpty()
  transportId: number;

  techPassportFrontFilePath:string; 
  techPassportBackFilePath:string; 
  transportFrontFilePath:string; 
  transportBackFilePath:string; 
  transportSideFilePath:string; 
  goodsTransportationLicenseCardFilePath:string; 
  driverLicenseFilePath:string; 
  passportFilePath:string;
}