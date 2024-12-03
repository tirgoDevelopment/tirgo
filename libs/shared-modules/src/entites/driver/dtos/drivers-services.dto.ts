import { IsNotEmpty, IsString, MinLength, MaxLength, IsBoolean } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class DriversServicesDto {

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  tirAmount: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  uzsAmount: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  kztAmount: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  code: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsBoolean()
  withoutSubscription?: boolean;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsBoolean()
  isLegalEntity?: boolean;

  @ApiProperty({ required: false })
  id?: number;

}
