import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class DriversServicesRequestsStatusesDto {

  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  code: number;

  @IsString()
  @IsNotEmpty()
  color: string;
}