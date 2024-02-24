import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CargoLoadingMethodDto {

  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  code: number;
}