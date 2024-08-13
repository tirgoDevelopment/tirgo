import { IsNotEmpty, IsString, MinLength, MaxLength, IsBoolean } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class DriverServiceDto {

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  code: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsBoolean()
  withoutSubscription?: string;

  @ApiProperty({ required: false })
  id?: number;

}
