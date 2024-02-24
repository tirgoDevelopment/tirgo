import { IsNotEmpty, IsString } from "class-validator";

export class TransportTypeDto {
    
  @IsString()
  @IsNotEmpty()
  name: string;

  description?: string;

  id?: string;
}