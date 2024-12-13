
export { multerConfig } from "./configs/aws-bucket";

export { TmsReqestToDriver } from "./entites/driver/entities/driver-tms-request.entity";
export { RoleDto } from "./entites/role/dtos/role.dto";
export { BadRequestException } from "./exceptions/bad-request.exception";
export { InternalErrorException } from "./exceptions/internal.exception";
export { NoContentException } from "./exceptions/no-content.exception";
export { NotFoundException } from "./exceptions/not-found.exception";
export { AgentBankAccount } from "./entites/agents/entites/bank-account.entity";
export { Agent } from "./entites/agents/entites/agent.entity";
export { AgentDto } from "./entites/agents/agent.dto";
export { Account } from "./entites/accounts/account.entity";
export { AccountDto } from "./entites/accounts/account.dto";
export { UserFileDto } from "./entites/files/file.dto";
export { UserFile } from "./entites/files/file.entity";
export { TransportType } from "./entites/references/entities/transport-type.entity";
export { CargoType } from "./entites/references/entities/cargo-type.entity";
export { CargoTypeGroup } from "./entites/references/entities/cargo-type-group.entity";
export { CargoStatus } from "./entites/references/entities/cargo-status.entity";
export { Currency } from "./entites/references/entities/currency.entity";
export { Subscription } from "./entites/references/entities/subscription.entity";
export { Role } from "./entites/role/entities/role.entity";
export { Permission } from "./entites/role/entities/permission.entity";
export { Staff } from "./entites/staffs/staff.entity";
export { CreateStaffDto, AppendDriversToTmsDto } from "./entites/staffs/staff.dto";
export { Transaction } from "./entites/transactions/transaction.entity";
export { User } from "./entites/users/user.entity";
export { Client } from "./entites/clients/client.entity";
export { ClientPhoneNumber } from "./entites/clients/client-phonenumber.entity";
export { ClientDto, UpdateClientDto, GetClientsDto, UpdateClientPhoneDto, UpdateClientBirthDayDto } from "./entites/clients/client.dto";
export { ClientDocuments } from "./entites/clients/clients-documents.entity";
export { Driver } from "./entites/driver/entities/driver.entity";
export { DriversServicesRequestsPricesDto } from "./entites/driver/dtos/drivers-services-requests-price.dto";
export { DriversServicesRequestsStatuses } from "./entites/references/entities/drivers-services-requests-statuses.entity"
export { DriversServicesRequestsStatusesChangesHistory } from "./entites/driver/entities/drivers-services-requests-statuses-history.entity"
export { DriversServicesRequests } from "./entites/driver/entities/drivers-services-requests.entity"
export { DriversServicesRequestsMessages } from "./entites/driver/entities/drivers-services-requests-messages.entity"
export { DriversServicesRequestsDetails } from "./entites/driver/entities/drivers-services-requests-details.entity"
export { DriversServicesRequestsStatusesDto } from "./entites/references/dtos/drviers-services-requests-statuses.dto"
export { DriversServicesRequestsDto, DriversServicesRequestsOperationDto, DriversServicesRequestsQueryDto } from "./entites/driver/dtos/drivers-services-requests.dto"
export { DriversServicesRequestsMessagesDto, DriversServicesRequestsMessagesFilesDto, DriversServicesRequestsMessagesQueryDto } from "./entites/driver/dtos/drivers-services-requests-messages.dto"
export { ServicesRequestsDocuments } from "./entites/driver/entities/services-requests-documents.entity";
export { DriversServices } from "./entites/driver/entities/drivers-services.entity";
export { DriverPhoneNumber } from "./entites/driver/entities/driver-phone-number.entity";
export { DriverDocuments } from "./entites/driver/entities/driver-documents.entity";
export { DriverDto, UpdateDriverDto, GetDriversDto, UpdateDriverPhoneDto, UpdateDriverBirthDayDto } from "./entites/driver/dtos/driver.dto";
export { DriversServicesDto } from "./entites/driver/dtos/drivers-services.dto";
export { DriverTransport } from "./entites/driver/entities/driver-transport.entity";
export { DriverTransportDto, RemoveDriverTransportDto, ChangeStatusDriverTransportDto } from "./entites/driver/dtos/driver-transport.dto";
export { TransportVerification } from "./entites/driver/entities/transport-verification.entity";
export { Config } from "./entites/config/config.entity";
export { Order } from "./entites/orders/entities/order.entity";
export { LocationPlace } from "./entites/orders/entities/location.entity";
export { DriverOrderOffers } from "./entites/orders/entities/offer.entity";
export { ClientRepliesOrderOffer } from "./entites/orders/entities/client-reply-order-offer.entity";
export { RejectOfferDto } from "./entites/orders/dtos/reject-offer.dto";
export { OrderDto, OrderQueryDto, AdminOrderDto, AssignOrderDto, AdminAcceptOrderDto, AcceptOrderOfferTypes } from "./entites/orders/dtos/order.dto";
export { OrderOfferDto, AdminOrderOfferDto, CancelOfferDto, ReplyDriverOrderOfferDto, AdminReplyDriverOrderOfferDto } from './entites/orders/dtos/order-price-offer.dto'
export { CargoLoadMethod } from "./entites/references/entities/cargo-load-method.entity";
export { CargoPackage } from "./entites/references/entities/cargo-package.entity";
export { TransportKind } from "./entites/references/entities/transport-kind.entity";
export { SubscriptionPayment } from "./entites/references/entities/subscription-payment.entity";
export { ClientMerchant } from './entites/client-merchant/entites/client-merchant.entity';
export { ClientMerchantDto, CreateClientMerchantDto, CreateInStepClientMerchantDto, CompleteClientMerchantDto } from './entites/client-merchant/dtos/client-merchant.dto';
export { CreateClientMerchantUserDto, UpdateClientMerchantUserDto } from './entites/client-merchant/dtos/client-merchant-user.dto';
export { ClientMerchantUser } from './entites/client-merchant/entites/client-merchant-user.entity';
export { ClientBankAccount } from './entites/client-merchant/entites/bank-account.entity';
export { DriverMerchant } from './entites/driver-merchant/entites/driver-merchant.entity';
export { DriverMerchantDto, CreateDriverMerchantDto, CreateInStepDriverMerchantDto, CompleteDriverMerchantDto } from './entites/driver-merchant/dtos/driver-merchant.dto';
export { CreateDriverMerchantUserDto, UpdateDriverMerchantUserDto } from './entites/driver-merchant/dtos/driver-merchant-user.dto';
export { DriverMerchantUser } from './entites/driver-merchant/entites/driver-merchant-user.entity';
export { DriverBankAccount } from './entites/driver-merchant/entites/bank-account.entity';
export { AwsService } from './services/aws.service';
export { SundryService } from './services/sundry.service';
export { CustomJwtService } from './services/jwt.service';
export { TelegramBotService } from './services/telegram-bot.service';
export { SmsService } from './services/sms.service';
export { MailService } from './services/mail.service';
export { TelegramBotUser } from './entites/bot/bot.entity';
export { CargoStatusDto } from './entites/references/dtos/cargo-status.dto';
export { CargoTypeGroupDto } from './entites/references/dtos/cargo-type-group.dto'
export { CargoTypeDto } from './entites/references/dtos/cargo-type.dto'
export { CurrencyDto } from './entites/references/dtos/currency.dto'
export { SubscriptionDto } from './entites/references/dtos/subscription.dto'
export { TransportKindDto } from './entites/references/dtos/transport-kind.dto'
export { CargoPackageDto } from './entites/references/dtos/cargo-package.dto'
export { CargoLoadingMethodDto } from './entites/references/dtos/cargo-loading-method.dto'
export { TransportTypeDto } from './entites/references/dtos/transport-type.dto'

