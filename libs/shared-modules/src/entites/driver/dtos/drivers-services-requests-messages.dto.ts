import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

enum UserTypes {
  Client = 'client',
  Driver = 'driver',
  ClientMerchant = 'client_merchant',
  ClientMerchantUser = 'client_merchant_user',
  DriverMerchant = 'driver_merchant',
  DriverMerchantUser = 'driver_merchant_user',
  Staff = 'staff',
  Agent = 'agent'
}

enum DriverServiceRequestMessageTypes {
  Text = 'text',
  Image = 'image',
  Document = 'document'
}

export class DriversServicesRequestsMessagesDto {

  @ApiProperty({ required: false })
  id?: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  @IsEnum(DriverServiceRequestMessageTypes)
  messageType: DriverServiceRequestMessageTypes;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsBoolean()
  isReplied: boolean;

  @ApiProperty({ required: false })
  repliedToId: number;
}

export class DriversServicesRequestsMessagesQueryDto {
  @ApiProperty({ required: false })
  pageSize: number;

  @ApiProperty({ required: false })
  pageIndex: number;

  @ApiProperty({ required: false })
  sortBy: string;

  @ApiProperty({ required: false })
  sortType: string;

  @ApiProperty({ required: false })
  createdAtFrom: string;

  @ApiProperty({ required: false })
  createdAtTo: string;
}

