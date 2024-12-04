import { IsNotEmpty, IsNumber, IsUUID } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class DriversServicesRequestsDto {

  @ApiProperty({ required: false })
  @IsNumber()
  @IsNotEmpty()
  driverId: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  servicesIds: number[];

  @ApiProperty({ required: true })
  statusId: string;

  @ApiProperty({ required: false })
  id?: number;
}

export class DriversServicesRequestsOperationDto {

  @ApiProperty({ required: false })
  cancelReason?: string;

  @ApiProperty({ required: false })
  deleteReason?: string;
}


export class DriversServicesRequestsQueryDto {
  @ApiProperty({ required: false })
  pageSize: number;

  @ApiProperty({ required: false })
  pageIndex: number;

  @ApiProperty({ required: false })
  sortBy: string;

  @ApiProperty({ required: false })
  sortType: string;

  @ApiProperty({ required: false })
  serviceId: number;

  @ApiProperty({ required: false })
  driverId: number;   

  @ApiProperty({ required: false })
  statusCode: number;   

  @ApiProperty({ required: false })
  createdAtFrom: string;  

  @ApiProperty({ required: false })
  createdAtTo: string;
}