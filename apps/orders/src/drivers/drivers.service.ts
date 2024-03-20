import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { UsersRoleNames, BpmResponse, CargoLoadMethod, Order, CargoPackage, CargoStatus, CargoStatusCodes, CargoType, Currency, ResponseStauses, TransportKind, TransportType, BadRequestException, InternalErrorException, OrderDto, ClientMerchant, NoContentException, User, UserTypes, Client, OrderOfferDto, OrderOffer, Driver } from '..';
import { RabbitMQSenderService } from '../services/rabbitmq-sender.service';

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
    @InjectRepository(OrderOffer) private readonly orderOffersRepository: Repository<OrderOffer>,
    private rmqService: RabbitMQSenderService
  ) { }


  async getOrderById(id: number): Promise<BpmResponse> {
    try {
      if (!id) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const order = await this.ordersRepository.findOneOrFail({ where: { id, deleted: false }, relations: ['driverOffer', 'driverOffer.driver', 'driverOffer.driver.phoneNumbers', 'clientMerchant', 'inAdvancePriceCurrency', 'offeredPriceCurrency', 'cargoType', 'cargoPackage', 'transportTypes', 'cargoLoadMethod', 'transportKinds'] });
      return new BpmResponse(true, order, null);
    } catch (err: any) {
      if (err.name == 'EntityNotFoundError') {
        throw new NoContentException();
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async getOrders(sortBy: string, sortType: string, pageIndex: string, pageSize: string, orderId: number, statusId: string, loadingLocation: string, deliveryLocation: string, transportKindId: string, transportTypeId: string, createdAt: string, sendDate: string): Promise<BpmResponse> {
    try {

      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 1

      const sort: any = {};
      if (sortBy && sortType) {
        sort[sortBy] = sortType;
      } else {
        sort['id'] = 'DESC'
      }

      const filter: any = { deleted: false };
      if (transportTypeId) {
        filter.transportType = { id: transportTypeId }
      }
      if (orderId) {
        filter.id = orderId;
      }
      if (transportKindId) {
        filter.transportKind = { id: transportKindId }
      }
      if (statusId) {
        const status: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { id: statusId } });
        if (status.code == CargoStatusCodes.Closed) {
          filter.cargoStatus = { code: In([CargoStatusCodes.Closed, CargoStatusCodes.Canceled]) };
        } else {
          filter.cargoStatus = { id: statusId };
        }
      }
      if (loadingLocation) {
        filter.loadingLocation = loadingLocation
      }
      if (deliveryLocation) {
        filter.deliveryLocation = deliveryLocation
      }
      if (createdAt) {
        filter.createdAt = createdAt
      }
      if (sendDate) {
        filter.sendDate = sendDate
      }

      const orders = await this.ordersRepository.find({
        order: sort,
        where: filter,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size,
        relations: ['loadingLocation', 'deliveryLocation', 'customsPlaceLocation', 'customsClearancePlaceLocation',
        'additionalLoadingLocation',
        'additionalDeliveryLocation','clientMerchant', 'inAdvancePriceCurrency', 'offeredPriceCurrency', 'cargoType', 'cargoStatus', 'cargoPackage', 'transportTypes', 'loadingMethod', 'transportKinds']
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

  async getWaitingOrders(sortBy: string, sortType: string, pageIndex: string, pageSize: string, orderId: number, loadingLocation: string, deliveryLocation: string, transportKindId: string, transportTypeId: string, createdAt: string, sendDate: string): Promise<BpmResponse> {
    try {

      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 1

      const sort: any = {};
      if (sortBy && sortType) {
        sort[sortBy] = sortType;
      } else {
        sort['id'] = 'DESC'
      }

      const filter: any = { deleted: false, cargoStatus: { code: CargoStatusCodes.Waiting } };
      if (transportTypeId) {
        filter.transportType = { id: transportTypeId }
      }
      if (orderId) {
        filter.id = orderId;
      }
      if (transportKindId) {
        filter.transportKind = { id: transportKindId }
      }
      if (loadingLocation) {
        filter.loadingLocation = loadingLocation
      }
      if (deliveryLocation) {
        filter.deliveryLocation = deliveryLocation
      }
      if (createdAt) {
        filter.createdAt = createdAt
      }
      if (sendDate) {
        filter.sendDate = sendDate
      }
      const orders = await this.ordersRepository.find({
        order: sort,
        where: filter,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size,
        relations: ['loadingLocation', 'deliveryLocation', 'customsPlaceLocation', 'customsClearancePlaceLocation',
        'additionalLoadingLocation',
        'additionalDeliveryLocation','driverOffers', 'createdBy', 'driverOffers.createdBy', 'driverOffers.currency', 'driverOffers.driver', 'driverOffers.driver.phoneNumbers', 'clientMerchant', 'inAdvancePriceCurrency', 'offeredPriceCurrency', 'cargoType', 'cargoStatus', 'cargoPackage', 'transportTypes', 'loadingMethod', 'transportKinds']
      });
      if (orders.length) {
 
        const merchantsCount = await this.ordersRepository.count({ where: filter });
        const totalPagesCount = Math.ceil(merchantsCount / size);

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
 
  async getActiveOrderByDriverId(id: number): Promise<BpmResponse> {
    try {
      if (!id) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const order = await this.ordersRepository.findOneOrFail({
        where: { deleted: false, driverOffers: { driver: { id }, accepted: true }, cargoStatus: { code: In([CargoStatusCodes.Active, CargoStatusCodes.Accepted]) } },
        relations: ['loadingLocation', 'deliveryLocation', 'customsPlaceLocation', 'customsClearancePlaceLocation',
        'additionalLoadingLocation',
        'additionalDeliveryLocation','driverOffers', 'driverOffers.currency', 'driverOffers.driver', 'driverOffers.driver.phoneNumbers', 'clientMerchant', 'inAdvancePriceCurrency', 'offeredPriceCurrency', 'cargoType', 'cargoPackage', 'transportTypes', 'loadingMethod', 'transportKinds']
      });

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

  async getMerchantActiveOrders(id: number, sortBy: string, sortType: string, pageIndex: string, pageSize: string): Promise<BpmResponse> {
    try {
      if (!id) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }

      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 1

      const sort: any = {};
      if (sortBy && sortType) {
        sort[sortBy] = sortType;
      } else {
        sort['id'] = 'DESC';
      }

      const orders = await this.ordersRepository.find({
        order: sort,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size,
        where: { deleted: false, driverOffers: { driver: { driverMerchant: { id } }, accepted: true }, cargoStatus: { code: In([CargoStatusCodes.Active, CargoStatusCodes.Accepted]) } },
        relations: ['loadingLocation', 'deliveryLocation', 'customsPlaceLocation', 'customsClearancePlaceLocation',
        'additionalLoadingLocation',
        'additionalDeliveryLocation','driverOffers', 'driverOffers.currency', 'driverOffers.driver.driverMerchant', 'driverOffers.driver', 'driverOffers.driver.phoneNumbers', 'clientMerchant', 'inAdvancePriceCurrency', 'offeredPriceCurrency', 'cargoType', 'cargoStatus', 'cargoPackage', 'transportTypes', 'loadingMethod', 'transportKinds']
      });

      if(orders.length) {
        const merchantsCount = await this.ordersRepository.count({ where: { deleted: false, driverOffers: { driver: { driverMerchant: { id } }, accepted: true }, cargoStatus: { code: In([CargoStatusCodes.Active, CargoStatusCodes.Accepted]) }  } });
        const totalPagesCount = Math.ceil(merchantsCount / size);
        return new BpmResponse(true, { content: orders, totalPagesCount: totalPagesCount, pageIndex: index, pageSize: size }, null);
      } else {
        throw new NoContentException();
      }
    } catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') {
        throw new NoContentException();
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async getArchiveOrdersByDriverId(driverId: number, sortBy: string, sortType: string, pageIndex: string, pageSize: string): Promise<BpmResponse> {
    try {
      const size = +pageSize || 10; // Number of items per page
      const index = +pageIndex || 1
      if (!driverId) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      if(!sortBy) {
        sortBy = 'id';
      } 
      if(!sortType) {
        sortType = 'DESC'
      }
      const orders = await this.ordersRepository.createQueryBuilder("order")
        .leftJoinAndSelect("order.driverOffers", "driverOffer")
        .leftJoinAndSelect("driverOffer.driver", "driver")
        .leftJoinAndSelect("driverOffer.currency", "currency")
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
        .andWhere("driverOffer.driver.id = :driverId", { driverId: driverId })
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

         const merchantsCount = await this.ordersRepository.createQueryBuilder('o')
        .leftJoinAndSelect("order.driverOffers", "driverOffer")
        .where("order.deleted = :deleted", { deleted: false })
        .andWhere("driverOffer.driver.id = :driverId", { driverId: driverId })
        .andWhere("driverOffer.accepted = :accepted", { accepted: true })
        .andWhere(`CASE 
               WHEN order.is_safe_transaction THEN cargoStatus.code = :closed 
               ELSE cargoStatus.code = :completed 
               END `, {
          completed: CargoStatusCodes.Completed,
          closed: CargoStatusCodes.Closed
        })
        .getCount()
        const totalPagesCount = Math.ceil(merchantsCount / size);

      return new BpmResponse(true, { content: orders, totalPagesCount: totalPagesCount, pageIndex: index, pageSize: size }, null);
    } catch (err: any) {
      console.log(err)
      if (err.name == 'EntityNotFoundError') { 
        throw new NoContentException();
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async cancelOrder(id: number): Promise<BpmResponse> {
    try {
      if (!id || isNaN(id)) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const cargoStatus: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Canceled } });
      const res = await this.ordersRepository.update({ id }, { cargoStatus: cargoStatus })
      if (res.affected) {
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

  async offerPriceToOrder(offerDto: OrderOfferDto, userId: number): Promise<BpmResponse> {
    try {

      const isDriverBusy: boolean = await this.orderOffersRepository.exists({ where: { driver: { id: offerDto.driverId }, accepted: true } });
      if (isDriverBusy) {
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

      const isAlreadyAccepted: boolean = await this.orderOffersRepository.exists({ where: { order: { id: offerDto.orderId }, accepted: true } });
      if (isAlreadyAccepted) {
        throw new BadRequestException(ResponseStauses.AlreadyAccepted)
      }

      const offered: OrderOffer[] = await this.orderOffersRepository.find({ where: { order: { id: offerDto.orderId }, driver: { id: offerDto.driverId }, createdBy: { id: userId } } });
      if ((offered.filter((el: any) => !el.rejected && !el.canceled)).length) {
        throw new BadRequestException(ResponseStauses.AlreadyOffered);
      }
      if (offered.length > 2) {
        throw new BadRequestException(ResponseStauses.OfferLimit);
      }

      const createOfferDto: OrderOffer = new OrderOffer();

      const user: User = await this.usersRepository.findOneOrFail({ where: { id: userId } });
      const order: Order = await this.ordersRepository.findOneOrFail({ where: { id: offerDto.orderId }, relations: ['createdBy'] });
      const currency: Currency = await this.curreniesRepository.findOneOrFail({ where: { id: offerDto.curencyId } });
      const driver: Driver = await this.driversRepository.findOneOrFail({ where: { id: offerDto.driverId } });

      if (offered.length) {
        createOfferDto.offerIndex = offered.length;
      }
      createOfferDto.amount = offerDto.amount;
      createOfferDto.driver = driver;
      createOfferDto.order = order;
      createOfferDto.currency = currency;
      createOfferDto.createdBy = user;

      // reject other offfers
      await this.orderOffersRepository.update({ order: { id: order.id, driver: { id: driver.id } } }, { rejected: true })

      // then create new offfer
      const res = await this.orderOffersRepository.save(createOfferDto);
      await this.rmqService.sendOrderOfferMessageToClient({ userId: order.createdBy?.id, orderId: order.id })
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

  async acceptClientOffer(offerId: number): Promise<BpmResponse> {
    try {

      const offer: OrderOffer = await this.orderOffersRepository.findOneOrFail({ where: { id: offerId }, relations: ['driver', 'order'] });
      const order: Order = await this.ordersRepository.findOneOrFail({ where: { id: offer.order?.id }, relations: ['createdBy'] })
      const cargoStatus: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Accepted } });

      const isDriverBusy: boolean = await this.orderOffersRepository.exists({ where: { driver: { id: offer.driver?.id }, accepted: true } });
      if (isDriverBusy) {
        throw new BadRequestException(ResponseStauses.DriverHasOrder)
      }

      const isDriverArchived: boolean = await this.driversRepository.exists({ where: { id: offer.driver?.id, deleted: true} });
      if(isDriverArchived) {
        throw new BadRequestException(ResponseStauses.DriverArchived)
      }

      const isDriverBlocked: boolean = await this.driversRepository.exists({ where: { id: offer.driver?.id, deleted: true} });
      if(isDriverBlocked) {
        throw new BadRequestException(ResponseStauses.DriverBlocked)
      }

      if (offer.rejected) {
        throw new BadRequestException(ResponseStauses.OfferWasRejected);
      } else if (offer.canceled) {
        throw new BadRequestException(ResponseStauses.OfferWasCanceled);
      }

      const isAlreadyAccepted: boolean = await this.orderOffersRepository.exists({ where: { order: { id: offer.order?.id }, accepted: true } });
      if (isAlreadyAccepted) {
        throw new BadRequestException(ResponseStauses.AlreadyAccepted)
      }

      offer.accepted = true;
      await this.orderOffersRepository.save(offer);

      order.cargoStatus = cargoStatus;
      await this.ordersRepository.save(order);

      await this.rmqService.sendAcceptOfferMessageToClient({ userId: order.createdBy?.id, orderId: offer.order.id })
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

  async getDriverOffers() {
    try {
      const offered: OrderOffer[] = await this.orderOffersRepository.find({ where: { canceled: false }, relations: ['order', 'driver', 'currency'] });

      return new BpmResponse(true, offered, null);
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