import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { UserTypes } from ".";

export class LoginDto {

    @IsNotEmpty()
    @IsString()
    username: string

    @IsNotEmpty()
    @IsString()
    password: string

    @IsString()
    @IsNotEmpty()
    userType: string;
}