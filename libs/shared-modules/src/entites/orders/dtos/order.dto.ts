import { IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";
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
  client: Client;

  @ApiProperty({ required: false })
  additionalClient: Client;

  @ApiProperty({ required: false })
  driver: Driver;

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
  fromLocation: LocationDto;

  @ApiProperty({ required: true })    
  @IsNotEmpty()
  toLocation: LocationDto;

  @ApiProperty({ required: false })    
  transportType: TransportTypeDto[];

  @ApiProperty({ required: true })    
  @IsNotEmpty()
  transportKinds: TransportKindDto[];

  @ApiProperty({ required: true })    
  cargoLoadMethods?: CargoLoadingMethodDto;

  @ApiProperty({ required: true })    
  @IsNotEmpty()
  cargoType: CargoTypeDto;

  @ApiProperty({ required: false })    
  cargoStatus?: CargoStatusDto;

  @ApiProperty({ required: false })  
  offeredPriceCurrency: CurrencyDto;

  @ApiProperty({ required: false })  
  createdAt: Date;

  @ApiProperty({ required: false })  
  createdBy: User;

  @ApiProperty({ required: false })  
  isDeleted: boolean;

  @ApiProperty({ required: false })  
  deletedAt: Date;

  @ApiProperty({ required: false })  
  deletedBy: User;

  @ApiProperty({ required: false })  
  deleteReason: string;

  @ApiProperty({ required: false })  
  isCanceled: boolean;

  @ApiProperty({ required: false })  
  canceledAt: Date;

  @ApiProperty({ required: false })  
  canceledBy: User;

  @ApiProperty({ required: false })  
  cancelReason: string;

}

export class AppendOrderDto {

  @ApiProperty({ required: false })
  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsNotEmpty()
  currencyId: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsNotEmpty()
  driverId: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}