import { IsNotEmpty, IsNumber, ValidateNested, IsArray } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DriversServicesRequestsPricesDetailsDto {
  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  serviceId: number;
}

export class DriversServicesRequestsPricesDto {

  @ApiProperty({ 
    required: true, 
    type: [DriversServicesRequestsPricesDetailsDto],
  })
  @IsArray() 
  @ValidateNested({ each: true }) 
  @Type(() => DriversServicesRequestsPricesDetailsDto)
  details: DriversServicesRequestsPricesDetailsDto[];

  @ApiProperty({ required: false })
  id?: number;
}

