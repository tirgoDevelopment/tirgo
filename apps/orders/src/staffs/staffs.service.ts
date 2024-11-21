import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { UsersRoleNames, BpmResponse, CargoLoadMethod, Order, CargoPackage, CargoStatus, CargoStatusCodes, CargoType, Currency, ResponseStauses, TransportKind, TransportType, BadRequestException, InternalErrorException, OrderDto, ClientMerchant, NoContentException, User, UserTypes, Client, LocationPlace, AppendOrderDto, DriverOrderOffers, Driver, AdminOrderDto } from '..';
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
    @InjectRepository(DriverOrderOffers) private readonly orderOffersRepository: Repository<DriverOrderOffers>,
    @InjectRepository(Driver) private readonly driversRepository: Repository<Driver>,
    private rmqService: RabbitMQSenderService,
    private dataSource: DataSource
  ) { }

  async createOrder(dto: AdminOrderDto, user: User): Promise<BpmResponse> {
      const queryRunner = this.ordersRepository.manager.connection.createQueryRunner();
      queryRunner.connect();
      try {
        queryRunner.startTransaction();
        
        const order: Order = new Order();
        order.client = await this.clientsRepository.findOneOrFail({ where: { id: dto.clientId } });
        order.transportKinds = await this.transportKindsRepository.find({ where: { id: In(dto.transportKindIds) } });
        order.transportType = await this.transportTypesRepository.findOneOrFail({ where: { id: dto.transportTypeId } });
        order.cargoType = await this.cargoTyepesRepository.findOneOrFail({ where: { id: dto.cargoTypeId } });
        order.cargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Waiting } });
        
        if(dto.additionalClientId) {
          const additionalCLient: Client = await this.clientsRepository.findOneOrFail({ where: { id: dto.additionalClientId } });
          order.additionalClient = additionalCLient;
        }
        if(dto.offeredPriceCurrencyId) {
          const offeredCurrency: Currency = await this.curreniesRepository.findOneOrFail({ where: { id: dto.offeredPriceCurrencyId } });
          order.offeredPriceCurrency = offeredCurrency;
        }
        if(dto.cargoLoadMethodIds) {
          const asd =await this.cargoLoadingMethodsRepository.find({ where: { id: In(dto.cargoLoadMethodIds) } });
          order.cargoLoadMethods =  asd;
        }
        if(dto.customsOutClearanceLocation) {
          order.customsOutClearanceLocation = await this.locationsRepository.save({ name: dto.customsOutClearanceLocation.name, latitude: dto.customsOutClearanceLocation.latitude, longitude: dto.customsOutClearanceLocation.longitude });
        }
        if(dto.customsInClearanceLocation) {
          order.customsInClearanceLocation = await this.locationsRepository.save({ name: dto.customsInClearanceLocation.name, latitude: dto.customsInClearanceLocation.latitude, longitude: dto.customsInClearanceLocation.longitude });
        }
        if(dto.additionalLoadingLocation) {
          order.additionalLoadingLocation = await this.locationsRepository.save({ name: dto.additionalLoadingLocation.name, latitude: dto.additionalLoadingLocation.latitude, longitude: dto.additionalLoadingLocation.longitude });
        } 
        if(dto.additionalDeliveryLocation) { 
          order.additionalDeliveryLocation = await this.locationsRepository.save({ name: dto.additionalDeliveryLocation.name, latitude: dto.additionalDeliveryLocation.latitude, longitude: dto.additionalDeliveryLocation.longitude });;
        }
        order.loadingLocation =  await queryRunner.manager.save(LocationPlace, { name: dto.loadingLocation.name, latitude: dto.loadingLocation.latitude, longitude: dto.loadingLocation.longitude })
        order.deliveryLocation = await queryRunner.manager.save(LocationPlace, { name: dto.deliveryLocation.name, latitude: dto.deliveryLocation.latitude, longitude: dto.deliveryLocation.longitude });
        order.isAdr = dto.isAdr;
        order.offeredPrice = dto.offeredPrice;
        order.isCashlessPayment = dto.isCashlessPayment;
        order.sendDate = dto.sendDate;
        order.isSecureTransaction = dto.isSecureTransaction;
        order.cargoWeight = dto.cargoWeight;
        order.cargoDimension = dto.cargoDimension;
        order.isBorderCrossing = dto.isBorderCrossing;
        order.isRefrigerator = dto.isRefrigerator;
        order.refrigeratorFromCount = dto.refrigeratorFromCount;
        order.refrigeratorToCount = dto.refrigeratorToCount;
        order.isHook = dto.isHook;
        order.cisternVolume = dto.cisternVolume;
        order.loadCapacity = dto.loadCapacity;
        order.createdBy = user;
  
        await queryRunner.manager.save(Order, order);
        await queryRunner.commitTransaction();
        return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
      } catch (err: any) {
        console.log(err)
        await queryRunner.rollbackTransaction();
        if (err.name == 'EntityNotFoundError') {
          if (err.message.includes('Client')) {
            throw new BadRequestException(ResponseStauses.UserNotFound);
          } else if (err.message.includes('Currency')) {
            throw new BadRequestException(ResponseStauses.CurrencyNotFound);
          } else if (err.message.includes('Currency')) {
            throw new BadRequestException(ResponseStauses.TransportTypeNotfound);
          } else if (err.message.includes('TransportKind')) {
            throw new BadRequestException(ResponseStauses.TransportKindNotfound);
          } else if (err.message.includes('TransportType')) {
            throw new BadRequestException(ResponseStauses.TransportTypeNotfound);
          } else if (err.message.includes('CargoTyepe')) {
            throw new BadRequestException(ResponseStauses.CargoTypeNotFound);
          } else if (err.message.includes('CargoLoadMethod')) {
            throw new BadRequestException(ResponseStauses.CargoLoadingMethodNotFound);
          } else if (err.message.includes('CargoType')) {
            throw new BadRequestException(ResponseStauses.CargoTypeNotFound);
          } else if (err.message.includes('CargoStatus')) {
            throw new BadRequestException(ResponseStauses.CargoStatusNotFound);
          }
        } else {
          throw new InternalErrorException(ResponseStauses.CreateDataFailed);
        }
      } finally {
        await queryRunner.release();
      }
    }

  async updateOrder(id: number, dto: AdminOrderDto): Promise<BpmResponse> {
    const queryRunner = this.ordersRepository.manager.connection.createQueryRunner();
      queryRunner.connect();
      try {
        queryRunner.startTransaction();
        
        const order: Order = await queryRunner.manager.findOneOrFail(Order, { where: { id } });
        order.client = await this.clientsRepository.findOneOrFail({ where: { id: dto.clientId } });
        order.transportKinds = await this.transportKindsRepository.find({ where: { id: In(dto.transportKindIds) } });
        order.transportType = await this.transportTypesRepository.findOneOrFail({ where: { id: dto.transportTypeId } });
        order.cargoType = await this.cargoTyepesRepository.findOneOrFail({ where: { id: dto.cargoTypeId } });
        order.cargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Waiting } });
        
        if(dto.additionalClientId) {
          const additionalCLient: Client = await this.clientsRepository.findOneOrFail({ where: { id: dto.additionalClientId } });
          order.additionalClient = additionalCLient;
        }
        if(dto.offeredPriceCurrencyId) {
          const offeredCurrency: Currency = await this.curreniesRepository.findOneOrFail({ where: { id: dto.offeredPriceCurrencyId } });
          order.offeredPriceCurrency = offeredCurrency;
        }
        if(dto.cargoLoadMethodIds) {
          order.cargoLoadMethods = await this.cargoLoadingMethodsRepository.find({ where: { id: In(dto.cargoLoadMethodIds) } });
        }
        if(dto.customsOutClearanceLocation) {
          order.customsOutClearanceLocation = await this.locationsRepository.save({ name: dto.customsOutClearanceLocation.name, latitude: dto.customsOutClearanceLocation.latitude, longitude: dto.customsOutClearanceLocation.longitude });
        }
        if(dto.customsInClearanceLocation) {
          order.customsInClearanceLocation = await this.locationsRepository.save({ name: dto.customsInClearanceLocation.name, latitude: dto.customsInClearanceLocation.latitude, longitude: dto.customsInClearanceLocation.longitude });
        }
        if(dto.additionalLoadingLocation) {
          order.additionalLoadingLocation = await this.locationsRepository.save({ name: dto.additionalLoadingLocation.name, latitude: dto.additionalLoadingLocation.latitude, longitude: dto.additionalLoadingLocation.longitude });
        } 
        if(dto.additionalDeliveryLocation) { 
          order.additionalDeliveryLocation = await this.locationsRepository.save({ name: dto.additionalDeliveryLocation.name, latitude: dto.additionalDeliveryLocation.latitude, longitude: dto.additionalDeliveryLocation.longitude });;
        }
  
        order.loadingLocation =  await queryRunner.manager.save(LocationPlace, { name: dto.loadingLocation.name, latitude: dto.loadingLocation.latitude, longitude: dto.loadingLocation.longitude })
        order.deliveryLocation = await queryRunner.manager.save(LocationPlace, { name: dto.deliveryLocation.name, latitude: dto.deliveryLocation.latitude, longitude: dto.deliveryLocation.longitude });
        order.isAdr = dto.isAdr;
        order.offeredPrice = dto.offeredPrice;
        order.isCashlessPayment = dto.isCashlessPayment;
        order.sendDate = dto.sendDate;
        order.isSecureTransaction = dto.isSecureTransaction;
        order.cargoWeight = dto.cargoWeight;
        order.cargoDimension = dto.cargoDimension;
        order.isBorderCrossing = dto.isBorderCrossing;
        order.isRefrigerator = dto.isRefrigerator;
        order.refrigeratorFromCount = dto.refrigeratorFromCount;
        order.refrigeratorToCount = dto.refrigeratorToCount;
        order.isHook = dto.isHook;
        order.cisternVolume = dto.cisternVolume;
        order.loadCapacity = dto.loadCapacity;
  
        await queryRunner.manager.save(Order, order);
        await queryRunner.commitTransaction();
        return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
      } catch (err: any) {
        await queryRunner.rollbackTransaction();
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
      } finally {
        await queryRunner.release();
      }
  }
 
  async getOrderById(id: number): Promise<BpmResponse> {
    try {
      if (!id) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const order = await this.ordersRepository.findOneOrFail({ where: { id, isDeleted: false }, 
        relations: ['loadingLocation', 'deliveryLocation', 'customsOutClearanceLocation', 'customsInClearanceLocation',
        'additionalLoadingLocation', 'driverOrderOffers', 'driverOrderOffers.order', 'driverOrderOffers.driver', 'driverOrderOffers.clientReplyOrderOffer',
        'additionalDeliveryLocation', 'client', 
        'offeredPriceCurrency', 'cargoType', 'transportType', 'cargoLoadMethods', 'transportKinds'] });
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

  async getOrders(query: any): Promise<BpmResponse> {
    try {
        const size = +query.pageSize || 10; // Number of items per page
        const index = +query.pageIndex || 1
     
        const sort: any = {};
        if(query.sortBy && query.sortType) {
          sort[query.sortBy] = query.sortType; 
        } else {
          sort['id'] = 'DESC'
        }

      const filter: any = { isDeleted: false };
      if(query.userId) {
        filter.createdBy = { id: query.userId }
      }
      if(query.transportTypeId) {
        filter.transportTypes = { id: query.transportTypeId }
      }
      if(query.orderId) {
        filter.id = query.orderId;
      }
      if(query.transportKindId) {
        filter.transportKinds = { id: query.transportKindId }
      }
      if(query.statusId) {
        const status: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { id: query.statusId } });
        if(status.code == CargoStatusCodes.Closed)  {
          filter.cargoStatus = { code: In([CargoStatusCodes.Closed, CargoStatusCodes.Canceled]) };
        } else {
          filter.cargoStatus = { code: status.code };
        }
      }
      if(query.loadingLocation) {
        filter.loadingLocation = { name: query.loadingLocation }
      }
      if(query.deliveryLocation) {
        filter.deliveryLocation = { name: query.deliveryLocation }
      }
      if(query.createdAt) {
        filter.createdAt = query.createdAt
      }
      if(query.sendDate) {
        filter.sendDate = query.sendDate
      }

      const orders = await this.ordersRepository.find({ 
        order: sort, 
        where: filter, 
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size,  
        relations: [
          'loadingLocation', 'deliveryLocation', 'additionalLoadingLocation', 'additionalDeliveryLocation', 'customsOutClearanceLocation', 'customsInClearanceLocation', 'offeredPriceCurrency', 
        'cargoType', 'cargoStatus', 'transportType', 'cargoLoadMethods', 'transportKinds', 'client',
      'driverOrderOffers', 'driverOrderOffers.order', 'driverOrderOffers.driver', 'driverOrderOffers.clientReplyOrderOffer'] });
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
      const order: Order = await this.ordersRepository.findOneOrFail({where: { id, isDeleted: false }, relations: ['cargoStatus']});
      switch (order.cargoStatus.code) {
        case CargoStatusCodes.Canceled:
          throw new BadRequestException(ResponseStauses.AlreadyCanceled)

        case CargoStatusCodes.Closed:
          throw new BadRequestException(ResponseStauses.OrderIsClosed)
      }
      const cargoStatus: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Canceled } });
      order.cargoStatus = cargoStatus;
      await this.ordersRepository.save(order);
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCanceled]);
    } catch (err: any) {
      console.log(err)
      if (err instanceof HttpException) {
        throw err
      } else if (err.name == 'EntityNotFoundError') {
        throw new BadRequestException(ResponseStauses.NotFound);
      } else {
        throw new InternalErrorException(ResponseStauses.UpdateDataFailed);
      }
    }
  }

  // async appendOrderoDriver(appendOrderDto: AppendOrderDto, user: User): Promise<BpmResponse> {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   try {
  //     await queryRunner.startTransaction();
  //     const isDriverBusy: boolean = await this.orderOffersRepository.exists({ where: { driver: { id: appendOrderDto.driverId }, accepted: true } });
  //     if (isDriverBusy) {
  //       throw new BadRequestException(ResponseStauses.DriverHasOrder)
  //     }
  
  //     const driver: Driver = await this.driversRepository.findOneOrFail({ where: { id: appendOrderDto.driverId }, relations: ['user'] });

  //     if(driver.deleted) {
  //       throw new BadRequestException(ResponseStauses.DriverArchived)
  //     }

  //     if(driver.blocked) {
  //       throw new BadRequestException(ResponseStauses.DriverBlocked)
  //     } 

  //     const order: Order = await this.ordersRepository.findOneOrFail({ where: { id: appendOrderDto.orderId }, relations: ['client'] });
  //     const currency: Currency = await this.curreniesRepository.findOneOrFail({ where: { id: appendOrderDto.currencyId } });
  //     const cargoStatus: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Accepted } });

  //     const offer = new DriverOrderOffers();

  //     offer.amount = appendOrderDto.amount;
  //     offer.accepted = true;
  //     offer.createdBy = user;
  //     offer.order = order;
  //     offer.driver = driver;
  //     offer.currency = currency;

  //     await queryRunner.manager.save(DriverOrderOffers, offer);

  //     order.cargoStatus = cargoStatus;
  //     await queryRunner.manager.save(Order, order);

  //     await this.rmqService.sendAdminAppendOrderToClient({ userId: order.client?.id, orderId: offer.order.id });
  //     await this.rmqService.sendAdminAppendOrderToDriver({ userId: driver.user?.id, orderId: offer.order.id });
  //     await queryRunner.commitTransaction();
  //     return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
  //   } catch (err: any) {
  //     console.log(err)
  //     await queryRunner.rollbackTransaction();
  //     if (err instanceof HttpException) {
  //       throw err
  //     } else if (err.name == 'EntityNotFoundError') {
  //       throw new BadRequestException(ResponseStauses.NotFound);
  //     } else {
  //       throw new InternalErrorException(ResponseStauses.UpdateDataFailed);
  //     }
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }
}