export enum ResponseStauses {
  NotFound = 'dataNotFound',
  UserNotFound = 'userNotFound',
  OrderNotFound = 'orderNotFound',
  MerchantNotFound = 'clientMerchantNotFound',
  AgentNotFound = 'agentNotFound',
  StaffNotFound = 'staffNotFound',
  RoleNotFound = 'roleNotFound',
  IdIsRequired = 'idIsRequired',
  DriverIdIsRequired = 'driverIdIsRequired',
  SubscriptionIsRequired = 'subscriptionIsRequired',
  AgentIdIsRequired = 'agentIdIsRequired',
  ClientIdIsRequired = 'clientIdIsRequired',
  ClientIdOrMerchantIdIsRequired = 'clientIdOrMerchantIdIsRequired',
  MerchantIdIsRequired = 'MerchantIdIsRequired',
  AllFieldsRequired = 'allFieldsAreRequired',
  SubscriptionNotFound = 'subscriptionNotFound',
  CurrencyNotFound = 'currencyNotfound',
  CargoTypeNotFound = 'cargoTypeNotfound',
  CargoStatusNotFound = 'cargoStatusNotFound',
  TransportTypeNotfound = 'transportTypeNotFound',
  TransportKindNotfound = 'transportKindNotFound',
  CargoLoadingMethodNotFound = 'cargoLoadingMethodNotFound',
  CargoPackageNotFound = 'cargoPackageNotFound',
  DriverNotFound = 'driverNotFound',
  UserTypeRequired = 'userTypeRequired',
  InvalidUserType = 'invalidUserType  ',
  SuccessfullyCreated = 'successfullyCreated',
  SuccessfullyUpdated = 'successfullyUpdated',
  SuccessfullyDeleted = 'successfullyDeleted',
  SuccessfullyCanceled = 'successfullyCanceled',
  SuccessfullyRejected = 'successfullyRejected',
  SuccessfullyBlocked = 'successfullyBlocked',
  SuccessfullyActivated = 'successfullyActivated',
  SuccessfullyCompleted = 'successfullyCompleted',
  SuccessfullyFinished = 'successfullyFinished',
  SuccessfullyAssigned = 'successfullyAssigned',
  SuccessfullyAccepted = 'successfullyAccepted',
  SuccessfullyVerified = 'successfullyVerified',
  CreateDataFailed = 'createFailed',
  SendCodeFailed = 'sendCodeFailed',
  UpdateDataFailed = 'updateFalied',
  DeleteDataFailed = 'deleteFalied',
  CancelDataFailed = 'cancelFalied',
  RejectDataFailed = 'rejectFalied',
  VerifyDataFailed = 'verifyFalied',
  BlockDataFailed = 'blockFalied',
  AwsStoreFileFailed = 'fileStoreFailed',
  DuplicateError = 'duplicateError',
  PhoneNumberDuplicateError = 'phoneNumberDuplicateError',
  PhoneNumbeersMustBeArray = 'phoneNumbeersMustBeArray',
  PhoneNumberShouldContainAll = 'PhoneNumberShouldContainAll',
  AlreadyDeleted = 'alreadyDeleted',
  AlreadyBlocked = 'alreadyBlocked',
  AlreadyActive = 'alreadyActive',
  AlreadyVerified = 'alreadyVerified',
  AlreadyAssigned = 'alreadyAssigned',
  AlreadyRejected = 'alreadyRejecteed',
  AlreadyAccepted = 'alreadyAccepted',
  AlreadyCanceled = 'alreadyCanceled',
  AlreadyRequested = 'alreadyRequested',
  OrderIsClosed = 'orderIsClosed',
  OrderIsNotWaiting = 'orderIsNotWaiting',
  DriverHasOrder = 'driverHasOrder',
  DriverArchived = 'driverArchived',
  DriverBlocked = 'driverBlocked',
  AlreadyOffered = 'alreadyOfferedToThisOrder',
  AlreadyReplied = 'alreadyRepliedToThisOffer',
  RepliedToIdIsRequired = 'repliedToIdIsRequired',
  OfferLimit = 'offerLimitExceeded',
  MerchantAlreadyVerified = 'merchantAlreadyVerified',
  InternalServerError = 'internalError',
  NotModified = 'notModified',
  InvalidPassword = 'invalidPassword',
  PasswordShouldCointainNumStr = 'passwordShouldContainerNumStr',
  InvalidBankAccount = 'invalidBankAccount',
  BankAccountIsRequired = 'bankAccountIsRequired',
  FileIsRequired = 'fileIsRequired',
  DriverAlreadyAssigned = 'driverAlreadyAssigned',
  OfferWasRejected = 'offerWasRejected',
  OfferWasCanceled = 'offerWasCanceled',
  NotEnoughBalance = 'notEnoughBalance',
  AccessDenied = 'accessDenied',
  TokenExpired = 'tokenExpired',
  OtpExpired = 'otpExpired',
  InvalidCode = 'invalidCode',
  IsMainFieldIsReuqired = 'IsMainFieldIsReuqired',
  OrderStatusNotWaiting = 'orderStatusNotWaiting',
  OrderIsNotAccepted = 'orderIsNotAccepted',
  OrderIsNotActivated = 'orderIsNotActivated',
  OrderIsNotCompleted = 'orderIsNotCompleted',
  ServiceNotFound = 'serviceNotFound',
  ServiceRequestNotFound = 'serviceRequestNotFound',
  ServiceRequestStatusNotFound = 'serviceRequestStatusNotFound',
  RequestStatusIsNotWaiting = 'requestStatusIsNotWaiting',
  RequestStatusIsNotPriced = 'requestStatusIsNotPriced',
  RequestStatusIsNotConfirmed = 'requestStatusIsNotConfirmed',
  RequestCantBeCanceleted = 'requestCantBeCanceleted',
  NotAssigned = 'NotAssigned'
}

