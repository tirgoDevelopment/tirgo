import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { UsersRoleNames, BpmResponse, CargoLoadMethod, Order, CargoPackage, ClientRepliesOrderOffer, CargoStatus, CargoStatusCodes, CargoType, Currency, ResponseStauses, TransportKind, TransportType, BadRequestException, InternalErrorException, OrderDto, ClientMerchant, NoContentException, User, UserTypes, Client, ClientMerchantUser, DriverOrderOffers, OrderOfferDto, Driver, LocationPlace, RejectOfferDto, OrderQueryDto, ReplyDriverOrderOfferDto } from '..';
import { RabbitMQSenderService } from '../services/rabbitmq-sender.service';
import { CancelOfferDto } from '@app/shared-modules/entites/orders/dtos/cancel-offer.dto';

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
    @InjectRepository(CargoLoadMethod) private readonly cargoLoadingMethodsRepository: Repository<CargoLoadMethod>,
    @InjectRepository(DriverOrderOffers) private readonly orderOffersRepository: Repository<DriverOrderOffers>,
    @InjectRepository(ClientRepliesOrderOffer) private readonly clientReplyOrderOfferRepository: Repository<ClientRepliesOrderOffer>,
    @InjectRepository(LocationPlace) private readonly locationsRepository: Repository<LocationPlace>,
    private rmqService: RabbitMQSenderService
  ) { }

  async createOrder(dto: OrderDto, user: User): Promise<BpmResponse> {
    const queryRunner = this.ordersRepository.manager.connection.createQueryRunner();
    queryRunner.connect();
    try {
      queryRunner.startTransaction();

      const order: Order = new Order();

      if(dto.additionalClientId) {
        const additionalCLient: Client = await this.clientsRepository.findOneOrFail({ where: { id: dto.additionalClientId } });
        order.additionalClient = additionalCLient;
      }
      order.client = user.client;
      order.transportKinds = await this.transportKindsRepository.find({ where: { id: In(dto.transportKindIds) } });
      order.transportType = await this.transportTypesRepository.findOneOrFail({ where: { id: dto.transportTypeId } });
      order.cargoType = await this.cargoTyepesRepository.findOneOrFail({ where: { id: dto.cargoTypeId } });
      order.cargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Waiting } });
      
      if(dto.offeredPriceCurrencyId) {
        const offeredCurrency: Currency = await this.curreniesRepository.findOneOrFail({ where: { id: dto.offeredPriceCurrencyId } });
        order.offeredPriceCurrency = offeredCurrency;
      }
      if(dto.cargoLoadMethodIds) {
        order.cargoLoadMethods = await this.cargoLoadingMethodsRepository.find({ where: { id: In(dto.cargoLoadMethodIds) } });
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
      await queryRunner.rollbackTransaction();
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        if (err.message.includes('ClientMerchant')) {
          throw new BadRequestException(ResponseStauses.UserNotFound);
        } else if (err.message.includes('Order')) {
          throw new BadRequestException(ResponseStauses.OrderNotFound);
        } else if (err.message.includes('Currency')) {
          throw new BadRequestException(ResponseStauses.CurrencyNotFound);
        } else if (err.message.includes('TransportType')) {
          throw new BadRequestException(ResponseStauses.TransportTypeNotfound);
        } else if (err.message.includes('TransportKind')) {
          throw new BadRequestException(ResponseStauses.TransportKindNotfound);
        } else if (err.message.includes('CargoType')) {
          throw new BadRequestException(ResponseStauses.CargoTypeNotFound);
        } else if (err.message.includes('CargoLoadMethod')) {
          throw new BadRequestException(ResponseStauses.CargoLoadingMethodNotFound);
        } else if (err.message.includes('CargoPackage')) {
          throw new BadRequestException(ResponseStauses.CargoPackageNotFound);
        } else if (err.message.includes('CargoStatus')) {
          throw new BadRequestException(ResponseStauses.CargoStatusNotFound);
        } else {
          throw new InternalErrorException(ResponseStauses.CreateDataFailed);
        }
      } else {
        throw new InternalErrorException(err.toString());
      }
    } finally {
      await queryRunner.release();
    }

  }

  async updateOrder(orderId: number, dto: OrderDto, user: User): Promise<BpmResponse> {

    const queryRunner = this.ordersRepository.manager.connection.createQueryRunner();
      queryRunner.connect();
      try {
        queryRunner.startTransaction();
  
        const order: Order = await this.ordersRepository.findOneOrFail({ where: { id: orderId, isDeleted: false, createdBy: user },});
  
        if(order.cargoStatus.code != CargoStatusCodes.Waiting) {
          throw new BadRequestException(ResponseStauses.OrderStatusNotWaiting);
        }

        order.transportKinds = await this.transportKindsRepository.find({ where: { id: In(dto.transportKindIds) } });
        order.transportType = await this.transportTypesRepository.findOneOrFail({ where: { id: dto.transportTypeId } });
        order.cargoType = await this.cargoTyepesRepository.findOneOrFail({ where: { id: dto.cargoTypeId } });
        order.cargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Waiting } });
        
        if(dto.offeredPriceCurrencyId) {
          const offeredCurrency: Currency = await this.curreniesRepository.findOneOrFail({ where: { id: dto.offeredPriceCurrencyId } });
          order.offeredPriceCurrency = offeredCurrency;
        }
        if(dto.cargoLoadMethodIds) {
          order.cargoLoadMethods = await this.cargoLoadingMethodsRepository.find({ where: { id: In(dto.cargoLoadMethodIds) } });
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
        return new BpmResponse(true, null, [ResponseStauses.SuccessfullyUpdated]);
      } catch (err: any) {
        await queryRunner.rollbackTransaction();
        console.log(err)
        if (err.name == 'EntityNotFoundError') {
          if (err.message.includes('ClientMerchant')) {
            throw new BadRequestException(ResponseStauses.UserNotFound);
          } else if (err.message.includes('Order')) {
            throw new BadRequestException(ResponseStauses.OrderNotFound);
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
  
  async getOrderById(id: number, user: User): Promise<BpmResponse> {
    try {
      const order = await this.ordersRepository.findOneOrFail({ where: { id, isDeleted: false, client: { id: user.client.id } },
         relations: ['createdBy', 'loadingLocation', 'deliveryLocation', 'customsOutClearanceLocation', 'customsInClearanceLocation',
          'additionalLoadingLocation',
          'additionalDeliveryLocation', 'offeredPriceCurrency', 'cargoType', 'cargoStatus', 'transportType', 'cargoLoadMethods', 'transportKinds',
        'driverOrderOffers', 'driverOrderOffers.order', 'driverOrderOffers.driver', 'driverOrderOffers.driver.phoneNumbers', 'driverOrderOffers.clientReplyOrderOffer'] });
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

  async getClientsOrders(query: OrderQueryDto, user: User): Promise<BpmResponse> {
    try {
      const size = +query.pageSize || 10; // Number of items per page
      const index = +query.pageIndex || 1
      if (!user) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      if(user.userType != UserTypes.Client) { 
        throw new BadRequestException(ResponseStauses.AccessDenied);
      }

      const filter: any = { isDeleted: false, client: { id: user.client.id } };
      const sort: any = {};
      if(query.sortBy && query.sortType) {
        sort[query.sortBy] = query.sortType; 
      } else {
        sort['id'] = 'DESC'
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
      if(query.statusCode) {
        const status: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: query.statusCode } });
        if(status.code == CargoStatusCodes.Closed)  {
          filter.cargoStatus = { code: In([CargoStatusCodes.Closed, CargoStatusCodes.Canceled]) };
        } else {
          filter.cargoStatus = { code: status.code };
        }
      }
      if(query.loadingLocationName) {
        filter.loadingLocation = { name: ILike(`%${query.loadingLocationName}%`) }
      }
      if(query.deliveryLocationName) {
        filter.deliveryLocation = { name: ILike(`%${query.deliveryLocationName}%`) }
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
        relations: ['createdBy', 'loadingLocation', 'deliveryLocation', 'customsOutClearanceLocation', 'customsInClearanceLocation',
        'additionalLoadingLocation', 'driverOrderOffers', 'driverOrderOffers.order', 'driverOrderOffers.driver', 'driverOrderOffers.driver.phoneNumbers', 'driverOrderOffers.clientReplyOrderOffer',
        'additionalDeliveryLocation', 'offeredPriceCurrency', 'cargoType', 'cargoStatus', 'transportType', 'cargoLoadMethods', 'transportKinds'] });
        
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

  // async getClientArchiveOrderByUserId(user: User, sortBy: string, sortType: string, pageIndex: string, pageSize: string, userId: number, orderId: number, loadingLocationId: string, deliveryLocationId: string, transportKindId: string, transportTypeId: string, createdAt: string, sendDate: string): Promise<BpmResponse> {
  //   try {
  //     const size = +pageSize || 10; // Number of items per page
  //     const index = +pageIndex || 1
  //     if (!user) {
  //       throw new BadRequestException(ResponseStauses.IdIsRequired);
  //     }
  //     const filter: any = { deleted: false };
  //     if(!sortBy) {
  //       sortBy = 'id';
  //     } 
  //     if(!sortType) {
  //       sortType = 'DESC'
  //     }

  //     // managing access to orders according to userType
  //     if (user.userType == UserTypes.ClientMerchantUser) {
      
  //       // check if requesting user is Super admin then give merchant's all orders
  //       // if it is not give orders only ones created by him

  //       if( user.role.name == UsersRoleNames.SuperAdmin) {
  //         filter.clientMerchant = { id: user.clientMerchantUser.clientMerchant?.id }; 
  //       } else {
  //         filter.createdBy = user.id;
  //       }
  //     } else if(user.userType == UserTypes.Staff || user.userType == UserTypes.Client) {
  //       filter.createdBy = { id: userId }
  //     } else {
  //       throw new BadRequestException(ResponseStauses.AccessDenied);
  //     }

  //     if(transportTypeId) {
  //       filter.transportType = { id: transportTypeId }
  //     }
  //     if(orderId) {
  //       filter.id = orderId;
  //     }
  //     if(transportKindId) {
  //       filter.transportKind = { id: transportKindId }
  //     }
  //     if(loadingLocationId) {
  //       filter.loadingLocation = { id: loadingLocationId }
  //     }
  //     if(deliveryLocationId) {
  //       filter.deliveryLocation = { id: deliveryLocationId }
  //     }
  //     if(createdAt) {
  //       filter.createdAt = createdAt
  //     }
  //     if(sendDate) {
  //       filter.sendDate = sendDate
  //     }
  //     // const orders = await this.ordersRepository.find({ 
  //     //   order: sort, 
  //     //   where: filter,
  //     //   skip: (index - 1) * size, // Skip the number of items based on the page number
  //     //   take: size, 
  //     //   relations: ['loadingLocation', 'deliveryLocation', 'customsPlaceLocation', 'customsClearancePlaceLocation',
  //     //   'additionalLoadingLocation',
  //     //   'additionalDeliveryLocation', 'driverOffers', 'driverOffers.currency', 'driverOffers.createdBy', 'driverOffers.driver', 'driverOffers.driver.phoneNumbers', 'clientMerchant', 'inAdvancePriceCurrency', 'offeredPriceCurrency', 'cargoType', 'cargoStatus', 'cargoPackage', 'transportTypes', 'loadingMethod', 'transportKinds'] });
        

  //       const orders = await this.ordersRepository.createQueryBuilder("order")
  //       .leftJoinAndSelect("order.driverOffers", "driverOffer")
  //       .leftJoinAndSelect("driverOffer.driver", "driver")
  //       .leftJoinAndSelect("driverOffer.currency", "currency")
  //       .leftJoin("driverOffer.createdBy", "offerCreatedBy")
  //       .addSelect('offerCreatedBy.id')
  //       .addSelect('offerCreatedBy.userType')
  //       .addSelect('offerCreatedBy.lastLogin')
  //       .leftJoinAndSelect("driver.phoneNumbers", "phoneNumbers")
  //       .leftJoinAndSelect("order.loadingLocation", "loadingLocation")
  //       .leftJoinAndSelect("order.deliveryLocation", "deliveryLocation")
  //       .leftJoinAndSelect("order.customsPlaceLocation", "customsPlaceLocation")
  //       .leftJoinAndSelect("order.customsClearancePlaceLocation", "customsClearancePlaceLocation")
  //       .leftJoinAndSelect("order.additionalLoadingLocation", "additionalLoadingLocation")
  //       .leftJoinAndSelect("order.additionalDeliveryLocation", "additionalDeliveryLocation")
  //       .leftJoinAndSelect("order.clientMerchant", "clientMerchant")
  //       .leftJoinAndSelect("order.inAdvancePriceCurrency", "inAdvancePriceCurrency")
  //       .leftJoinAndSelect("order.offeredPriceCurrency", "offeredPriceCurrency")
  //       .leftJoinAndSelect("order.cargoType", "cargoType")
  //       .leftJoinAndSelect("order.cargoStatus", "cargoStatus")
  //       .leftJoinAndSelect("order.cargoPackage", "cargoPackage") 
  //       .leftJoinAndSelect("order.transportTypes", "transportTypes")
  //       .leftJoinAndSelect("order.loadingMethod", "cargoLoadMethod")
  //       .leftJoinAndSelect("order.transportKinds", "transportKinds")
  //       .where("order.deleted = :deleted", { deleted: false })
  //       .andWhere("driverOffer.driver.id = :driverId", { driverId: 0 })
  //       .andWhere("driverOffer.accepted = :accepted", { accepted: true })
  //       .andWhere(`CASE 
  //              WHEN order.is_safe_transaction THEN cargoStatus.code = :closed 
  //              ELSE cargoStatus.code = :completed 
  //              END `, {
  //         completed: CargoStatusCodes.Completed,
  //         closed: CargoStatusCodes.Closed
  //       })
  //       .skip((index - 1) * size) // Skip the number of items based on the page number
  //       .take(size)
  //       .orderBy(sortBy, sortType?.toString().toUpperCase() == 'ASC' ? 'ASC' : 'DESC')
  //       .getMany();


  //       const ordersCount = await this.ordersRepository.count({ where : filter });
  //       const totalPagesCount = Math.ceil(ordersCount / size);

  //       if(orders.length) {
  //       return new BpmResponse(true, { content: orders, totalPagesCount: totalPagesCount, pageIndex: index, pageSize: size }, null);
  //     } else {
  //       throw new NoContentException();
  //     }
  //   } catch (err: any) {
  //     console.log(err)
  //     if(err instanceof HttpException) {
  //       throw err
  //     }else if (err.name == 'EntityNotFoundError') {
  //       throw new NoContentException();
  //     } else {
  //       throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
  //     }
  //   }
  // }

  // async cancelOrder(id: number, user: User): Promise<BpmResponse> {
  //   try {
  //     if(!id || isNaN(id)) {
  //       throw new BadRequestException(ResponseStauses.IdIsRequired);
  //     }
  //     if(user.userType !== UserTypes.Client) {
  //     }
  //     const cargoStatus: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Canceled } });
  //     const res = await this.ordersRepository.update({ id, createdBy: { id: user.id }  }, { cargoStatus: cargoStatus })
  //     if(res.affected) {
  //       return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCanceled]);
  //     } else {
  //       throw new InternalErrorException(ResponseStauses.CancelDataFailed)
  //     }
  //   } catch (err: any) {
  //     if (err.name == 'EntityNotFoundError') {
  //       throw new BadRequestException(ResponseStauses.NotFound);
  //     } else {
  //       throw new InternalErrorException(ResponseStauses.UpdateDataFailed);
  //     }
  //   }
  // }

  async getOfferedDrivers(orderId: number, user: User): Promise<BpmResponse> {
    try {

      const drivers = await this.driversRepository.find({ where: { orderOffers: { id: orderId } }, relations: ['orderOffers', 'orderOffers.currency', 'orderOffers.createdBy'] });

      if(!drivers.length) {
        throw new NoContentException();
      }

      return new BpmResponse(true, drivers);
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

  async getOffersByDriver(orderId: number, driverId: number, user: User): Promise<BpmResponse> {
    try {
      const offers = await this.orderOffersRepository.find({ where: { driver: { id: driverId }, order: { id: orderId } }, relations: ['driver', 'currency', 'createdBy'] });

      if(!offers.length) {
        throw new NoContentException();
      }
      return new BpmResponse(true, offers);
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

  async replyDriverOrderOffer(orderId:number, offerId: number, offerDto: ReplyDriverOrderOfferDto, user: User): Promise<BpmResponse> {
    try {

      const driverOrderOffer: DriverOrderOffers = await this.orderOffersRepository.findOneOrFail({ where: { id: offerId, order: { id: orderId} }, relations: ['driver', 'order'] });
      if(driverOrderOffer.isCanceled) {
        throw new BadRequestException(ResponseStauses.AlreadyCanceled);
      } else if(driverOrderOffer.isAccepted) {
        throw new BadRequestException(ResponseStauses.AlreadyAccepted);
      } else if(driverOrderOffer.isRejected) {
        throw new BadRequestException(ResponseStauses.AlreadyRejected)
      }

      const isDriverBusy: boolean = await this.orderOffersRepository.exists({ where: { driver: { id: driverOrderOffer.driver?.id } , isAccepted: true, isFinished: false } });
      if(isDriverBusy) {
        throw new BadRequestException(ResponseStauses.DriverHasOrder)
      }

      const isDriverArchived: boolean = await this.driversRepository.exists({ where: { id: driverOrderOffer.driver?.id, isDeleted: true} });
      if(isDriverArchived) {
        throw new BadRequestException(ResponseStauses.DriverArchived)
      }

      const isDriverBlocked: boolean = await this.driversRepository.exists({ where: { id: driverOrderOffer.driver?.id, isBlocked: true} });
      if(isDriverBlocked) {
        throw new BadRequestException(ResponseStauses.DriverBlocked)
      }

      const createReplyOfferDto: ClientRepliesOrderOffer = new ClientRepliesOrderOffer();

      createReplyOfferDto.amount = offerDto.amount;
      createReplyOfferDto.client = user.client;
      createReplyOfferDto.order = driverOrderOffer.order;
      createReplyOfferDto.driverOrderOffer = driverOrderOffer;
      createReplyOfferDto.createdBy = user;

      //save offer as replied  
      driverOrderOffer.isReplied = true;
      driverOrderOffer.repliedBy = user;
      await this.orderOffersRepository.save(driverOrderOffer);

      //then create new offer
      await this.clientReplyOrderOfferRepository.save(createReplyOfferDto);
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

  async acceptDriverOrderOffer(orderId: number, offerId: number, user: User): Promise<BpmResponse> {
    const queryRunner = await this.ordersRepository.manager.connection.createQueryRunner();
    queryRunner.connect();
    try { 
      await queryRunner.startTransaction();
      const offer: DriverOrderOffers = await this.orderOffersRepository.findOneOrFail({ where: { id: offerId, order: { id: orderId } }, relations: ['driver', 'order'] });

      if(offer.isAccepted) {
        throw new BadRequestException(ResponseStauses.AlreadyAccepted);
      } else if(offer.isCanceled) {
        throw new BadRequestException(ResponseStauses.AlreadyCanceled);
      } else if(offer.isRejected) {
        throw new BadRequestException(ResponseStauses.AlreadyRejected);
      }

      const isDriverBusy = await this.orderOffersRepository.exists({ where: { driver: { id: offer.driver?.id }, isAccepted: true, isFinished: false } });
      if(isDriverBusy) {
        throw new BadRequestException(ResponseStauses.DriverHasOrder)
      }
      if(offer.driver?.isDeleted) {
        throw new BadRequestException(ResponseStauses.DriverArchived)
      }
      if(offer.driver?.isBlocked) {
        throw new BadRequestException(ResponseStauses.DriverBlocked)
      }
      
      offer.isAccepted = true;
      offer.acceptedAt = new Date();
      offer.acceptedBy = user;
      await queryRunner.manager.save(DriverOrderOffers, offer);
      
      const cargoStatus: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Accepted } });
      const order: Order = await this.ordersRepository.findOneOrFail({ where: { id: offer.order?.id }, relations: ['cargoStatus'] });
      order.cargoStatus = cargoStatus;
      order.driver = offer.driver;
      await queryRunner.manager.save(Order, order);

      await queryRunner.commitTransaction();
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch(err: any) {
      await queryRunner.rollbackTransaction();
      console.log(err)
      if(err instanceof HttpException) {
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

  async rejectDriverOffer(orderId: number, offerId: number, dto: RejectOfferDto, user: any): Promise<BpmResponse> {
    try {

      const offer: DriverOrderOffers = await this.orderOffersRepository.findOneOrFail({ where: { id: offerId, order: { id: orderId } }, relations: ['driver', 'order'] });
      if(offer.isAccepted) {
        throw new BadRequestException(ResponseStauses.AlreadyAccepted);
      } else if(offer.isCanceled) {
        throw new BadRequestException(ResponseStauses.AlreadyCanceled);
      } else if(offer.isRejected) {
        throw new BadRequestException(ResponseStauses.AlreadyRejected);
      }
      offer.isRejected = true;
      offer.rejectedAt = new Date();
      offer.rejectReason = dto.rejectReason || '';
      offer.rejectedBy = user;

      await this.orderOffersRepository.save(offer);

      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyRejected]);
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

  async cancelDriverOffer(orderId: number, offerId: number, cancelOfferDto: CancelOfferDto, user: any): Promise<BpmResponse> {
    try {

      const offer: DriverOrderOffers = await this.orderOffersRepository.findOneOrFail({ where: { id: offerId, order: { id: orderId } }, relations: ['driver', 'order'] });

      if(offer.isAccepted) {
        throw new BadRequestException(ResponseStauses.AlreadyAccepted);
      } else if(offer.isCanceled) {
        throw new BadRequestException(ResponseStauses.AlreadyCanceled);
      } else if(offer.isRejected) {
        throw new BadRequestException(ResponseStauses.AlreadyRejected);
      }

      offer.isCanceled = true;
      offer.cancelReason = cancelOfferDto.cancelReason || '';
      offer.canceledBy = user;
      offer.canceledAt = new Date();
      await this.orderOffersRepository.save(offer);

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
}