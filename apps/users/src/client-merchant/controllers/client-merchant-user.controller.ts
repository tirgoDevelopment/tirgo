import { Body, Controller, Get, Post, UseInterceptors, UploadedFiles, UsePipes, ValidationPipe, Put, Patch, Query, Delete, } from '@nestjs/common';
import { ClientMerchantDto, CompleteClientMerchantDto, CreateClientMerchantDto, CreateClientMerchantUserDto, CreateInStepClientMerchantDto, UpdateClientMerchantUserDto } from '../..';
import { ClientMerchantUsersService } from '../services/client-merchant-user.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Client merchant user')
@Controller('client-merchant-user')
export class ClientMerchantUserController {
  constructor(
    private clientMerchantUsersService: ClientMerchantUsersService,
  ) { }

  @ApiOperation({ summary: 'Get client merchant user by id' })
  @Get('id')
    async getUserById(@Query('id') id: number) {
        return this.clientMerchantUsersService.findUserById(id);
    }

    @ApiOperation({ summary: 'Get all client merchant users' })
    @Get()
    async getUsers() {
        return this.clientMerchantUsersService.getUsers();
    }

    @ApiOperation({ summary: 'Get all client merchant users by merhcant id' })
    @Get('merchant')
    async getMerchantUsers(@Query() id: number) {
        return this.clientMerchantUsersService.getMerchantUsers(id);
    }

    @ApiOperation({ summary: 'Create merchant user' })
    @Post()
    @UsePipes(ValidationPipe)
    async createUser(@Body() createUserDto: CreateClientMerchantUserDto) {
        return this.clientMerchantUsersService.createUser(createUserDto);
    }

    @ApiOperation({ summary: 'Send code' })
    @Post('send-code')
    @UsePipes(ValidationPipe)
    async sendCode(@Body() sendCodeDto: any) {
        return this.clientMerchantUsersService.sendMailToResetPassword(sendCodeDto);
    }

    @ApiOperation({ summary: 'Verify code' })
    @Post('verify-code')
    @UsePipes(ValidationPipe)
    async verifyCode(@Body() sendCodeDto: any) {
        return this.clientMerchantUsersService.verifyResetPasswordCode(sendCodeDto);
    }

    @ApiOperation({ summary: 'Verify phone sms code' })
    @Post('phone-verify')
    @UsePipes(ValidationPipe)
    async phoneVerify(@Body() sendPhoneVerifyDto: any) {
        return this.clientMerchantUsersService.phoneVerify(sendPhoneVerifyDto);
    }

    @ApiOperation({ summary: 'Change password' })
    @Patch('password')
    @UsePipes(ValidationPipe)
    async changePass(@Query('userId') id: number, @Body() body: { password: string, newPassword: string }) {
        return this.clientMerchantUsersService.changeUserPassword(body.password, body.newPassword, id);
    }

    @ApiOperation({ summary: 'Reset password' })
    @Patch('reset-password')
    @UsePipes(ValidationPipe)
    async resetPass(@Body() body: { password: string, email: string }) {
        return this.clientMerchantUsersService.resetUserPassword(body.password, body.email);
    }

    @ApiOperation({ summary: 'Update client merchant user' })
    @Put()
    @UsePipes(ValidationPipe)
    async updateUser(@Query('id') id: number, @Body() updateUserDto: any) {
        return this.clientMerchantUsersService.updateUser(id, updateUserDto);
    }

    @Patch('state')
    @UsePipes(ValidationPipe)
    async disableUser(@Query('id') id: number) {
        return this.clientMerchantUsersService.changeUserState(id);
    }

    @ApiOperation({ summary: 'Delete client merchant user' })
    @Delete()
    async deleteUser(@Query('id') id: string) {
        return this.clientMerchantUsersService.deleteUser(id);
    }
}
