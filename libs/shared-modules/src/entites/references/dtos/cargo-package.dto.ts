import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CargoPackageDto {

  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

}