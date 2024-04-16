import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { UsersRoleNames, BpmResponse, CargoLoadMethod, Order, CargoPackage, CargoStatus, CargoStatusCodes, CargoType, Currency, ResponseStauses, TransportKind, TransportType, BadRequestException, InternalErrorException, OrderDto, ClientMerchant, NoContentException, User, UserTypes, Client, LocationPlace, AppendOrderDto, OrderOffer, Driver } from '..';
import { RabbitMQSenderService } from '../services/rabbitmq-sender.service';

@Injectable()
export class StaffsService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Client) private readonly clientsRepository: Repository<Client>,
    @InjectRepository(Currency) private readonly curreniesRepository: Repository<Currency>,
    @InjectRepository(CargoType) private readonly cargoTyepesRepository: Repository<CargoType>,
    @InjectRepository(CargoPackage) private readonly cargoPackagesRepository: Repository<CargoPackage>,
    @InjectRepository(TransportKind) private readonly transportKindsRepository: Repository<TransportKind>,
    @InjectRepository(TransportType) private readonly transportTypesRepository: Repository<TransportType>,
    @InjectRepository(ClientMerchant) private readonly clientMerchantsRepository: Repository<ClientMerchant>,
    @InjectRepository(CargoLoadMethod) private readonly cargoLoadingMethodsRepository: Repository<CargoLoadMethod>,
    @InjectRepository(Order) private readonly ordersRepository: Repository<Order>,
    @InjectRepository(CargoStatus) private readonly cargoStatusesRepository: Repository<CargoStatus>,
    @InjectRepository(LocationPlace) private readonly locationsRepository: Repository<LocationPlace>,
    @InjectRepository(OrderOffer) private readonly orderOffersRepository: Repository<OrderOffer>,
    @InjectRepository(Driver) private readonly driversRepository: Repository<Driver>,
    private rmqService: RabbitMQSenderService,
    private dataSource: DataSource
  ) { }

  async createOrder(createOrderDto: OrderDto, user: User): Promise<BpmResponse> {
    try {
      const order: Order = new Order();
 
      if(createOrderDto.clientId && !isNaN(createOrderDto.clientId)) {
        order.client = await this.clientsRepository.findOneOrFail({ where: { id: createOrderDto.clientId } });
      } else if (createOrderDto.merchantId && !isNaN(createOrderDto.merchantId)) {
        order.clientMerchant = await this.clientMerchantsRepository.findOneOrFail({ where: { id: createOrderDto.merchantId } });
      } else {
        throw new BadRequestException(ResponseStauses.ClientIdOrMerchantIdIsRequired)
      }

      if(createOrderDto.additionalClientId) {
        order.additionalClient = await this.clientsRepository.findOneOrFail({ where: { id: createOrderDto.additionalClientId } });
      }
      if(createOrderDto.offeredPriceCurrencyId) {
        order.offeredPriceCurrency = await this.curreniesRepository.findOneOrFail({ where: { id: createOrderDto.offeredPriceCurrencyId } });
      }
      if(createOrderDto.inAdvancePriceCurrencyId) {
        order.inAdvancePriceCurrency = await this.curreniesRepository.findOneOrFail({ where: { id: createOrderDto.inAdvancePriceCurrencyId } });
      }
      if(createOrderDto.cargoTypeId) {
        order.cargoType = await this.cargoTyepesRepository.findOneOrFail({ where: { id: createOrderDto.cargoTypeId } });
      }
      if(createOrderDto.loadingMethodId) {
        order.loadingMethod = await this.cargoLoadingMethodsRepository.findOneOrFail({ where: { id: createOrderDto.loadingMethodId } });
      }
      if(createOrderDto.cargoPackageId) {
        order.cargoPackage = await this.cargoPackagesRepository.findOneOrFail({ where: { id: createOrderDto.cargoPackageId } });
      }
      if(createOrderDto.transportTypeIds) {
        order.transportTypes = await this.transportTypesRepository.find({ where: { id: In(createOrderDto.transportTypeIds) } });
      }
      if(createOrderDto.transportKindIds) {
        order.transportKinds = await this.transportKindsRepository.find({ where: { id: In(createOrderDto.transportKindIds) } });
      } 
      if(createOrderDto.isHighCube) {
        order.isHighCube = createOrderDto.isHighCube;
      }
  
      const cargoStatus: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Waiting } });
      order.cargoStatus = cargoStatus;
      order.loadingLocation =  await this.locationsRepository.save({ name: createOrderDto.loadingLocation.name, latitude: createOrderDto.loadingLocation.latitude, longitude: createOrderDto.loadingLocation.longitude })
      order.deliveryLocation = await this.locationsRepository.save({ name: createOrderDto.deliveryLocation.name, latitude: createOrderDto.deliveryLocation.latitude, longitude: createOrderDto.deliveryLocation.longitude });
      if(createOrderDto.customsPlaceLocation) {
        order.customsPlaceLocation = await this.locationsRepository.save({ name: createOrderDto.customsPlaceLocation.name, latitude: createOrderDto.customsPlaceLocation.latitude, longitude: createOrderDto.customsPlaceLocation.longitude });
      }
      if(createOrderDto.customsClearancePlaceLocation) {
        order.customsClearancePlaceLocation = await this.locationsRepository.save({ name: createOrderDto.customsClearancePlaceLocation.name, latitude: createOrderDto.customsClearancePlaceLocation.latitude, longitude: createOrderDto.customsClearancePlaceLocation.longitude });
      }
      if(createOrderDto.additionalLoadingLocation) {
        order.additionalLoadingLocation = await this.locationsRepository.save({ name: createOrderDto.additionalLoadingLocation.name, latitude: createOrderDto.additionalLoadingLocation.latitude, longitude: createOrderDto.additionalLoadingLocation.longitude });
      } 
      if(createOrderDto.additionalDeliveryLocation) { 
        order.additionalDeliveryLocation = await this.locationsRepository.save({ name: createOrderDto.additionalDeliveryLocation.name, latitude: createOrderDto.additionalDeliveryLocation.latitude, longitude: createOrderDto.additionalDeliveryLocation.longitude });;
      }
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
      if (err instanceof HttpException) {
        throw err
      } else if (err.name == 'EntityNotFoundError') {
        throw new BadRequestException(ResponseStauses.UserNotFound);
        if (err.message.includes('ClientMerchant')) {
        } else if (err.message.includes('Currency')) {
          throw new BadRequestException(ResponseStauses.CurrencyNotFound);
        } else if (err.message.includes('TransportType')) {
          throw new BadRequestException(ResponseStauses.TransportTypeNotfound);
        } else if (err.message.includes('TransportKind')) {
          throw new BadRequestException(ResponseStauses.TransportKindNotfound);
        } else if (err.message.includes('CargoTyepe')) {
          throw new BadRequestException(ResponseStauses.CargoTypeNotFound);
        } else if (err.message.includes('CargoLoadMethod')) {
          throw new BadRequestException(ResponseStauses.CargoLoadingMethodNotFound);
        } else if (err.message.includes('CargoPackage')) {
          throw new BadRequestException(ResponseStauses.CargoPackageNotFound);
        }
      } else {
        throw new InternalErrorException(ResponseStauses.CreateDataFailed);
      }
    }
  }

  async updateOrder(updateOrderDto: OrderDto): Promise<BpmResponse> {
    try {
      if(!updateOrderDto.id) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const order: Order = await this.ordersRepository.findOneOrFail({ where: { id: updateOrderDto.id, deleted: false } })
 
      if(updateOrderDto.clientId && !isNaN(updateOrderDto.clientId)) {
        order.client = await this.clientsRepository.findOneOrFail({ where: { id: updateOrderDto.clientId } });
      } else if (updateOrderDto.merchantId && !isNaN(updateOrderDto.merchantId)) {
        order.clientMerchant = await this.clientMerchantsRepository.findOneOrFail({ where: { id: updateOrderDto.merchantId } });
      } else {
        throw new BadRequestException(ResponseStauses.ClientIdOrMerchantIdIsRequired)
      }

      if(updateOrderDto.additionalClientId) {
        order.additionalClient = await this.clientsRepository.findOneOrFail({ where: { id: updateOrderDto.additionalClientId } });
      }
      if(updateOrderDto.offeredPriceCurrencyId) {
        order.offeredPriceCurrency = await this.curreniesRepository.findOneOrFail({ where: { id: updateOrderDto.offeredPriceCurrencyId } });
      }
      if(updateOrderDto.inAdvancePriceCurrencyId) {
        order.inAdvancePriceCurrency = await this.curreniesRepository.findOneOrFail({ where: { id: updateOrderDto.inAdvancePriceCurrencyId } });
      }
      if(updateOrderDto.cargoTypeId) {
        order.cargoType = await this.cargoTyepesRepository.findOneOrFail({ where: { id: updateOrderDto.cargoTypeId } });
      }
      if(updateOrderDto.loadingMethodId) {
        order.loadingMethod = await this.cargoLoadingMethodsRepository.findOneOrFail({ where: { id: updateOrderDto.loadingMethodId } });
      }
      if(updateOrderDto.cargoPackageId) {
        order.cargoPackage = await this.cargoPackagesRepository.findOneOrFail({ where: { id: updateOrderDto.cargoPackageId } });
      }
      if(updateOrderDto.transportTypeIds) {
        order.transportTypes = await this.transportTypesRepository.find({ where: { id: In(updateOrderDto.transportTypeIds) } });
      }
      if(updateOrderDto.transportKindIds) {
        order.transportKinds = await this.transportKindsRepository.find({ where: { id: In(updateOrderDto.transportKindIds) } });
      }
  
      const cargoStatus: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Waiting } });
      order.cargoStatus = cargoStatus;
      order.loadingLocation =  await this.locationsRepository.save({ name: updateOrderDto.loadingLocation.name, latitude: updateOrderDto.loadingLocation.latitude, longitude: updateOrderDto.loadingLocation.longitude })
      order.deliveryLocation = await this.locationsRepository.save({ name: updateOrderDto.deliveryLocation.name, latitude: updateOrderDto.deliveryLocation.latitude, longitude: updateOrderDto.deliveryLocation.longitude });
      if(updateOrderDto.customsPlaceLocation) {
        order.customsPlaceLocation = await this.locationsRepository.save({ name: updateOrderDto.customsPlaceLocation.name, latitude: updateOrderDto.customsPlaceLocation.latitude, longitude: updateOrderDto.customsPlaceLocation.longitude });
      }
      if(updateOrderDto.customsClearancePlaceLocation) {
        order.customsClearancePlaceLocation = await this.locationsRepository.save({ name: updateOrderDto.customsClearancePlaceLocation.name, latitude: updateOrderDto.customsClearancePlaceLocation.latitude, longitude: updateOrderDto.customsClearancePlaceLocation.longitude });
      }
      if(updateOrderDto.additionalLoadingLocation) {
        order.additionalLoadingLocation = await this.locationsRepository.save({ name: updateOrderDto.additionalLoadingLocation.name, latitude: updateOrderDto.additionalLoadingLocation.latitude, longitude: updateOrderDto.additionalLoadingLocation.longitude });
      } 
      if(updateOrderDto.additionalDeliveryLocation) { 
        order.additionalDeliveryLocation = await this.locationsRepository.save({ name: updateOrderDto.additionalDeliveryLocation.name, latitude: updateOrderDto.additionalDeliveryLocation.latitude, longitude: updateOrderDto.additionalDeliveryLocation.longitude });;
      }
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

      const res: any = await this.ordersRepository.save(order);
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      console.log(err)
      if (err instanceof HttpException) {
        throw err
      } else if (err.name == 'EntityNotFoundError') {
        if (err.message.includes('Order')) {
          throw new BadRequestException(ResponseStauses.OrderNotFound);
        } else if (err.message.includes('ClientMerchant')) {
          throw new BadRequestException(ResponseStauses.UserNotFound);
        } else if (err.message.includes('Currency')) {
          throw new BadRequestException(ResponseStauses.CurrencyNotFound);
        } else if (err.message.includes('TransportType')) {
          throw new BadRequestException(ResponseStauses.TransportTypeNotfound);
        } else if (err.message.includes('TransportKind')) {
          throw new BadRequestException(ResponseStauses.TransportKindNotfound);
        } else if (err.message.includes('CargoTyepe')) {
          throw new BadRequestException(ResponseStauses.CargoTypeNotFound);
        } else if (err.message.includes('CargoLoadMethod')) {
          throw new BadRequestException(ResponseStauses.CargoLoadingMethodNotFound);
        } else if (err.message.includes('CargoPackage')) {
          throw new BadRequestException(ResponseStauses.CargoPackageNotFound);
        }
      } else {
        throw new InternalErrorException(ResponseStauses.CreateDataFailed);
      }
    }
  }
 
  async getOrderById(id: number): Promise<BpmResponse> {
    try {
      if (!id) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const order = await this.ordersRepository.findOneOrFail({ where: { id, deleted: false }, 
        relations: ['loadingLocation', 'deliveryLocation', 'customsPlaceLocation', 'customsClearancePlaceLocation',
        'additionalLoadingLocation',
        'additionalDeliveryLocation', 'clientMerchant', 'client', 'driverOffers', 'driverOffers.driver', 'driverOffers.driver.phoneNumbers', 'additionalClient', 'inAdvancePriceCurrency', 'offeredPriceCurrency', 'cargoType', 'cargoPackage', 'transportTypes', 'loadingMethod', 'transportKinds'] });
      return new BpmResponse(true, order, null);
    } catch (err: any) {
      console.log(err)
      if(err instanceof HttpException) {
        throw err
      } else if (err.name == 'EntityNotFoundError') {
        throw new NoContentException();
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async getOrders(sortBy: string, sortType: string, pageIndex: string, pageSize: string, userId: number, orderId: number, statusId: string, loadingLocation: string, 
    deliveryLocation: string, transportKindId: string, transportTypeId: string, createdAt: string, sendDate: string, merchantOrder: boolean): Promise<BpmResponse> {
    try {
        const size = +pageSize || 10; // Number of items per page
        const index = +pageIndex || 1
     
        const sort: any = {};
        if(sortBy && sortType) {
          sort[sortBy] = sortType; 
        } else {
          sort['id'] = 'DESC'
        }

      const filter: any = { deleted: false };
      if(userId) {
        filter.createdBy = { id: userId }
      }
      if(transportTypeId) {
        filter.transportTypes = { id: transportTypeId }
      }
      if(orderId) {
        filter.id = orderId;
      }
      if(transportKindId) {
        filter.transportKinds = { id: transportKindId }
      }
      if(statusId) {
        const status: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { id: statusId } });
        if(status.code == CargoStatusCodes.Closed)  {
          filter.cargoStatus = { code: In([CargoStatusCodes.Closed, CargoStatusCodes.Canceled]) };
        } else {
          filter.cargoStatus = { code: status.code };
        }
      }
      if(loadingLocation) {
        filter.loadingLocation = { name: loadingLocation }
      }
      if(deliveryLocation) {
        filter.deliveryLocation = { name: deliveryLocation }
      }
      if(createdAt) {
        filter.createdAt = createdAt
      }
      if(sendDate) {
        filter.sendDate = sendDate
      }
      if(merchantOrder) [
        filter.isClientMerchant = merchantOrder
      ] 

      const orders = await this.ordersRepository.find({ 
        order: sort, 
        where: filter, 
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size,  
        relations: [
          'loadingLocation', 'deliveryLocation', 'customsPlaceLocation', 'customsClearancePlaceLocation',
        'additionalLoadingLocation',
        'additionalDeliveryLocation', 'clientMerchant', 'inAdvancePriceCurrency', 'offeredPriceCurrency', 
        'cargoType', 'cargoStatus', 
        'driverOffers', 'driverOffers.driver', 'driverOffers.driver.phoneNumbers', 'cargoPackage', 'transportTypes', 'loadingMethod', 'transportKinds', 'client', 'driver'] });
        if(orders.length) {
        const ordersCount = await this.ordersRepository.count({ where: filter });
        const totalPagesCount = Math.ceil(ordersCount / size);

        return new BpmResponse(true, { content: orders, totalPagesCount: totalPagesCount, pageIndex: index, pageSize: size }, null);
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
      if(user.userType == UserTypes.Staff) {
        const cargoStatus: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Canceled } });
        const res = await this.ordersRepository.update({ id }, { cargoStatus: cargoStatus })
        if(res.affected) {
          return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCanceled]);
        } else {
          throw new InternalErrorException(ResponseStauses.CancelDataFailed)
        }
      } else {
        throw new UnauthorizedException('permissionDenied')
      }
    } catch (err: any) {
      if (err.name == 'EntityNotFoundError') {
        throw new BadRequestException(ResponseStauses.NotFound);
      } else {
        throw new InternalErrorException(ResponseStauses.UpdateDataFailed);
      }
    }
  }

  async appendOrderoDriver(appendOrderDto: AppendOrderDto, user: User): Promise<BpmResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const isDriverBusy: boolean = await this.orderOffersRepository.exists({ where: { driver: { id: appendOrderDto.driverId }, accepted: true } });
      if (isDriverBusy) {
        throw new BadRequestException(ResponseStauses.DriverHasOrder)
      }
  
      const driver: Driver = await this.driversRepository.findOneOrFail({ where: { id: appendOrderDto.driverId }, relations: ['user'] });

      if(driver.deleted) {
        throw new BadRequestException(ResponseStauses.DriverArchived)
      }

      if(driver.blocked) {
        throw new BadRequestException(ResponseStauses.DriverBlocked)
      } 

      const order: Order = await this.ordersRepository.findOneOrFail({ where: { id: appendOrderDto.orderId }, relations: ['client'] });
      const currency: Currency = await this.curreniesRepository.findOneOrFail({ where: { id: appendOrderDto.currencyId } });
      const cargoStatus: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Accepted } });

      const offer = new OrderOffer();

      offer.amount = appendOrderDto.amount;
      offer.accepted = true;
      offer.createdBy = user;
      offer.order = order;
      offer.driver = driver;
      offer.currency = currency;

      await queryRunner.manager.save(OrderOffer, offer);

      order.cargoStatus = cargoStatus;
      await queryRunner.manager.save(Order, order);

      await this.rmqService.sendAdminAppendOrderToClient({ userId: order.client?.id, orderId: offer.order.id });
      await this.rmqService.sendAdminAppendOrderToDriver({ userId: driver.user?.id, orderId: offer.order.id });
      await queryRunner.commitTransaction();
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      console.log(err)
      await queryRunner.rollbackTransaction();
      if (err instanceof HttpException) {
        throw err
      } else if (err.name == 'EntityNotFoundError') {
        throw new BadRequestException(ResponseStauses.NotFound);
      } else {
        throw new InternalErrorException(ResponseStauses.UpdateDataFailed);
      }
    } finally {
      await queryRunner.release();
    }
  }
}