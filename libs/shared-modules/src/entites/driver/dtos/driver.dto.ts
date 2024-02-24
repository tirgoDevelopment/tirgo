import { IsNotEmpty, IsString, MinLength, MaxLength } from "class-validator";

export class DriverDto {

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @MinLength(6)
  @MaxLength(6)
  password: string;

  @IsNotEmpty()
  phoneNumbers: string[];

  additionalPhoneNumber?: string;
  citizenship?: string;
  passportFilePath?: string;
  driverLicenseFilePath?: string;
  email?: string;
  id?: number;
  agentId: number;

}
