import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { SendOtpTypes, UserTypes } from ".";
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
    number: string

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    code: string

    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    @IsEnum(UserTypes)
    userType: string;

    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    @IsEnum(SendOtpTypes)
    sendBy: string;
}

export class VerifyOtpDto {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    number: string

    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    @IsEnum(UserTypes)
    userType: string;

    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ required: true })
    @IsNumber()
    @IsNotEmpty()
    otpCode: number;
}