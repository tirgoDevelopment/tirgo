import { Body, Controller, Get, Post, UseInterceptors, UploadedFiles, UsePipes, ValidationPipe, Put, Patch, Query, Delete, } from '@nestjs/common';
import { ClientMerchantDto, CompleteClientMerchantDto, CreateClientMerchantDto, CreateClientMerchantUserDto, CreateInStepClientMerchantDto, UpdateClientMerchantUserDto } from '../..';
import { ClientMerchantUsersService } from '../services/client-merchant-user.service';

@Controller('client-merchant-user')
export class ClientMerchantUserController {
  constructor(
    private clientMerchantUsersService: ClientMerchantUsersService,
  ) { }

  @Get('id')
    async getUserById(@Query('id') id: number) {
        return this.clientMerchantUsersService.findUserById(id);
    }

    @Get()
    async getUsers() {
        return this.clientMerchantUsersService.getUsers();
    }

    @Get('merchant')
    async getMerchantUsers(@Query() id: number) {
        return this.clientMerchantUsersService.getMerchantUsers(id);
    }

    @Post()
    @UsePipes(ValidationPipe)
    async createUser(@Body() createUserDto: CreateClientMerchantUserDto) {
        return this.clientMerchantUsersService.createUser(createUserDto);
    }

    @Post('send-code')
    @UsePipes(ValidationPipe)
    async sendCode(@Body() sendCodeDto: any) {
        return this.clientMerchantUsersService.sendMailToResetPassword(sendCodeDto);
    }

    @Post('verify-code')
    @UsePipes(ValidationPipe)
    async verifyCode(@Body() sendCodeDto: any) {
        return this.clientMerchantUsersService.verifyResetPasswordCode(sendCodeDto);
    }

    @Post('phone-verify')
    @UsePipes(ValidationPipe)
    async phoneVerify(@Body() sendPhoneVerifyDto: any) {
        return this.clientMerchantUsersService.phoneVerify(sendPhoneVerifyDto);
    }

    @Patch('password')
    @UsePipes(ValidationPipe)
    async changePass(@Query('userId') id: number, @Body() body: { password: string, newPassword: string }) {
        return this.clientMerchantUsersService.changeUserPassword(body.password, body.newPassword, id);
    }

    @Patch('reset-password')
    @UsePipes(ValidationPipe)
    async resetPass(@Body() body: { password: string, email: string }) {
        return this.clientMerchantUsersService.resetUserPassword(body.password, body.email);
    }

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

    @Delete()
    async deleteUser(@Query('id') id: string) {
        return this.clientMerchantUsersService.deleteUser(id);
    }
}