export enum CargoStatusCodes {
  Waiting = 0, //Ожидающий
  Accepted = 1,  //Принято
  Active = 2, //Выполняется
  Completed = 3, //Выполнен
  Closed = 4,  //Завершенный
  Canceled = 5, //Отменено
  Archive = 6
}

export enum ServicesRequestsStatusesCodes {
  Waiting = 0,
  Priced = 1,
  Confirmed = 2,
  Working = 3,
  Active = 4,
  Completed = 5,
  Canceled = 6,
  Deleted = 7
}

export enum UserTypes {
  Client = 'client',
  Driver = 'driver',
  ClientMerchant = 'client_merchant',
  ClientMerchantUser = 'client_merchant_user',
  DriverMerchant = 'driver_merchant',
  DriverMerchantUser = 'driver_merchant_user',
  Staff = 'staff',
  Agent = 'agent'
}

export enum DriverServiceRequestMessageTypes {
  Text = 'text',
  File = 'file'
}

export enum SendOtpTypes {
  Telegram = 'telegram',
  Whatsapp = 'whatsapp',
  Sms = 'sms'
}

export enum SseEventNames {
  NewMessage = 'newMessage',
  NewServiceRequest = 'newServiceRequest',
  ServiceRequestCanceled = 'serviceRequestCanceled',
  ServiceRequestPriced = 'serviceRequestPriced',
  ServiceRequtConfirmed = 'serviceRequestConfirm',
  ServiceRequestToWorking = 'serviceRequestToWorking',
  ServiceRequestToCompleted = 'serviceRequestToCompleted',
  ServiceRequestDeleted = 'serviceRequestDeleted',
  TmsSentAssignRequestToDriver = 'tmsSentAssignRequestToDriver',
  DriverAcceptedTmsAssignRequest = 'driverAcceptedTmsAssignRequest',
  DriverRejectedTmsAssignRequest = 'driverRejectedTmsAssignRequest',
}

