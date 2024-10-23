import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { UserTypes } from ".";
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    username: string

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    password: string

    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    userType: string;
}

export class SendOtpDto {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    phoneNumber: string

    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    @IsEnum(UserTypes)
    userType: string;
}

export class VerifyOtpDto {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    phoneNumber: string

    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    @IsEnum(UserTypes)
    userType: string;

    @ApiProperty({ required: true })
    @IsNumber()
    @IsNotEmpty()
    code: string;
}