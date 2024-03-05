import { Body, Controller, Post, UsePipes, ValidationPipe, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DriverMerchantUsersService } from '../services/driver-merchant-user.service';

@ApiTags('Driver merchant user')
@Controller('driver-merchant-user')
export class DriverMerchantUserController {
  constructor(
    private driverMerchantUsersService: DriverMerchantUsersService,
  ) { }

    @ApiOperation({ summary: 'Send code' })
    @Post('send-code')
    @UsePipes(ValidationPipe)
    async sendCode(@Body() sendCodeDto: any) {
        return this.driverMerchantUsersService.sendMailToResetPassword(sendCodeDto);
    }

    @ApiOperation({ summary: 'Verify code' })
    @Post('verify-code')
    @UsePipes(ValidationPipe)
    async verifyCode(@Body() sendCodeDto: any) {
        return this.driverMerchantUsersService.verifyResetPasswordCode(sendCodeDto);
    }

    @ApiOperation({ summary: 'Verify phone sms code' })
    @Post('phone-verify')
    @UsePipes(ValidationPipe)
    async phoneVerify(@Body() sendPhoneVerifyDto: any) {
        return this.driverMerchantUsersService.phoneVerify(sendPhoneVerifyDto);
    }

    @ApiOperation({ summary: 'Change password' })
    @Patch('password')
    @UsePipes(ValidationPipe)
    async changePass(@Query('userId') id: number, @Body() body: { password: string, newPassword: string }) {
        return this.driverMerchantUsersService.changeUserPassword(body.password, body.newPassword, id);
    }

    @ApiOperation({ summary: 'Reset password' })
    @Patch('reset-password')
    @UsePipes(ValidationPipe)
    async resetPass(@Body() body: { password: string, email: string }) {
        return this.driverMerchantUsersService.resetUserPassword(body.password, body.email);
    }
}
