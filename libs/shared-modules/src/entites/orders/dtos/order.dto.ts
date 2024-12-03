import { IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { Client } from "../../clients/client.entity";
import { Driver } from "../../driver/entities/driver.entity";
import { TransportKindDto } from "../../references/dtos/transport-kind.dto";
import { TransportTypeDto } from "../../references/dtos/transport-type.dto";
import { CargoTypeDto } from "../../references/dtos/cargo-type.dto";
import { CargoLoadingMethodDto } from "../../references/dtos/cargo-loading-method.dto";
import { CargoStatusDto } from "../../references/dtos/cargo-status.dto";
import { User } from "../../users/user.entity";
import { CurrencyDto } from "../../references/dtos/currency.dto";

class LocationDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  latitude: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  longitude: string;
}

export class OrderDto {

  @ApiProperty({ required: false })
  id?: number;

  @ApiProperty({ required: false })
  additionalClientId: number;

  @ApiProperty({ required: false })
  cargoWeight: number;

  @ApiProperty({ required: false })  
  isAdr?: boolean;

  @ApiProperty({ required: false })  
  isHook?: boolean;

  @ApiProperty({ required: false })  
  offeredPrice?: number;

  @ApiProperty({ required: false })  
  isCashlessPayment: boolean;

  @ApiProperty({ required: false })    
  isSecureTransaction: boolean;

  @ApiProperty({ required: false })    
  isBorderCrossing: boolean;

  @ApiProperty({ required: false })    
  cargoDimension: string;

  @ApiProperty({ required: false })    
  refrigeratorFromCount?: string;

  @ApiProperty({ required: false })    
  refrigeratorToCount?: string;

  @ApiProperty({ required: false })  
  isRefrigerator?: boolean;

  @ApiProperty({ required: false })    
  sendDate: Date;

  @ApiProperty({ required: false })  
  cisternVolume: string;

  @ApiProperty({ required: false })  
  loadCapacity: string;

  @ApiProperty({ required: true })    
  @IsNotEmpty()
  loadingLocation: {name: string, latitude: string, longitude: string};

  @ApiProperty({ required: true })    
  @IsNotEmpty()
  deliveryLocation: {name: string, latitude: string, longitude: string};

  @ApiProperty({ required: false })    
  transportTypeId: string;

  @ApiProperty({ required: true })    
  @IsNotEmpty()
  transportKindIds: string[];

  @ApiProperty({ required: true })    
  cargoLoadMethodIds?: string[];

  @ApiProperty({ required: true })    
  @IsNotEmpty()
  cargoTypeId: string;

  @ApiProperty({ required: false })    
  cargoStatusId?: string;

  @ApiProperty({ required: false })  
  offeredPriceCurrencyId: string;
}

export class OrderQueryDto {
  @ApiProperty({ required: false })
  pageSize: number;

  @ApiProperty({ required: false })
  pageIndex: number;

  @ApiProperty({ required: false })
  sortBy: string;

  @ApiProperty({ required: false })
  sortType: string;

  @ApiProperty({ required: false })
  transportKindId: string;

  @ApiProperty({ required: false })
  cargoTypeId: string;

  @ApiProperty({ required: false })
  transportTypeId: string;

  @ApiProperty({ required: false })
  orderId: number;

  @ApiProperty({ required: false })
  clientId: number;

  @ApiProperty({ required: false })
  driverId: number;

  @ApiProperty({ required: false })
  statusCode: number;

  @ApiProperty({ required: false })
  loadingLocationName: string;

  @ApiProperty({ required: false })
  deliveryLocationName: string;

  @ApiProperty({ required: false })
  sendDate: Date;

  @ApiProperty({ required: false })
  createdAt: Date;
}

export class AssignOrderDto {

  @ApiProperty({ required: false })
  @IsUUID()
  @IsNotEmpty()
  currencyId: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  driverId: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

export enum AcceptOrderOfferTypes {
  Offer = 'offer',
  Reply = 'reply'
}

export class AdminAcceptOrderDto {

  @ApiProperty({ required: false })
  @IsString()
  @IsEnum(AcceptOrderOfferTypes)
  @IsNotEmpty()
  type: AcceptOrderOfferTypes;
}


export class AdminOrderDto {

  @ApiProperty({ required: false })
  id?: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  clientId: number;

  @ApiProperty({ required: false })
  additionalClientId: number;

  @ApiProperty({ required: false })
  driverId: number;

  @ApiProperty({ required: false })
  cargoWeight: number;

  @ApiProperty({ required: false })  
  isAdr?: boolean;

  @ApiProperty({ required: false })  
  isHook?: boolean;

  @ApiProperty({ required: false })  
  offeredPrice?: number;

  @ApiProperty({ required: false })  
  isCashlessPayment: boolean;

  @ApiProperty({ required: false })    
  isSecureTransaction: boolean;

  @ApiProperty({ required: false })    
  isBorderCrossing: boolean;

  @ApiProperty({ required: false })    
  cargoDimension: string;

  @ApiProperty({ required: false })    
  refrigeratorFromCount?: string;

  @ApiProperty({ required: false })    
  refrigeratorToCount?: string;

  @ApiProperty({ required: false })  
  isRefrigerator?: boolean;

  @ApiProperty({ required: false })    
  sendDate: Date;

  @ApiProperty({ required: false })  
  cisternVolume: string;

  @ApiProperty({ required: false })  
  loadCapacity: string;

  @ApiProperty({ required: true })    
  @IsNotEmpty()
  loadingLocation: {name: string, latitude: string, longitude: string};

  @ApiProperty({ required: true })    
  @IsNotEmpty()
  deliveryLocation: {name: string, latitude: string, longitude: string};

  @ApiProperty({ required: true })    
  customsOutClearanceLocation: {name: string, latitude: string, longitude: string};

  @ApiProperty({ required: true })    
  customsInClearanceLocation: {name: string, latitude: string, longitude: string};

  @ApiProperty({ required: true })    
  additionalLoadingLocation: {name: string, latitude: string, longitude: string};

  @ApiProperty({ required: true })    
  additionalDeliveryLocation: {name: string, latitude: string, longitude: string};

  @ApiProperty({ required: false })    
  transportTypeId: string;

  @ApiProperty({ required: true })    
  @IsNotEmpty()
  transportKindIds: string[];

  @ApiProperty({ required: true })    
  cargoLoadMethodIds?: string[];

  @ApiProperty({ required: true })    
  @IsNotEmpty()
  cargoTypeId: string;

  @ApiProperty({ required: false })    
  cargoStatusId?: string;

  @ApiProperty({ required: false })  
  offeredPriceCurrencyId: string;
}