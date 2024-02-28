import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UsersRoleNames, BpmResponse, CargoLoadMethod, Order, CargoPackage, CargoStatus, CargoStatusCodes, CargoType, Currency, ResponseStauses, TransportKind, TransportType, BadRequestException, InternalErrorException, OrderDto, ClientMerchant, NoContentException, User, UserTypes, Client, ClientMerchantUser, ReplyOfferDto, OrderOffer, OrderOfferReply, OrderOfferDto, Driver } from '..';
import { RabbitMQSenderService } from '../services/rabbitmq-sender.service';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Order) private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Client) private readonly clientsRepository: Repository<Client>,
    @InjectRepository(Driver) private readonly driversRepository: Repository<Driver>,
    @InjectRepository(Currency) private readonly curreniesRepository: Repository<Currency>,
    @InjectRepository(CargoType) private readonly cargoTyepesRepository: Repository<CargoType>,
    @InjectRepository(CargoStatus) private readonly cargoStatusesRepository: Repository<CargoStatus>,
    @InjectRepository(CargoPackage) private readonly cargoPackagesRepository: Repository<CargoPackage>,
    @InjectRepository(TransportKind) private readonly transportKindsRepository: Repository<TransportKind>,
    @InjectRepository(TransportType) private readonly transportTypesRepository: Repository<TransportType>,
    @InjectRepository(ClientMerchant) private readonly clientMerchantsRepository: Repository<ClientMerchant>,
    @InjectRepository(ClientMerchantUser) private readonly clientMerchantUsersRepository: Repository<ClientMerchantUser>,
    @InjectRepository(CargoLoadMethod) private readonly cargoLoadingMethodsRepository: Repository<CargoLoadMethod>,
    @InjectRepository(OrderOffer) private readonly orderOffersRepository: Repository<OrderOffer>,
    @InjectRepository(OrderOfferReply) private readonly offerRepliesRepository: Repository<OrderOfferReply>,
    private rmqService: RabbitMQSenderService
  ) { }

  async createOrder(createOrderDto: OrderDto, user: User): Promise<BpmResponse> {
    try {
      const order: Order = new Order();
      if(user.userType == UserTypes.ClientMerchantUser) {
        const clientMerchantUser = await this.clientMerchantUsersRepository.findOneOrFail({ where: { user: { id: user.id} }, relations: ['clientMerchant'] })
        order.clientMerchant = clientMerchantUser.clientMerchant;
        order.isClientMerchant = true;

      } else if(user.userType == UserTypes.Client) {

        if(createOrderDto.additionalClientId) {
          const additionalCLient: Client = await this.clientsRepository.findOneOrFail({ where: { id: createOrderDto.additionalClientId } });
          order.additionalClient = additionalCLient;
        }
        order.client = user.client;

      }
  
      const cargoType: CargoType = await this.cargoTyepesRepository.findOneOrFail({ where: { id: createOrderDto.cargoTypeId } });
      const transportTypes: TransportType[] = await this.transportTypesRepository.find({ where: { id: In(createOrderDto.transportTypeIds) } });
      const transportKinds: TransportKind[] = await this.transportKindsRepository.find({ where: { id: In(createOrderDto.transportKindIds) } });
      const cargoStatus: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Waiting } });

      
      if(createOrderDto.offeredPriceCurrencyId) {
        const offeredCurrency: Currency = await this.curreniesRepository.findOneOrFail({ where: { id: createOrderDto.offeredPriceCurrencyId } });
        order.offeredPriceCurrency = offeredCurrency;
      }
      if(createOrderDto.inAdvancePriceCurrencyId) {
        const inAdvanceCurrency: Currency = await this.curreniesRepository.findOneOrFail({ where: { id: createOrderDto.inAdvancePriceCurrencyId } });
        order.inAdvancePriceCurrency = inAdvanceCurrency;
      }
      if(createOrderDto.loadingMethodId) {
        const loadingMethod: CargoLoadMethod = await this.cargoLoadingMethodsRepository.findOneOrFail({ where: { id: createOrderDto.loadingMethodId } });
        order.loadingMethod = loadingMethod;
      }
      if(createOrderDto.cargoPackageId) {
        const cargoPackage: CargoPackage = await this.cargoPackagesRepository.findOneOrFail({ where: { id: createOrderDto.cargoPackageId } });
        order.cargoPackage = cargoPackage;
      }

      

      order.transportKinds = transportKinds;
      order.transportTypes = transportTypes;
      order.cargoType = cargoType;
      order.cargoStatus = cargoStatus;
      order.loadingLocation = createOrderDto.loadingLocation;
      order.deliveryLocation = createOrderDto.deliveryLocation;
      order.customsPlaceLocation = createOrderDto.customsPlaceLocation;
      order.customsClearancePlaceLocation = createOrderDto.customsClearancePlaceLocation;
      order.additionalLoadingLocation = createOrderDto.additionalLoadingLocation;
      order.isAdr = createOrderDto.isAdr;
      order.isCarnetTir = createOrderDto.isCarnetTir;
      order.isGlonas = createOrderDto.isGlonas;
      order.isParanom = createOrderDto.isParanom;
      order.offeredPrice = createOrderDto.offeredPrice;
      order.paymentMethod = createOrderDto.paymentMethod;
      order.inAdvancePrice = createOrderDto.inAdvancePrice;
      order.sendDate = createOrderDto.sendDate;
      order.isSafeTransaction = createOrderDto.isSafeTransaction;
      order.cargoWeight = createOrderDto.cargoWeight;
      order.cargoLength = createOrderDto.cargoLength;
      order.cargoWidth = createOrderDto.cargoWidth;
      order.cargoHeight = createOrderDto.cargoHeight;
      order.volume = createOrderDto.volume;
      order.refrigeratorFrom = createOrderDto.refrigeratorFrom;
      order.refrigeratorTo = createOrderDto.refrigeratorTo;
      order.refrigeratorCount = createOrderDto.refrigeratorCount;
      order.isUrgent = createOrderDto.isUrgent;
      order.isTwoDays = createOrderDto.isTwoDays;
      order.isHook = createOrderDto.isHook;
      order.cisternVolume = createOrderDto.cisternVolume;
      order.containerVolume = createOrderDto.containerVolume;
      order.capacity = createOrderDto.capacity;
      order.createdBy = user;

      const res: any = await this.ordersRepository.save(order);
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        if (err.message.includes('ClientMerchant')) {
          throw new BadRequestException(ResponseStauses.UserNotFound);
        } else if (err.message.includes('Currency')) {
          throw new BadRequestException(ResponseStauses.CurrencyNotFound);
        } else if (err.message.includes('Currency')) {
          throw new BadRequestException(ResponseStauses.TransportTypeNotfound);
        } else if (err.message.includes('TransportKind')) {
          throw new BadRequestException(ResponseStauses.TransportKindNotfound);
        } else if (err.message.includes('CargoTyepe')) {
          throw new BadRequestException(ResponseStauses.CargoTypeNotFound);
        } else if (err.message.includes('CargoLoadMethod')) {
          throw new BadRequestException(ResponseStauses.CargoLoadingMethodNotFound);
        } else if (err.message.includes('CargoPackage')) {
          throw new BadRequestException(ResponseStauses.CargoPackageNotFound);
        } else if (err.message.includes('CargoStatus')) {
          throw new BadRequestException(ResponseStauses.CargoStatusNotFound);
        }
      } else {
        throw new InternalErrorException(ResponseStauses.CreateDataFailed);
      }
    }
  }

  async updateOrder(updateOrderDto: OrderDto): Promise<BpmResponse> {
    try {

      const order: Order = new Order();
      order.loadingLocation = updateOrderDto.loadingLocation || order.loadingLocation;
      order.deliveryLocation = updateOrderDto.deliveryLocation || order.deliveryLocation;
      order.customsPlaceLocation = updateOrderDto.customsPlaceLocation || order.customsPlaceLocation;
      order.customsClearancePlaceLocation = updateOrderDto.customsClearancePlaceLocation || order.customsClearancePlaceLocation;
      order.additionalLoadingLocation = updateOrderDto.additionalLoadingLocation || order.additionalLoadingLocation;
      order.isAdr = updateOrderDto.isAdr || order.isAdr;
      order.isCarnetTir = updateOrderDto.isCarnetTir || order.isCarnetTir;
      order.isGlonas = updateOrderDto.isGlonas || order.isGlonas;
      order.isParanom = updateOrderDto.isParanom || order.isParanom;
      order.offeredPrice = updateOrderDto.offeredPrice || order.offeredPrice;
      order.paymentMethod = updateOrderDto.paymentMethod || order.paymentMethod;
      order.inAdvancePrice = updateOrderDto.inAdvancePrice || order.inAdvancePrice;
      order.sendDate = updateOrderDto.sendDate || order.sendDate;
      order.isSafeTransaction = updateOrderDto.isSafeTransaction || order.isSafeTransaction;
      order.cargoWeight = updateOrderDto.cargoWeight || order.cargoWeight;
      order.cargoLength = updateOrderDto.cargoLength || order.cargoLength;
      order.cargoWidth = updateOrderDto.cargoWidth || order.cargoWidth;
      order.cargoHeight = updateOrderDto.cargoHeight || order.cargoHeight;
      order.volume = updateOrderDto.volume || order.volume;
      order.refrigeratorFrom = updateOrderDto.refrigeratorFrom || order.refrigeratorFrom;
      order.refrigeratorTo = updateOrderDto.refrigeratorTo || order.refrigeratorTo;
      order.refrigeratorCount = updateOrderDto.refrigeratorCount || order.refrigeratorCount;
      order.isUrgent = updateOrderDto.isUrgent || order.isUrgent;
      order.isTwoDays = updateOrderDto.isTwoDays || order.isTwoDays;
      order.isHook = updateOrderDto.isHook || order.isHook;
      order.cisternVolume = updateOrderDto.cisternVolume || order.cisternVolume;
      order.containerVolume = updateOrderDto.containerVolume || order.containerVolume;
      order.capacity = updateOrderDto.capacity || order.capacity;

      if (updateOrderDto.merchantId) {
        order.clientMerchant = await this.clientMerchantsRepository.findOneOrFail({ where: { id: updateOrderDto.merchantId } });
      }
      if (updateOrderDto.clientId) {
        order.client = await this.clientsRepository.findOneOrFail({ where: { id: updateOrderDto.clientId } });
      }
      if (updateOrderDto.additionalClientId) {
        order.additionalClient = await this.clientsRepository.findOneOrFail({ where: { id: updateOrderDto.additionalClientId } });
      }
      if (updateOrderDto.offeredPriceCurrencyId) {
        order.offeredPriceCurrency = await this.curreniesRepository.findOneOrFail({ where: { id: updateOrderDto.offeredPriceCurrencyId } });

      }
      if (updateOrderDto.inAdvancePriceCurrencyId) {
        order.inAdvancePriceCurrency = await this.curreniesRepository.findOneOrFail({ where: { id: updateOrderDto.inAdvancePriceCurrencyId } });

      }
      if (updateOrderDto.transportTypeIds) {
        order.transportTypes = await this.transportTypesRepository.find({ where: { id: In(updateOrderDto.transportTypeIds) } });

      }
      if (updateOrderDto.transportKindIds.length) {
        order.transportKinds = await this.transportKindsRepository.find({ where: { id: In(updateOrderDto.transportKindIds) } });

      }
      if (updateOrderDto.cargoTypeId) {
        order.cargoType = await this.cargoTyepesRepository.findOneOrFail({ where: { id: updateOrderDto.cargoTypeId } });

      }
      if (updateOrderDto.loadingMethodId) {
        order.loadingMethod = await this.cargoLoadingMethodsRepository.findOneOrFail({ where: { id: updateOrderDto.loadingMethodId } });

      }
      if (updateOrderDto.cargoPackageId) {
        order.cargoPackage = await this.cargoPackagesRepository.findOneOrFail({ where: { id: updateOrderDto.cargoPackageId } });

      }

      await this.ordersRepository.save(order);
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      if (err.name == 'EntityNotFoundError') {
        if (err.message.includes('merchantsRepository')) {
          throw new BadRequestException(ResponseStauses.UserNotFound);
        } else if (err.message.includes('curreniesRepository')) {
          throw new BadRequestException(ResponseStauses.CurrencyNotFound);
        } else if (err.message.includes('transportTypesRepository')) {
          throw new BadRequestException(ResponseStauses.TransportTypeNotfound);
        } else if (err.message.includes('transportKindsRepository')) {
          throw new BadRequestException(ResponseStauses.TransportKindNotfound);
        } else if (err.message.includes('cargoTyepesRepository')) {
          throw new BadRequestException(ResponseStauses.CargoTypeNotFound);
        } else if (err.message.includes('cargoLoadingMethodsRepository')) {
          throw new BadRequestException(ResponseStauses.CargoLoadingMethodNotFound);
        } else if (err.message.includes('cargoPackagesRepository')) {
          throw new BadRequestException(ResponseStauses.CargoPackageNotFound);
        }
        throw new BadRequestException(ResponseStauses.NotFound);
      } else {
        throw new InternalErrorException(ResponseStauses.UpdateDataFailed);
      }
    }
  }
  
  async getOrderById(id: number): Promise<BpmResponse> {
    try {
      if (!id) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const order = await this.ordersRepository.findOneOrFail({ where: { id, deleted: false }, relations: ['driverOffers.currency', 'driverOffers', 'driverOffers.createdBy', 'driverOffers.driver', 'driverOffers.driver.phoneNumbers', 'cargoStatus', 'clientMerchant', 'inAdvancePriceCurrency', 'offeredPriceCurrency', 'cargoType', 'cargoPackage', 'transportTypes', 'loadingMethod', 'transportKinds'] });
      return new BpmResponse(true, order, null);
    } catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new NoContentException();
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async getClientOrderByUserId(sortBy: string, sortType: string, pageIndex: string, pageSize: string, userId: number, orderId: number, statusId: string, loadingLocation: string, deliveryLocation: string, transportKindId: string, transportTypeId: string, createdAt: string, sendDate: string): Promise<BpmResponse> {
    try {
      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 1
      if (!userId) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const filter: any = { deleted: false };
      const sort: any = {};
      if(sortBy && sortType) {
        sort[sortBy] = sortType; 
      } else {
        sort['id'] = 'DESC'
      }
      const user: User = await this.usersRepository.findOneOrFail({ where: { id: userId }, relations: ['role', 'clientMerchantUser', 'clientMerchantUser.clientMerchant', 'driverMerchant'] })
      if (user.userType == UserTypes.ClientMerchantUser && user.role.name == UsersRoleNames.SuperAdmin) {
        filter.clientMerchant = { id: user.clientMerchantUser.clientMerchant?.id };
      } else {
        filter.createdBy = { id: userId }
      }
      if(transportTypeId) {
        filter.transportType = { id: transportTypeId }
      }
      if(orderId) {
        filter.id = { id: orderId }
      }
      if(transportKindId) {
        filter.transportKind = { id: transportKindId }
      }
      if(statusId) {
        const status: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { id: statusId }, order: sort });
        if(status.code == CargoStatusCodes.Closed)  {
          filter.cargoStatus = { code: In([CargoStatusCodes.Closed, CargoStatusCodes.Canceled]) };
        } else {
          filter.cargoStatus = { id: statusId };
        }
      }
      if(loadingLocation) {
        filter.loadingLocation = loadingLocation
      }
      if(deliveryLocation) {
        filter.deliveryLocation = deliveryLocation
      }
      if(createdAt) {
        filter.createdAt = createdAt
      }
      if(sendDate) {
        filter.sendDate = sendDate
      }
      const orders = await this.ordersRepository.find({ 
        order: {id: 'DESC'}, 
        where: filter,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size, 
        relations: ['driverOffers', 'driverOffers.currency', 'driverOffers.createdBy', 'driverOffers.driver', 'driverOffers.driver.phoneNumbers', 'clientMerchant', 'inAdvancePriceCurrency', 'offeredPriceCurrency', 'cargoType', 'cargoStatus', 'cargoPackage', 'transportTypes', 'loadingMethod', 'transportKinds'] });
        
        const ordersCount = await this.ordersRepository.count({ where : filter });
  

        if(orders.length) {
        return new BpmResponse(true, orders, null, Math.ceil(ordersCount / size));
      } else {
        throw new NoContentException();
      }
    } catch (err: any) {
      console.log(err)
      if(err instanceof HttpException) {
        throw err
      }else if (err.name == 'EntityNotFoundError') {
        throw new NoContentException();
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async cancelOrder(id: number, user: User): Promise<BpmResponse> {
    try {
      if(!id || isNaN(id)) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      if(user.userType !== UserTypes.Client) {
      }
      const cargoStatus: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Canceled } });
      const res = await this.ordersRepository.update({ id, createdBy: { id: user.id }  }, { cargoStatus: cargoStatus })
      if(res.affected) {
        return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCanceled]);
      } else {
        throw new InternalErrorException(ResponseStauses.CancelDataFailed)
      }
    } catch (err: any) {
      if (err.name == 'EntityNotFoundError') {
        throw new BadRequestException(ResponseStauses.NotFound);
      } else {
        throw new InternalErrorException(ResponseStauses.UpdateDataFailed);
      }
    }
  }

  async replyToOffer(replyDto: ReplyOfferDto, userId: number): Promise<BpmResponse> {
    try {

      const offer: OrderOffer = await this.orderOffersRepository.findOneOrFail({ where: { id: replyDto.offerId }, relations: ['order'] });
      const order = await this.ordersRepository.findOneOrFail({ where: { id: offer.order?.id } })
      const replies: OrderOfferReply[] = await this.offerRepliesRepository.find({ where: { orderOffer: { id: replyDto.offerId } } })

      if(replies.length) {
        throw new BadRequestException(ResponseStauses.AlreadyReplied);
      }

      const createOfferReplyDto: OrderOfferReply = new OrderOfferReply();
      const currency: Currency = await this.curreniesRepository.findOneOrFail({ where: { id: replyDto.curencyId } });
      const user: User = await this.usersRepository.findOneOrFail({ where: { id: userId } });  


      createOfferReplyDto.amount = replyDto.amount;
      createOfferReplyDto.currency = currency;
      createOfferReplyDto.createdBy = user;
      createOfferReplyDto.orderOffer = offer;
      createOfferReplyDto.order = order;

      const res = await this.orderOffersRepository.save(createOfferReplyDto);
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch(err: any) {
      console.log(err)
      if(err instanceof HttpException) {
        throw err
      } else if (err.name == 'EntityNotFoundError') {
        throw new BadRequestException(ResponseStauses.NotFound);
      } else {
        throw new InternalErrorException(ResponseStauses.UpdateDataFailed);
      }
    }
  }

  async offerPriceToDriver(offerDto: OrderOfferDto, userId: number): Promise<BpmResponse> {
    try {

      const isAlreadyAccepted: boolean = await this.orderOffersRepository.exists({ where: { order: { id: offerDto.orderId}, accepted: true } });
      if(isAlreadyAccepted) {
        throw new BadRequestException(ResponseStauses.AlreadyAccepted)
      }

      const isDriverBusy: boolean = await this.orderOffersRepository.exists({ where: { driver: { id: offerDto.driverId}, accepted: true } });
      if(isDriverBusy) {
        throw new BadRequestException(ResponseStauses.DriverHasOrder)
      }


      const offered: OrderOffer[] = await this.orderOffersRepository.find({ where: { order: { id: offerDto.orderId }, driver: { id: offerDto.driverId }, createdBy: { id: userId }} });
      if((offered.filter((el: any) => !el.rejected && !el.canceled)).length) {
        throw new BadRequestException(ResponseStauses.AlreadyOffered);
      }
      if(offered.length > 2) {
        throw new BadRequestException(ResponseStauses.OfferLimit);
      }

      const createOfferDto: OrderOffer = new OrderOffer();

      const user: User = await this.usersRepository.findOneOrFail({ where: { id: userId } });  
      const order: Order = await this.ordersRepository.findOneOrFail({ where: { id: offerDto.orderId }, relations: ['createdBy'] });
      const currency: Currency = await this.curreniesRepository.findOneOrFail({ where: { id: offerDto.curencyId } });
      const driver: Driver = await this.driversRepository.findOneOrFail({ where: { id: offerDto.driverId } });  

      if(offered.length) {
        createOfferDto.offerIndex = offered.length; 
      }
      createOfferDto.amount = offerDto.amount;
      createOfferDto.driver = driver;
      createOfferDto.order = order;
      createOfferDto.currency = currency;
      createOfferDto.createdBy = user;

      //reject other offers
      await this.orderOffersRepository.update({order: { id: order.id, driver: { id: driver.id } }}, { rejected: true })

      //then create new offer
      await this.orderOffersRepository.save(createOfferDto);
      await this.rmqService.sendOrderOfferMessageToDriver({ userId: driver.id, orderId: order.id })
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch(err: any) {
      console.log(err)
      if(err instanceof HttpException) {
        throw err
      } else if (err.name == 'EntityNotFoundError') {
        throw new BadRequestException(ResponseStauses.NotFound);
      } else {
        throw new InternalErrorException(ResponseStauses.UpdateDataFailed);
      }
    }
  }

  async acceptDriverOffer(offerId: number): Promise<BpmResponse> {
    try { 
      const offer: OrderOffer = await this.orderOffersRepository.findOneOrFail({ where: { id: offerId }, relations: ['driver', 'order'] });
      const cargoStatus: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Accepted } });
      const order: Order = await this.ordersRepository.findOneOrFail({ where: { id: offer.order?.id } })
      if(offer.rejected) {
        throw new BadRequestException(ResponseStauses.OfferWasRejected);
      }  else if (offer.canceled) {
        throw new BadRequestException(ResponseStauses.OfferWasCanceled);
      }

      const isAlreadyAccepted: boolean = await this.orderOffersRepository.exists({ where: { order: { id: offer.order?.id}, accepted: true } });
      if(isAlreadyAccepted) {
        throw new BadRequestException(ResponseStauses.AlreadyAccepted)
      }

      offer.accepted = true;
      await this.orderOffersRepository.save(offer);

      order.cargoStatus = cargoStatus;
      await this.ordersRepository.save(order);
      await this.rmqService.sendAcceptOfferMessageToDriver({ userId: offer.driver?.id, orderId: offer.order?.id})
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch(err: any) {
      console.log(err)
      if(err instanceof HttpException) {
        throw err
      } else if (err.name == 'EntityNotFoundError') {
        throw new BadRequestException(ResponseStauses.NotFound);
      } else {
        throw new InternalErrorException(ResponseStauses.UpdateDataFailed);
      }
    }
  }
}