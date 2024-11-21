import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { UsersRoleNames, BpmResponse, CargoLoadMethod, Order, CargoPackage, CargoStatus, CargoStatusCodes, CargoType, Currency, ResponseStauses, TransportKind, TransportType, BadRequestException, InternalErrorException, OrderDto, ClientMerchant, NoContentException, User, UserTypes, Client, OrderOfferDto, DriverOrderOffers, Driver, RejectOfferDto, OrderQueryDto } from '..';
import { RabbitMQSenderService } from '../services/rabbitmq-sender.service';
import { CancelOfferDto } from '@app/shared-modules/entites/orders/dtos/cancel-offer.dto';

@Injectable()
export class DriversService {
  constructor(
    // @InjectRepository(Client) private readonly clientsRepository: Repository<Client>,
    // @InjectRepository(CargoType) private readonly cargoTyepesRepository: Repository<CargoType>,
    // @InjectRepository(CargoPackage) private readonly cargoPackagesRepository: Repository<CargoPackage>,
    // @InjectRepository(TransportKind) private readonly transportKindsRepository: Repository<TransportKind>,
    // @InjectRepository(TransportType) private readonly transportTypesRepository: Repository<TransportType>,
    // @InjectRepository(ClientMerchant) private readonly clientMerchantsRepository: Repository<ClientMerchant>,
    // @InjectRepository(CargoLoadMethod) private readonly cargoLoadingMethodsRepository: Repository<CargoLoadMethod>
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Currency) private readonly curreniesRepository: Repository<Currency>,
    @InjectRepository(Driver) private readonly driversRepository: Repository<Driver>,
    @InjectRepository(Order) private readonly ordersRepository: Repository<Order>,
    @InjectRepository(CargoStatus) private readonly cargoStatusesRepository: Repository<CargoStatus>,
    @InjectRepository(DriverOrderOffers) private readonly orderOffersRepository: Repository<DriverOrderOffers>,
    private rmqService: RabbitMQSenderService
  ) { }

  async getOrders(user: User, query: OrderQueryDto): Promise<BpmResponse> {
    try {

      const size = +query.pageSize || 10; // Number of items per page
      const index = +query.pageIndex || 1

      const driver: Driver = await this.driversRepository.findOneOrFail({ where: { user: { id: user.id } }, 
                  relations: ['createdBy', 'driverTransports', 'driverTransports.transportType', 'driverOrderOffers', 'driverOrderOffers.order', 'driverOrderOffers.driver', 'driverOrderOffers.clientReplyOrderOffer'] })

      const driverTransportTypeIds: string[] = driver.driverTransports.map((driverTransport) => driverTransport.transportType.id);

      const sort: any = {};
      if (query.sortBy && query.sortType) {
        sort[query.sortBy] = query.sortType;
      } else {
        sort['id'] = 'DESC'
      }

      const filter: any = { deleted: false };
      if (query.transportTypeId) {
        filter.transportType = { id: In(driverTransportTypeIds) }
      }
      if (query.orderId) {
        filter.id = query.orderId;
      }
      if (query.transportKindId) {
        filter.transportKind = { id: query.transportKindId }
      }
      if (query.statusCode) {
        const status: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: query.statusCode } });
        if (status.code == CargoStatusCodes.Closed) {
          filter.cargoStatus = { code: In([CargoStatusCodes.Closed, CargoStatusCodes.Canceled]) };
        } else {
          filter.cargoStatus = { code: query.statusCode };
        }
      }
      if (query.loadingLocationName) {
        filter.loadingLocation = { name: query.loadingLocationName }
      }
      if (query.deliveryLocationName) {
        filter.deliveryLocation = { name: query.deliveryLocationName }
      }
      if (query.createdAt) {
        filter.createdAt = query.createdAt
      }
      if (query.sendDate) {
        filter.sendDate = query.sendDate
      }

      const orders = await this.ordersRepository.find({
        order: sort,
        where: filter,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size,
        relations:  ['createdBy', 'loadingLocation', 'deliveryLocation', 'customsOutClearanceLocation', 'customsInClearanceLocation',
          'additionalLoadingLocation',
          'additionalDeliveryLocation', 'offeredPriceCurrency', 'cargoType', 'transportType', 'cargoLoadMethods', 'transportKinds']
      });

      const merchantsCount = await this.ordersRepository.count({ where: filter });
      const totalPagesCount = Math.ceil(merchantsCount / size);

      if (orders.length) {
        return new BpmResponse(true, { content: orders, totalPagesCount: totalPagesCount, pageIndex: index, pageSize: size}, null);
      } else {
        throw new NoContentException();
      }
    } catch (err: any) {
      console.log(err)
      if (err instanceof HttpException) {
        throw err
      } else if (err.name == 'EntityNotFoundError') {
        throw new NoContentException();
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async getOrderById(id: number): Promise<BpmResponse> {
    try {
      const order = await this.ordersRepository.findOneOrFail({
        where: { isDeleted: false, id },
        relations: ['createdBy', 'loadingLocation', 'deliveryLocation', 'customsOutClearanceLocation', 'customsInClearanceLocation',
          'additionalLoadingLocation',
          'additionalDeliveryLocation', 'offeredPriceCurrency', 'cargoType', 'transportType', 'cargoLoadMethods', 'transportKinds',
        'driverOrderOffers', 'driverOrderOffers.order', 'driverOrderOffers.driver', 'driverOrderOffers.clientReplyOrderOffer']
      });
      return new BpmResponse(true, order, null);
    } catch (err: any) {
      console.log(err)
      if (err instanceof HttpException) {
        throw err
      } else if (err.name == 'EntityNotFoundError') {
        throw new NoContentException();
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  // async cancelOrder(id: number): Promise<BpmResponse> {
  //   try {
  //     if (!id || isNaN(id)) {
  //       throw new BadRequestException(ResponseStauses.IdIsRequired);
  //     }
  //     const cargoStatus: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Canceled } });
  //     const res = await this.ordersRepository.update({ id }, { cargoStatus: cargoStatus })
  //     if (res.affected) {
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

  async offerPriceToOrder(orderId: number, dto: OrderOfferDto, user: User): Promise<BpmResponse> {
    try {
      const isOrderWaiting: boolean = await this.ordersRepository.exists({ where: { id: orderId, cargoStatus: { code: CargoStatusCodes.Waiting } }});
      if(!isOrderWaiting) {
        throw new BadRequestException(ResponseStauses.OrderIsNotWaiting)
      }

      const isDriverBusy: boolean = await this.orderOffersRepository.exists({ where: { driver: { id: user.driver?.id }, isAccepted: true } });
      if (isDriverBusy) {
        throw new BadRequestException(ResponseStauses.DriverHasOrder)
      }

      const isDriverArchived: boolean = await this.driversRepository.exists({ where: { id: user.driver?.id, isDeleted: true} });
      if(isDriverArchived) {
        throw new BadRequestException(ResponseStauses.DriverArchived)
      }

      const isDriverBlocked: boolean = await this.driversRepository.exists({ where: { id: user.driver?.id, isDeleted: true} });
      if(isDriverBlocked) {
        throw new BadRequestException(ResponseStauses.DriverBlocked)
      }

      const isAlreadyAccepted: boolean = await this.orderOffersRepository.exists({ where: { order: { id: orderId }, isAccepted: true } });
      if (isAlreadyAccepted) {
        throw new BadRequestException(ResponseStauses.AlreadyAccepted)
      }

      const offered: boolean = await this.orderOffersRepository.exists({ 
          where: {
            isAccepted: false,
            isCanceled: false,
            isRejected: false, 
            order: { id: orderId }, 
            driver: { id: user.driver?.id }
          } 
      });

      if (offered) {
        throw new BadRequestException(ResponseStauses.AlreadyOffered);
      }

      const isLimitExceed: boolean = await this.orderOffersRepository.exists({ 
        where: {
          requestIndex: 3,
          order: { id: orderId }, 
          driver: { id: user.driver?.id }
        } 
      });
      if (isLimitExceed) {
        throw new BadRequestException(ResponseStauses.OfferLimit);
      }

      const createOfferDto: DriverOrderOffers = new DriverOrderOffers();

      // const user: User = await this.usersRepository.findOneOrFail({ where: { id: userId } });
      const order: Order = await this.ordersRepository.findOneOrFail({ where: { id: orderId }, relations: ['client'] });
      const currency: Currency = await this.curreniesRepository.findOneOrFail({ where: { id: dto.curencyId } });
      const driver: Driver = await this.driversRepository.findOneOrFail({ where: { id: user.driver?.id } });
     
      let count: number = await this.orderOffersRepository.count({ 
        where: {
          order: { id: orderId }, 
          driver: { id: user.driver?.id }
        } 
      });
      
      createOfferDto.requestIndex = count += 1;
      createOfferDto.amount = dto.amount;
      createOfferDto.driver = driver;
      createOfferDto.order = order;
      createOfferDto.currency = currency;
      createOfferDto.createdBy = user;

      // create new offfer
      await this.orderOffersRepository.save(createOfferDto);
      await this.rmqService.sendOrderOfferMessageToClient({ userId: order.client?.id, orderId: order.id });

      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
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

  async cancelOfferPriceToOrder(orderId: number, driverOfferId: number, dto: CancelOfferDto, user: User): Promise<BpmResponse> {
    try {

      const offer: DriverOrderOffers = await this.orderOffersRepository.findOneOrFail({ where: { id: driverOfferId, order: { id: orderId } } });

      if (offer.isAccepted) {
        throw new BadRequestException(ResponseStauses.AlreadyAccepted);
      } else if(offer.isCanceled) {
        throw new BadRequestException(ResponseStauses.AlreadyCanceled);
      } else if(offer.isRejected) {
        throw new BadRequestException(ResponseStauses.AlreadyRejected);
      }

      offer.isCanceled = true;
      offer.canceledAt = new Date();
      offer.canceledBy = user;
      offer.cancelReason = dto.cancelReason;
      await this.orderOffersRepository.save(offer);

      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyUpdated]);
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

  // async acceptClientOffer(offerId: number): Promise<BpmResponse> {
  //   try {

  //     const offer: DriverOrderOffers = await this.orderOffersRepository.findOneOrFail({ where: { id: offerId }, relations: ['driver', 'order'] });
  //     const order: Order = await this.ordersRepository.findOneOrFail({ where: { id: offer.order?.id }, relations: ['client'] })
  //     const cargoStatus: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Accepted } });

  //     const isDriverBusy: boolean = await this.orderOffersRepository.exists({ where: { driver: { id: offer.driver?.id }, accepted: true } });
  //     if (isDriverBusy) {
  //       throw new BadRequestException(ResponseStauses.DriverHasOrder)
  //     }

  //     const isDriverArchived: boolean = await this.driversRepository.exists({ where: { id: offer.driver?.id, isDeleted: true} });
  //     if(isDriverArchived) {
  //       throw new BadRequestException(ResponseStauses.DriverArchived)
  //     }

  //     const isDriverBlocked: boolean = await this.driversRepository.exists({ where: { id: offer.driver?.id, isDeleted: true} });
  //     if(isDriverBlocked) {
  //       throw new BadRequestException(ResponseStauses.DriverBlocked)
  //     }

  //     if (offer.rejected) {
  //       throw new BadRequestException(ResponseStauses.OfferWasRejected);
  //     } else if (offer.canceled) {
  //       throw new BadRequestException(ResponseStauses.OfferWasCanceled);
  //     }

  //     const isAlreadyAccepted: boolean = await this.orderOffersRepository.exists({ where: { order: { id: offer.order?.id }, accepted: true } });
  //     if (isAlreadyAccepted) {
  //       throw new BadRequestException(ResponseStauses.AlreadyAccepted)
  //     }

  //     offer.accepted = true;
  //     await this.orderOffersRepository.save(offer);

  //     order.cargoStatus = cargoStatus;
  //     await this.ordersRepository.save(order);

  //     await this.rmqService.sendAcceptOfferMessageToClient({ userId: order.client?.id, orderId: offer.order.id })
  //     return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
  //   } catch (err: any) {
  //     console.log(err)
  //     if (err instanceof HttpException) {
  //       throw err
  //     } else if (err.name == 'EntityNotFoundError') {
  //       throw new BadRequestException(ResponseStauses.NotFound);
  //     } else {
  //       throw new InternalErrorException(ResponseStauses.UpdateDataFailed);
  //     }
  //   }
  // }

  // async rejectClientOffer(offerId: number, rejectOfferDto: RejectOfferDto, user: any): Promise<BpmResponse> {
  //   try {

  //     const offer: DriverOrderOffers = await this.orderOffersRepository.findOneOrFail({ where: { id: offerId }, relations: ['driver', 'order'] });
  //     const order: Order = await this.ordersRepository.findOneOrFail({ where: { id: offer.order?.id }, relations: ['client'] })
  //     const cargoStatus: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Canceled } });

  //     offer.rejected = true;
  //     offer.rejectReason = rejectOfferDto.rejectReason || '';
  //     offer.rejectedBy = user;
  //     await this.orderOffersRepository.save(offer);

  //     order.cargoStatus = cargoStatus;
  //     await this.ordersRepository.save(order);

  //     return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
  //   } catch (err: any) {
  //     console.log(err)
  //     if (err instanceof HttpException) {
  //       throw err
  //     } else if (err.name == 'EntityNotFoundError') {
  //       throw new BadRequestException(ResponseStauses.NotFound);
  //     } else {
  //       throw new InternalErrorException(ResponseStauses.UpdateDataFailed);
  //     }
  //   }
  // }

  // async cancelClientOffer(offerId: number, cancelOfferDto: CancelOfferDto, user: any): Promise<BpmResponse> {
  //   try {

  //     const offer: DriverOrderOffers = await this.orderOffersRepository.findOneOrFail({ where: { id: offerId }, relations: ['driver', 'order'] });
  //     const order: Order = await this.ordersRepository.findOneOrFail({ where: { id: offer.order?.id }, relations: ['client'] })
  //     const cargoStatus: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Canceled } });

  //     offer.canceled = true;
  //     offer.cancelReason = cancelOfferDto.cancelReason || '';
  //     offer.canceledBy = user;
  //     await this.orderOffersRepository.save(offer);

  //     order.cargoStatus = cargoStatus;
  //     await this.ordersRepository.save(order);

  //     return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
  //   } catch (err: any) {
  //     console.log(err)
  //     if (err instanceof HttpException) {
  //       throw err
  //     } else if (err.name == 'EntityNotFoundError') {
  //       throw new BadRequestException(ResponseStauses.NotFound);
  //     } else {
  //       throw new InternalErrorException(ResponseStauses.UpdateDataFailed);
  //     }
  //   }
  // }

  // async getDriverOffers() {
  //   try {
  //     const offered: DriverOrderOffers[] = await this.orderOffersRepository.find({ where: { canceled: false }, relations: ['order', 'driver', 'currency'] });

  //     return new BpmResponse(true, offered, null);
  //   } catch (err: any) {
  //     console.log(err)
  //     if (err instanceof HttpException) {
  //       throw err
  //     } else if (err.name == 'EntityNotFoundError') {
  //       throw new BadRequestException(ResponseStauses.NotFound);
  //     } else {
  //       throw new InternalErrorException(ResponseStauses.UpdateDataFailed);
  //     }
  //   }
  // }
}