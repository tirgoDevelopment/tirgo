import { IsEmail, IsNotEmpty, IsString, IsUUID, Matches, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateStaffDto {

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ required: true })
  @IsUUID()
  roleId: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(16)
  password: string;
}

export class UpdateStaffDto {
  @ApiProperty({ required: false })
  id: number;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ required: true })
  @IsUUID()
  roleId: string;

  @ApiProperty({ required: true })  
  @IsString()
  @IsNotEmpty()
  phone: string;

}