export enum UserStates {
  Active = 'active',
  Blocked = 'blocked',
  Deleted = 'deleted',
  Verified = 'verified',
  Unverified = 'unverified',
  NotDeleted = 'notDeleted'
}

export enum UsersRoleNames {
  SuperAdmin = 'Super admin',
  Agent = 'Agent',
}

export enum UserDocumentTypes {
  Profile = 'profile',
  DriverLicense = 'driverLicense',
  Passport = 'passport',
  IdCard = 'idCard'
}

export enum AwsS3BucketKeyNames {
  Drivers = 'drivers',
  DriversProfiles = 'drivers/profiles',
  DriversPassports = 'drivers/passports',
  DriversLicenses = 'drivers/driver-licenses',
  DriversServicesRequests = 'drivers/services-requests',
  Clients = 'clients',
  Tmses = 'tmses',
  ClientsProfiles = 'clients/profiles',
}

export class BpmResponse {
  success: boolean;
  data: { content: any, totalPagesCount: number, pageIndex: number, pageSize: number };
  messages: string[] | undefined;

  constructor(success: boolean, data: any, messages?: string[]) {
    this.success = success;
    this.data = data;
    this.messages = messages;
  }
}

export enum TransactionTypes {
  TopUp = 'topupAccount',
  Withdraw = 'withdrawAccount',
  WithdrawSecureAccount = 'withdrawSecureAccount',
  SecureTransaction = 'secureTransaction',
  TopUpAgentAccount = 'topUpAgentAccount',
  DriverSubscriptionPayment = 'driverSubscriptionPayment'
}

export enum AccountTypes {
  BankAccount = 'BankAccount',
  CustomAccount = 'CustomAccount'
}
export * from './modules/shared-modules.module';
export * from './modules/auth.module';
export * from './modules/database.module';
export * from './shared-modules.service';
export * from './modules/swagger.module';