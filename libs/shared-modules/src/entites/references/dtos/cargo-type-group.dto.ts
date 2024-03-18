import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CargoTypeGroupDto {
  
  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  codeTNVED: string;
}