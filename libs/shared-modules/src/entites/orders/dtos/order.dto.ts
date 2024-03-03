import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class OrderDto {

  @ApiProperty({ required: false })
  id?: number;
  
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  loadingLocation: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  deliveryLocation: string;

  @ApiProperty({ required: false })
  merchantId: number;

  @ApiProperty({ required: false })
  additionalClientId: number;

  @ApiProperty({ required: false })
  clientId: number;

  @ApiProperty({ required: false })
  cargoStatusId?: number;

  @ApiProperty({ required: false })
  customsPlaceLocation?: string;

  @ApiProperty({ required: false })
  customsClearancePlaceLocation?: string;

  @ApiProperty({ required: false })
  additionalLoadingLocation?: string;

  @ApiProperty({ required: false })
  isAdr?: boolean;

  @ApiProperty({ required: false })
  isCarnetTir?: string;

  @ApiProperty({ required: false })
  isGlonas?: boolean;

  @ApiProperty({ required: false })
  isParanom?: boolean;

  @ApiProperty({ required: false })
  offeredPrice?: number;

  @ApiProperty({ required: false })
  paymentMethod?: string;

  @ApiProperty({ required: false })
  inAdvancePrice?: number;

  @ApiProperty({ required: false })
  offeredPriceCurrencyId: string;

  @ApiProperty({ required: false })
  inAdvancePriceCurrencyId: string;

  @ApiProperty({ required: false })
  refrigeratorFrom?: string;

  @ApiProperty({ required: false })
  refrigeratorTo?: string;

  @ApiProperty({ required: false })
  refrigeratorCount?: number;

  @ApiProperty({ required: true })
  @IsDate()
  @IsNotEmpty()
  sendDate: Date;

  @ApiProperty({ required: true })
  @IsBoolean()
  @IsNotEmpty()
  isSafeTransaction: boolean;

  @ApiProperty({ required: true })
  @IsUUID()
  @IsNotEmpty()
  transportTypeIds: string[];

  @ApiProperty({ required: true })
  @IsNotEmpty()
  transportKindIds: string[];

  @ApiProperty({ required: true })
  @IsUUID()
  @IsNotEmpty()
  cargoTypeId: string;

  @ApiProperty({ required: false })
  isUrgent: boolean;

  @ApiProperty({ required: false })
  isTwoDays: boolean

  @ApiProperty({ required: false })
  isHook: boolean;

  @ApiProperty({ required: false })
  cisternVolume: number;

  @ApiProperty({ required: false })
  containerVolume: number;

  @ApiProperty({ required: false })
  capacity:number;

  @ApiProperty({ required: false })
  cargoWeight?: number;

  @ApiProperty({ required: false })
  cargoLength?: number;

  @ApiProperty({ required: false })
  cargoWidth?: number;

  @ApiProperty({ required: false })
  cargoHeight?: number;

  @ApiProperty({ required: false })
  volume?: number;

  @ApiProperty({ required: false })
  loadingMethodId?: string;

  @ApiProperty({ required: false })
  cargoPackageId?: string;
}