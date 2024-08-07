import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UsersRoleNames, BpmResponse, CargoLoadMethod, Order, CargoPackage, CargoStatus, CargoStatusCodes, CargoType, Currency, ResponseStauses, TransportKind, TransportType, BadRequestException, InternalErrorException, OrderDto, ClientMerchant, NoContentException, User, UserTypes, Client, ClientMerchantUser, OrderOffer, OrderOfferDto, Driver, LocationPlace } from '..';
import { RabbitMQSenderService } from '../services/rabbitmq-sender.service';
import { create } from 'domain';

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
    @InjectRepository(LocationPlace) private readonly locationsRepository: Repository<LocationPlace>,
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
      if(createOrderDto.isHighCube) {
        order.isHighCube = createOrderDto.isHighCube;
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
      if(updateOrderDto.isHighCube) {
        order.isHighCube = updateOrderDto.isHighCube;
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
      const order = await this.ordersRepository.findOneOrFail({ where: { id, deleted: false },
         relations: ['loadingLocation', 'deliveryLocation', 'customsPlaceLocation', 'customsClearancePlaceLocation',
        'additionalLoadingLocation',
        'additionalDeliveryLocation', 'driverOffers.currency', 'driverOffers', 'driverOffers.createdBy', 'driverOffers.driver', 'driverOffers.driver.phoneNumbers', 'cargoStatus', 'clientMerchant', 'inAdvancePriceCurrency', 'offeredPriceCurrency', 'cargoType', 'cargoPackage', 'transportTypes', 'loadingMethod', 'transportKinds'] });
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

  async getClientOrderByUserId(user: User, sortBy: string, sortType: string, pageIndex: string, pageSize: string, userId: number, orderId: number, statusId: string, loadingLocation: string, deliveryLocation: string, transportKindId: string, transportTypeId: string, createdAt: string, sendDate: string): Promise<BpmResponse> {
    try {
      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 1
      if (!user) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const filter: any = { deleted: false };
      const sort: any = {};
      if(sortBy && sortType) {
        sort[sortBy] = sortType; 
      } else {
        sort['id'] = 'DESC'
      }

      // managing access to orders according to userType
      if (user.userType == UserTypes.ClientMerchantUser) {
      
        // check if requesting user is Super admin then give merchant's all orders
        // if it is not give orders only ones created by him

        if( user.role.name == UsersRoleNames.SuperAdmin) {
          filter.clientMerchant = { id: user.clientMerchantUser.clientMerchant?.id }; 
        } else {
          filter.createdBy = user.id;
        }
      } else if(user.userType == UserTypes.Staff || user.userType == UserTypes.Client) {
        filter.createdBy = { id: userId }
      } else {
        throw new BadRequestException(ResponseStauses.AccessDenied);
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
      const orders = await this.ordersRepository.find({ 
        order: sort, 
        where: filter,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size, 
        relations: ['loadingLocation', 'deliveryLocation', 'customsPlaceLocation', 'customsClearancePlaceLocation',
        'additionalLoadingLocation',
        'additionalDeliveryLocation', 'driverOffers', 'driverOffers.currency', 'driverOffers.createdBy', 'driverOffers.driver', 'driverOffers.driver.phoneNumbers', 'clientMerchant', 'inAdvancePriceCurrency', 'offeredPriceCurrency', 'cargoType', 'cargoStatus', 'cargoPackage', 'transportTypes', 'loadingMethod', 'transportKinds'] });
        
        const ordersCount = await this.ordersRepository.count({ where : filter });
        const totalPagesCount = Math.ceil(ordersCount / size);

        if(orders.length) {
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

  async getClientArchiveOrderByUserId(user: User, sortBy: string, sortType: string, pageIndex: string, pageSize: string, userId: number, orderId: number, loadingLocationId: string, deliveryLocationId: string, transportKindId: string, transportTypeId: string, createdAt: string, sendDate: string): Promise<BpmResponse> {
    try {
      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 1
      if (!user) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const filter: any = { deleted: false };
      if(!sortBy) {
        sortBy = 'id';
      } 
      if(!sortType) {
        sortType = 'DESC'
      }

      // managing access to orders according to userType
      if (user.userType == UserTypes.ClientMerchantUser) {
      
        // check if requesting user is Super admin then give merchant's all orders
        // if it is not give orders only ones created by him

        if( user.role.name == UsersRoleNames.SuperAdmin) {
          filter.clientMerchant = { id: user.clientMerchantUser.clientMerchant?.id }; 
        } else {
          filter.createdBy = user.id;
        }
      } else if(user.userType == UserTypes.Staff || user.userType == UserTypes.Client) {
        filter.createdBy = { id: userId }
      } else {
        throw new BadRequestException(ResponseStauses.AccessDenied);
      }

      if(transportTypeId) {
        filter.transportType = { id: transportTypeId }
      }
      if(orderId) {
        filter.id = orderId;
      }
      if(transportKindId) {
        filter.transportKind = { id: transportKindId }
      }
      if(loadingLocationId) {
        filter.loadingLocation = { id: loadingLocationId }
      }
      if(deliveryLocationId) {
        filter.deliveryLocation = { id: deliveryLocationId }
      }
      if(createdAt) {
        filter.createdAt = createdAt
      }
      if(sendDate) {
        filter.sendDate = sendDate
      }
      // const orders = await this.ordersRepository.find({ 
      //   order: sort, 
      //   where: filter,
      //   skip: (index - 1) * size, // Skip the number of items based on the page number
      //   take: size, 
      //   relations: ['loadingLocation', 'deliveryLocation', 'customsPlaceLocation', 'customsClearancePlaceLocation',
      //   'additionalLoadingLocation',
      //   'additionalDeliveryLocation', 'driverOffers', 'driverOffers.currency', 'driverOffers.createdBy', 'driverOffers.driver', 'driverOffers.driver.phoneNumbers', 'clientMerchant', 'inAdvancePriceCurrency', 'offeredPriceCurrency', 'cargoType', 'cargoStatus', 'cargoPackage', 'transportTypes', 'loadingMethod', 'transportKinds'] });
        

        const orders = await this.ordersRepository.createQueryBuilder("order")
        .leftJoinAndSelect("order.driverOffers", "driverOffer")
        .leftJoinAndSelect("driverOffer.driver", "driver")
        .leftJoinAndSelect("driverOffer.currency", "currency")
        .leftJoin("driverOffer.createdBy", "offerCreatedBy")
        .addSelect('offerCreatedBy.id')
        .addSelect('offerCreatedBy.userType')
        .addSelect('offerCreatedBy.lastLogin')
        .leftJoinAndSelect("driver.phoneNumbers", "phoneNumbers")
        .leftJoinAndSelect("order.loadingLocation", "loadingLocation")
        .leftJoinAndSelect("order.deliveryLocation", "deliveryLocation")
        .leftJoinAndSelect("order.customsPlaceLocation", "customsPlaceLocation")
        .leftJoinAndSelect("order.customsClearancePlaceLocation", "customsClearancePlaceLocation")
        .leftJoinAndSelect("order.additionalLoadingLocation", "additionalLoadingLocation")
        .leftJoinAndSelect("order.additionalDeliveryLocation", "additionalDeliveryLocation")
        .leftJoinAndSelect("order.clientMerchant", "clientMerchant")
        .leftJoinAndSelect("order.inAdvancePriceCurrency", "inAdvancePriceCurrency")
        .leftJoinAndSelect("order.offeredPriceCurrency", "offeredPriceCurrency")
        .leftJoinAndSelect("order.cargoType", "cargoType")
        .leftJoinAndSelect("order.cargoStatus", "cargoStatus")
        .leftJoinAndSelect("order.cargoPackage", "cargoPackage") 
        .leftJoinAndSelect("order.transportTypes", "transportTypes")
        .leftJoinAndSelect("order.loadingMethod", "cargoLoadMethod")
        .leftJoinAndSelect("order.transportKinds", "transportKinds")
        .where("order.deleted = :deleted", { deleted: false })
        .andWhere("driverOffer.driver.id = :driverId", { driverId: 0 })
        .andWhere("driverOffer.accepted = :accepted", { accepted: true })
        .andWhere(`CASE 
               WHEN order.is_safe_transaction THEN cargoStatus.code = :closed 
               ELSE cargoStatus.code = :completed 
               END `, {
          completed: CargoStatusCodes.Completed,
          closed: CargoStatusCodes.Closed
        })
        .skip((index - 1) * size) // Skip the number of items based on the page number
        .take(size)
        .orderBy(sortBy, sortType?.toString().toUpperCase() == 'ASC' ? 'ASC' : 'DESC')
        .getMany();


        const ordersCount = await this.ordersRepository.count({ where : filter });
        const totalPagesCount = Math.ceil(ordersCount / size);

        if(orders.length) {
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

      const isDriverArchived: boolean = await this.driversRepository.exists({ where: { id: offerDto.driverId, deleted: true} });
      if(isDriverArchived) {
        throw new BadRequestException(ResponseStauses.DriverArchived)
      }

      const isDriverBlocked: boolean = await this.driversRepository.exists({ where: { id: offerDto.driverId, deleted: true} });
      if(isDriverBlocked) {
        throw new BadRequestException(ResponseStauses.DriverBlocked)
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
      await this.orderOffersRepository.update({order: { id: order.id }, driver: { id: driver.id }}, { rejected: true })

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