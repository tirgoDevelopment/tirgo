import { Body, Controller, Get, Post, Query, UsePipes, ValidationPipe, Patch } from '@nestjs/common';
import { LoginService } from './services/login.service';
import { AuthService } from './auth.service';
import { LoginDto,SendOtpDto } from './auth.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Archive users')
@Controller()
export class AuthController {
  constructor(
    private loginService: LoginService,
    private authService: AuthService
  ) { }

  @ApiOperation({ summary: 'User login' })
  @Post('login')
  @UsePipes(ValidationPipe)
  login(@Body() loginDto: LoginDto) {
    return this.loginService.login(loginDto);
  }

  @ApiOperation({ summary: 'Send otp to phonenumber' })
  @Post('send-otp')
  @UsePipes(ValidationPipe)
  sendOtp(@Body() sendOtp: SendOtpDto) {
    return this.loginService.sendOtp(sendOtp);
  }

  @ApiOperation({ summary: 'Get all archive users' })
  @Get('archive')
  getArchivedUsers(
    @Query('userId') id: number,
    @Query('userType') userType: string
  ) {
    return this.authService.getArchivedUsers(id, userType)
  }

  @ApiOperation({ summary: 'Get archive user by id' })
  @Get('archive/get-by')
  getArchivedUser(@Query('userId') id: number) {
    return this.authService.getArchivedUser(id)
  }

}
