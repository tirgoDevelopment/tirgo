import { Body, Controller, Get, Post, Query, UsePipes, ValidationPipe, Patch } from '@nestjs/common';
import { LoginService } from './services/login.service';
import { AuthService } from './auth.service';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { UserTypes } from '.';
import { LoginDto } from './auth.dto';

class RestoreUser {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsEnum(UserTypes)
  userType: UserTypes;
}

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

  @Get('archive')
  getArchivedUsers() {
    return this.authService.getArchivedUsers()
  }

  @Get('archive/get-by')
  getArchivedUser(@Query('userId') id: number) {
    return this.authService.getArchivedUser(id)
  }

  @Patch('restore-user')
  @UsePipes(ValidationPipe)
  restoreUser(@Body() restoreDto: RestoreUser) {
    return this.loginService.restoreUser(restoreDto);
  }

}
