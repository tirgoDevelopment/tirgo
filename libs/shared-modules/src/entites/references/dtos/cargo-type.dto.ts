import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CargoTypeDto {
  
  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  codeTNVED: string;

  @IsNotEmpty()
  cargoTypeGroupId: string;
  }