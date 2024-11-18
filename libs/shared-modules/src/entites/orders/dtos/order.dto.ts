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

  @ApiProperty({ required: true })
  id?: number;

  @ApiProperty({ required: true })
  client: Client;

  @ApiProperty({ required: true })
  additionalClient: Client;

  @ApiProperty({ required: true })
  driver: Driver;

  @ApiProperty({ required: true })
  cargoWeight: number;

  @ApiProperty({ required: true })  
  isAdr?: boolean;

  @ApiProperty({ required: true })  
  isHook?: boolean;

  @ApiProperty({ required: true })  
  offeredPrice?: number;

  @ApiProperty({ required: true })  
  isCashlessPayment: boolean;

  @ApiProperty({ required: true })    
  isSecureTransaction: boolean;

  @ApiProperty({ required: true })    
  isBorderCrossing: boolean;

  @ApiProperty({ required: true })    
  cargoDimension: string;

  @ApiProperty({ required: true })    
  refrigeratorFromCount?: string;

  @ApiProperty({ required: true })    
  refrigeratorToCount?: string;

  @ApiProperty({ required: true })  
  isRefrigerator?: boolean;

  @ApiProperty({ required: true })    
  sendDate: Date;

  @ApiProperty({ required: true })  
  cisternVolume: string;

  @ApiProperty({ required: true })  
  loadCapacity: string;

  @ApiProperty({ required: false })    
  @IsNotEmpty()
  fromLocation: LocationDto;

  @ApiProperty({ required: false })    
  @IsNotEmpty()
  toLocation: LocationDto;

  @ApiProperty({ required: true })    
  transportType: TransportTypeDto[];

  @ApiProperty({ required: false })    
  @IsNotEmpty()
  transportKinds: TransportKindDto[];

  @ApiProperty({ required: true })    
  cargoLoadMethods?: CargoLoadingMethodDto;

  @ApiProperty({ required: false })    
  @IsNotEmpty()
  cargoType: CargoTypeDto;

  @ApiProperty({ required: true })    
  cargoStatus?: CargoStatusDto;

  @ApiProperty({ required: true })  
  offeredPriceCurrency: CurrencyDto;

  @ApiProperty({ required: true })  
  createdAt: Date;

  @ApiProperty({ required: true })  
  createdBy: User;

  @ApiProperty({ required: true })  
  isDeleted: boolean;

  @ApiProperty({ required: true })  
  deletedAt: Date;

  @ApiProperty({ required: true })  
  deletedBy: User;

  @ApiProperty({ required: true })  
  deleteReason: string;

  @ApiProperty({ required: true })  
  isCanceled: boolean;

  @ApiProperty({ required: true })  
  canceledAt: Date;

  @ApiProperty({ required: true })  
  canceledBy: User;

  @ApiProperty({ required: true })  
  cancelReason: string;

}

export class AppendOrderDto {

  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @ApiProperty({ required: true })
  @IsUUID()
  @IsNotEmpty()
  currencyId: string;

  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  driverId: number;

  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}