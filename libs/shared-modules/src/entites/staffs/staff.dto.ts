import { IsEmail, IsNotEmpty, IsString, IsUUID, Matches, MaxLength, MinLength } from "class-validator";

export class CreateStaffDto {

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsUUID()
  roleId: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(10)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'password too weak'})
  password: string;
}

export class UpdateStaffDto {

  id: number;
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsUUID()
  roleId: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

}