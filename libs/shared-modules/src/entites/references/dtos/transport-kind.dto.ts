import { IsNotEmpty, IsString } from "class-validator";

export class TransportKindDto {
    
  @IsString()
  @IsNotEmpty()
  name: string;

  isMode: boolean
  count: number;
  from?: string;
  to?: string;
  description?: string;

  id?: string;
}