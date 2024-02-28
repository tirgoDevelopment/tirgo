import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { UsersRoleNames, BpmResponse, CargoLoadMethod, Order, CargoPackage, CargoStatus, CargoStatusCodes, CargoType, Currency, ResponseStauses, TransportKind, TransportType, BadRequestException, InternalErrorException, OrderDto, ClientMerchant, NoContentException, User, UserTypes, Client, OrderOfferDto, OrderOffer, Driver, ReplyOfferDto, OrderOfferReply } from '..';
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
    @InjectRepository(OrderOfferReply) private readonly offerRepliesRepository: Repository<OrderOfferReply>,
    private rmqService: RabbitMQSenderService
  ) { }

 
  async getOrderById(id: number): Promise<BpmResponse> {
    try {
      if (!id) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const order = await this.ordersRepository.findOneOrFail({ where: { id, deleted: false }, relations: ['driverOffer', 'driverOffer.driver', 'driverOffer.driver.phoneNumbers','clientMerchant', 'inAdvancePriceCurrency', 'offeredPriceCurrency', 'cargoType', 'cargoPackage', 'transportTypes', 'cargoLoadMethod', 'transportKinds'] });
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
      if(sortBy && sortType) {
        sort[sortBy] = sortType; 
      } else {
        sort['id'] = 'DESC'
      }

      const filter: any = { deleted: false };
      if(transportTypeId) {
        filter.transportType = { id: transportTypeId }
      }
      if(orderId) {
        filter.id = orderId;
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
        order: { id: 'DESC' }, 
        where: filter,
        skip: (index - 1) * size, // Skip the number of items based on the page number
        take: size,  
        relations: ['clientMerchant', 'inAdvancePriceCurrency', 'offeredPriceCurrency', 'cargoType', 'cargoStatus', 'cargoPackage', 'transportTypes', 'loadingMethod', 'transportKinds'] });
      if(orders.length) {
        return new BpmResponse(true, orders, null);
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

  async cancelOrder(id: number): Promise<BpmResponse> {
    try {
      if(!id || isNaN(id)) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const cargoStatus: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Canceled } });
      const res = await this.ordersRepository.update({ id }, { cargoStatus: cargoStatus })
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

  async offerPriceToOrder(offerDto: OrderOfferDto, userId: number): Promise<BpmResponse> {
    try {

      const isDriverBusy: boolean = await this.orderOffersRepository.exists({ where: { driver: { id: offerDto.driverId}, accepted: true } });
      if(isDriverBusy) {
        throw new BadRequestException(ResponseStauses.DriverHasOrder)
      }
     
      const isAlreadyAccepted: boolean = await this.orderOffersRepository.exists({ where: { order: { id: offerDto.orderId}, accepted: true } });
      if(isAlreadyAccepted) {
        throw new BadRequestException(ResponseStauses.AlreadyAccepted)
      }

      const offered: OrderOffer[] = await this.orderOffersRepository.find({ where: { order: { id: offerDto.orderId }, driver: { id: offerDto.driverId }, createdBy: { id: userId } } });
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

      // reject other offfers
      await this.orderOffersRepository.update({order: { id: order.id, driver: { id: driver.id } }}, { rejected: true })

      // then create new offfer
      const res = await this.orderOffersRepository.save(createOfferDto);
      await this.rmqService.sendOrderOfferMessageToClient({ userId: order.createdBy?.id, orderId: order.id})
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

  async acceptClientOffer(offerId: number): Promise<BpmResponse> {
    try {

      const offer: OrderOffer = await this.orderOffersRepository.findOneOrFail({ where: { id: offerId }, relations: ['driver', 'order'] });
      const order: Order = await this.ordersRepository.findOneOrFail({ where: { id: offer.order?.id }, relations: ['createdBy'] })
      const cargoStatus: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Accepted } });

      const isDriverBusy: boolean = await this.orderOffersRepository.exists({ where: { driver: { id: offer.driver?.id}, accepted: true } });
      if(isDriverBusy) {
        throw new BadRequestException(ResponseStauses.DriverHasOrder)
      }

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

      await this.rmqService.sendAcceptOfferMessageToClient({userId: order.createdBy?.id, orderId: offer.order.id})
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

  async getDriverOffers() {
    try {
      const offered: OrderOffer[] = await this.orderOffersRepository.find({ where: { canceled: false }, relations: ['order', 'driver', 'currency', 'orderOfferReply'] });

      return new BpmResponse(true, offered, null);
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