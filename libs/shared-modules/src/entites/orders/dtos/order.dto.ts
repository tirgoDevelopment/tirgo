import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";

export class OrderDto {

  id?: number;
  
  @IsString()
  @IsNotEmpty()
  loadingLocation: string;

  @IsString()
  @IsNotEmpty()
  deliveryLocation: string;

  merchantId: number;

  additionalClientId: number;

  clientId: number;

  cargoStatusId?: number;

  customsPlaceLocation?: string;
  customsClearancePlaceLocation?: string;
  additionalLoadingLocation?: string;
  isAdr?: boolean;
  isCarnetTir?: string;
  isGlonas?: boolean;
  isParanom?: boolean;
  offeredPrice?: number;
  paymentMethod?: string;
  inAdvancePrice?: number;
  offeredPriceCurrencyId: string;
  inAdvancePriceCurrencyId: string;
  refrigeratorFrom?: string;
  refrigeratorTo?: string;
  refrigeratorCount?: number;

  @IsDate()
  @IsNotEmpty()
  sendDate: Date;

  @IsBoolean()
  @IsNotEmpty()
  isSafeTransaction: boolean;

  @IsUUID()
  @IsNotEmpty()
  transportTypeIds: string[];

  @IsNotEmpty()
  transportKindIds: string[];

  @IsUUID()
  @IsNotEmpty()
  cargoTypeId: string;

  isUrgent: boolean;
  isTwoDays: boolean
  isHook: boolean;
  cisternVolume: number;
  containerVolume: number;
  capacity:number;

  cargoWeight?: number;
  cargoLength?: number;
  cargoWidth?: number;
  cargoHeight?: number;
  volume?: number;

  loadingMethodId?: string;
  cargoPackageId?: string;
}