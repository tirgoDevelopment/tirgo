import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString, ValidateNested } from "class-validator";

export class PermissionDto {

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  addDriver: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  addClient: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  addOrder: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  cancelOrder: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  seeDriversInfo: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  seeClientsInfo: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  sendPush: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  chat: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  tracking: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  driverFinance: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  clientMerchantFinance: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  driverMerchantFinance: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  registerClientMerchant: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  registerDriverMerchant: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  verifyDriver: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  driverMerchantList: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  clientMerchantList: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  adminPage: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  finRequest: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  driverMerchantPage: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  clientMerchantPage: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  driverVerification: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  agentPage: boolean;

  
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  dashboardPage : boolean;
  
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  archivedPage: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  orderPage: boolean;
  
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  referencesPage: boolean;
  
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  activePage: boolean;
  
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  adminAgentPage: boolean;
  
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  attachDriverAgent: boolean;
  
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  addBalanceAgent: boolean;
  
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  seeSubscriptionTransactionAgent: boolean;
  
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  seePaymentTransactionAdmin: boolean;
  
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  seeServiceTransactionAdmin: boolean;
}

export class RoleDto {

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  name: string;

  description: string;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  @ValidateNested()
  permission: PermissionDto;
  id?: string;

}