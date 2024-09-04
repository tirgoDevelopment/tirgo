import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class ClientDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ required: false })
  phoneNumbers: string[];
  
  @ApiProperty({ required: false })
  additionalPhoneNumber?: string;

  @ApiProperty({ required: false })
  citizenship?: string;

  @ApiProperty({ required: false })
  pasportFilePath?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(16)
  password?: string;
  id?: number;

}

export class UpdateClientDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ required: false })
  phoneNumbers: string[];
  
  @ApiProperty({ required: false })
  additionalPhoneNumber?: string;

  @ApiProperty({ required: false })
  citizenship?: string;

  @ApiProperty({ required: false })
  pasportFilePath?: string;

  @ApiProperty({ required: false })
  email?: string;

  id?: number;

}

export class QueryDto {

  @IsNotEmpty()
  id: number;
}