import { IS_UUID, IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString, IsUUID, ValidateNested, isUUID } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

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
  
  @ApiProperty({ required: true })
  @ValidateNested()
  @IsNotEmpty()
  loadingLocation: LocationDto;

  @ApiProperty({ required: true })
  @ValidateNested()
  @IsNotEmpty()
  deliveryLocation: LocationDto;

  @ApiProperty({ required: false })
  merchantId: number;

  @ApiProperty({ required: false })
  additionalClientId: number;

  @ApiProperty({ required: false })
  clientId: number;

  @ApiProperty({ required: false })
  cargoStatusId?: number;

  @ApiProperty({ required: true })
  @ValidateNested()
  @IsNotEmpty()
  customsPlaceLocation?: LocationDto;

  @ApiProperty({ required: true })
  @ValidateNested()
  @IsNotEmpty()
  customsClearancePlaceLocation?: LocationDto;

  @ApiProperty({ required: true })
  @ValidateNested()
  @IsNotEmpty()
  additionalLoadingLocation?: LocationDto;

  @ApiProperty({ required: true })
  @ValidateNested()
  @IsNotEmpty()
  additionalDeliveryLocation?: LocationDto;

  @ApiProperty({ required: false })
  isAdr?: boolean;

  @ApiProperty({ required: false })
  isCarnetTir?: boolean;

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
  isHighCube: boolean;

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