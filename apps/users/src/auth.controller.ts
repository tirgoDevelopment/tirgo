import { Body, Controller, Get, Post, Query, UsePipes, ValidationPipe, Patch } from '@nestjs/common';
import { LoginService } from './services/login.service';
import { AuthService } from './auth.service';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { UserTypes } from '.';
import { LoginDto } from './auth.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

class RestoreUser {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsEnum(UserTypes)
  userType: UserTypes;
}

@ApiTags('Archive users')
@Controller()
export class AuthController {
  constructor(
    private loginService: LoginService,
    private authService: AuthService
  ) { }

  @Post('login')
  @UsePipes(ValidationPipe)
  login(@Body() loginDto: LoginDto) {
    return this.loginService.login(loginDto);
  }

  @ApiOperation({ summary: 'Get all archive users' })
  @Get('archive')
  getArchivedUsers() {
    return this.authService.getArchivedUsers()
  }

  @ApiOperation({ summary: 'Get archive user by id' })
  @Get('archive/get-by')
  getArchivedUser(@Query('userId') id: number) {
    return this.authService.getArchivedUser(id)
  }

  @ApiOperation({ summary: 'Restore archived user' })
  @Patch('restore-user')
  @UsePipes(ValidationPipe)
  restoreUser(@Body() restoreDto: RestoreUser) {
    return this.loginService.restoreUser(restoreDto);
  }

}
