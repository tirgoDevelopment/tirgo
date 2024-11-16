import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AwsService, BadRequestException, BpmResponse, CargoLoadMethod, CargoType, Driver, DriverTransport, InternalErrorException, NoContentException, NotFoundException, ResponseStauses, SundryService, TransportKind, TransportType, UserTypes } from '../..';
import { ChangeStatusDriverTransportDto, DriverTransportDto, DriverTransportVerificationDto, RemoveDriverTransportDto } from '@app/shared-modules/entites/driver/dtos/driver-transport.dto';

@Injectable()
export class TransportsService {

  constructor(
    @InjectRepository(Driver) private readonly driversRepository: Repository<Driver>,
    @InjectRepository(DriverTransport) private readonly driverTransportsRepository: Repository<DriverTransport>,
    @InjectRepository(TransportKind) private readonly transportKindsRepository: Repository<TransportKind>,
    @InjectRepository(TransportType) private readonly transportTypesRepository: Repository<TransportType>,
    @InjectRepository(CargoLoadMethod) private readonly cargoLoadMethodsRepository: Repository<CargoLoadMethod>,
    @InjectRepository(CargoType) private readonly cargoTypesRepository: Repository<CargoType>,
    private awsService: AwsService,
    private sundriesService: SundryService
  ) { }

  async addDriverTransport(driverId: number, transportDto: DriverTransportDto): Promise<BpmResponse> {
    try {

      const driver: Driver = await this.driversRepository.findOneOrFail({ where: { id: driverId } });
      const transport: DriverTransport = new DriverTransport();
      transport.driver = driver;
      
      if(transportDto.transportKindId) {
        const transportKind: TransportKind = await this.transportKindsRepository.findOneOrFail({ where: { id: transportDto.transportKindId } });
        transport.transportKind = transportKind;
      }
      if(transportDto.transportTypeId) {
      console.log(transportDto.transportTypeId, 'transportTypeIds')
      const transportType: TransportType = await this.transportTypesRepository.findOneOrFail({ where: { id: transportDto.transportTypeId } });
      transport.transportType = transportType;
        
      }
      if(transportDto.cargoLoadMethodIds) {
      console.log(transportDto.cargoLoadMethodIds, 'loadingMethodIds')
      const cargoLoads: CargoLoadMethod[] = await this.cargoLoadMethodsRepository.find({ where: { id: In(transportDto.cargoLoadMethodIds) } });
      transport.cargoLoadMethods = cargoLoads;
      }
      if(transportDto.volume) {
        transport.volume = transportDto.volume;
      }
      if(transportDto.capacity) {
        transport.capacity = transportDto.capacity;
      }
      if (transportDto.brand) {
        transport.brand = transportDto.brand;
      }
      if (transportDto.cubature) {
        transport.cubature = transportDto.cubature;
      }
      if (transportDto.transportNumber) {
        transport.transportNumber = transportDto.transportNumber;
      }
      if (transportDto.isAdr) {
        transport.isAdr = transportDto.isAdr.toString() == 'true';
      }
      if (transportDto.heightCubature) {
        transport.heightCubature = transportDto.heightCubature;
      }
      if (transportDto.refrigeratorFromCount) {
        transport.refrigeratorFromCount = transportDto.refrigeratorFromCount;
      }
      if (transportDto.refrigeratorToCount) {
        transport.refrigeratorToCount = transportDto.refrigeratorToCount;
      }
      if (transportDto.isRefrigerator) {
        transport.isRefrigerator = transportDto.isRefrigerator;
      }
      if (transportDto.isHook) {
        transport.isHook = transportDto.isHook;
      }
      if (transportDto.loadCapacity) {
        transport.loadCapacity = transportDto.loadCapacity;
      }

      const res = await this.driverTransportsRepository.save(transport);
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      console.log(err)
      if (err instanceof HttpException) {
        throw err;
      } else if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(err.message)
      } else if (err.code === '23505') {
        throw new InternalErrorException(ResponseStauses.DuplicateError, err.message);
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async addDriverTransportToVerification(files: any, transportDto: DriverTransportVerificationDto){
    try {
      // if (!transportDto.driverId || isNaN(transportDto.driverId)) {
      //   throw new BadRequestException(ResponseStauses.IdIsRequired);
      // }
      // const transport: DriverTransport = await this.driverTransportsRepository.findOneOrFail({ where: { id: transportDto.transportId } });
      // console.log(JSON.parse(transportDto.transportKindIds), 'transportKindIds')
      // console.log(JSON.parse(transportDto.transportTypeIds), 'transportTypeIds')
      // console.log(JSON.parse(transportDto.loadingMethodIds), 'loadingMethodIds')
      // console.log(JSON.parse(transportDto.cargoTypeIds), 'cargoTypeIds')
      // const driver: Driver = await this.driversRepository.findOneOrFail({ where: { id: transportDto.driverId } });
      // const transportKinds: TransportKind[] = await this.transportKindsRepository.find({ where: { id: In(JSON.parse(transportDto.transportKindIds)) } });
      // const transportTypes: TransportType[] = await this.transportTypesRepository.find({ where: { id: In(JSON.parse(transportDto.transportTypeIds)) } });
      // const cargoLoads: CargoLoadMethod[] = await this.cargoLoadMethodsRepository.find({ where: { id: In(JSON.parse(transportDto.loadingMethodIds)) } });
      // const cargoTypes: CargoType[] = await this.cargoTypesRepository.find({ where: { id: In(JSON.parse(transportDto.cargoTypeIds)) } });

      // transport.transportKinds = transportKinds;
      // transport.transportTypes = transportTypes;
      // transport.cargoLoadMethods = cargoLoads;
      // transport.cargoTypes = cargoTypes;
      // transport.driver = driver;
      // transport.name = transportDto.name;
      // transport.cubicCapacity = transportDto.cubicCapacity;
      // transport.stateNumber = transportDto.stateNumber;
      // transport.isAdr = transportDto.isAdr;

      // transport.refrigeratorFrom = transportDto.refrigeratorFrom || transport.refrigeratorFrom;
      // transport.refrigeratorTo = transportDto.refrigeratorTo || transport.refrigeratorTo;
      // transport.refrigeratorCount = transportDto.refrigeratorCount || transport.refrigeratorCount;
      // transport.isHook = transportDto.isHook || transport.isHook;

      // transport.requestToVerification = true;
      // transport.verified = true;

      // if (files) {
      //   const uploads: any = [];
      //   if (files.techPassportFrontFilePath) {
      //     transport.techPassportFrontFilePath = files.techPassportFrontFilePath[0].originalname.split(' ').join('');
      //     uploads.push(files.techPassportFrontFilePath[0])
      //   } else if(!transportDto.techPassportFrontFilePath) {
      //     throw new BadRequestException(ResponseStauses.AllFieldsRequired);
      //   }
      //   if (files.techPassportBackFilePath) {
      //     transport.techPassportBackFilePath = files.techPassportBackFilePath[0].originalname.split(' ').join('');
      //     uploads.push(files.techPassportBackFilePath[0])
      //   }
      //   else if(!transportDto.techPassportBackFilePath) {
      //     throw new BadRequestException(ResponseStauses.AllFieldsRequired);
      //   }
      //   if (files.transportFrontFilePath) {
      //     transport.transportFrontFilePath = files.transportFrontFilePath[0].originalname.split(' ').join('');
      //     uploads.push(files.transportFrontFilePath[0])
      //   }
      //   else if(!transportDto.transportFrontFilePath) {
      //     throw new BadRequestException(ResponseStauses.AllFieldsRequired);
      //   }
      //   if (files.transportBackFilePath) {
      //     transport.transportBackFilePath = files.transportBackFilePath[0].originalname.split(' ').join('');
      //     uploads.push(files.transportBackFilePath[0])
      //   }
      //   else if(!transportDto.transportBackFilePath) {
      //     throw new BadRequestException(ResponseStauses.AllFieldsRequired);
      //   }
      //   if (files.transportSideFilePath) {
      //     transport.transportSideFilePath = files.transportSideFilePath[0].originalname.split(' ').join('');
      //     uploads.push(files.transportSideFilePath[0])
      //   }
      //   else if(!transportDto.transportSideFilePath) {
      //     throw new BadRequestException(ResponseStauses.AllFieldsRequired);
      //   }
      //   if (files.goodsTransportationLicenseCardFilePath) {
      //     transport.goodsTransportationLicenseCardFilePath = files.goodsTransportationLicenseCardFilePath[0].originalname.split(' ').join('');
      //     uploads.push(files.goodsTransportationLicenseCardFilePath[0])
      //   }
      //   else if(!transportDto.goodsTransportationLicenseCardFilePath) {
      //     throw new BadRequestException(ResponseStauses.AllFieldsRequired);
      //   }
      //   if (files.driverLicenseFilePath) {
      //     transport.driverLicenseFilePath = files.driverLicenseFilePath[0].originalname.split(' ').join('');
      //     uploads.push(files.driverLicenseFilePath[0])
      //   }
      //   else if(!transportDto.driverLicenseFilePath) {
      //     throw new BadRequestException(ResponseStauses.AllFieldsRequired);
      //   }
      //   if (files.passportFilePath) {
      //     transport.passportFilePath = files.passportFilePath[0].originalname.split(' ').join('');
      //     uploads.push(files.passportFilePath[0])
      //   }
      //   else if(!transportDto.passportFilePath) {
      //     throw new BadRequestException(ResponseStauses.AllFieldsRequired);
      //   }

      //   await Promise.all(uploads.map((file: any) => this.awsService.uploadFile(UserTypes.Driver, file)));
      // }

      // driver.verified = true;
      // await this.driversRepository.save(driver);
      // const res = await this.driverTransportsRepository.save(transport);
      // return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      console.log(err)
      if (err instanceof HttpException) {
        throw err;
      } else if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(err.message)
      } else if (err.code === '23505') {
        throw new InternalErrorException(ResponseStauses.DuplicateError, err.message);
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async updateDriverTransport(transportId: number, driverId: number, files: any, transportDto: DriverTransportDto): Promise<BpmResponse> {
    try {

      const transport: DriverTransport = await this.driverTransportsRepository.findOneOrFail({ where: { id: transportId } });
      console.log(transportDto.transportKindId, 'transportKindId')
      console.log(transportDto.transportTypeId, 'transportTypeId')
      console.log(transportDto.cargoLoadMethodIds, 'loadingMethodIds')
      console.log(transportDto.cargoLoadMethodIds, 'loadingMethodIds')

      const driver: Driver = await this.driversRepository.findOneOrFail({ where: { id: driverId } });
      const transportKind: TransportKind = await this.transportKindsRepository.findOneOrFail({ where: { id: transportDto.transportKindId } });
      const transportType: TransportType = await this.transportTypesRepository.findOneOrFail({ where: { id: transportDto.transportTypeId } });
      const cargoLoads: CargoLoadMethod[] = await this.cargoLoadMethodsRepository.find({ where: { id: In(transportDto.cargoLoadMethodIds) } });

      transport.transportKind = transportKind;
      transport.transportType = transportType;
      transport.cargoLoadMethods = cargoLoads;
      transport.driver = driver;

      if (transportDto.brand && transportDto.brand != null) {
        transport.brand = transportDto.brand;
      }
      if (transportDto.capacity && transportDto.capacity != null) {
        transport.capacity = transportDto.capacity;
      }
      if (transportDto.transportNumber && transportDto.transportNumber != null) {
        transport.transportNumber = transportDto.transportNumber;
      }
      if (transportDto.isAdr) {
        transport.isAdr = transportDto.isAdr;
      }
      if (transportDto.heightCubature) {
        transport.heightCubature = transportDto.heightCubature;
      }
      if (transportDto.refrigeratorFromCount && transportDto.refrigeratorFromCount != null) {
        transport.refrigeratorFromCount = transportDto.refrigeratorFromCount;
      }
      if (transportDto.refrigeratorToCount && transportDto.refrigeratorToCount != null) {
        transport.refrigeratorToCount = transportDto.refrigeratorToCount;
      }
      if (transportDto.isRefrigerator && transportDto.isRefrigerator != null) {
        transport.isRefrigerator = transportDto.isRefrigerator;
      }
      if (transportDto.isHook && transportDto.isHook != null) {
        transport.isHook = transportDto.isHook;
      }
      if(transportDto.volume) {
        transport.volume = transportDto.volume;
      }
      if(transportDto.capacity) {
        transport.capacity = transportDto.capacity;
      }
      

      const res = await this.driverTransportsRepository.save(transport);
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      console.log(err)
      if (err instanceof HttpException) {
        throw err;
      } else if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(err.message)
      } else if (err.code === '23505') {
        throw new InternalErrorException(ResponseStauses.DuplicateError, err.message);
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async removeDriverTransport(driverId: number, transportId: number, user): Promise<BpmResponse> {
    try {
    
      const data = await this.driverTransportsRepository.findOneOrFail({ where: { id: transportId, driver: { id: driverId } }});

      data.isDeleted = true;
      data.deletedAt = new Date();
      data.deletedBy = user;
      await this.driverTransportsRepository.save(data);
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      console.log(err)
      if (err instanceof HttpException) {
        throw err;
      } else if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(err.message)
      } else if (err.code === '23505') {
        throw new InternalErrorException(ResponseStauses.DuplicateError, err.message);
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async changeActiveDriverTransport(driverId: number, transportId: number): Promise<BpmResponse> {
    try {
      
      const result = await this.driverTransportsRepository.update({ driver: { id: driverId } }, { isMain: false });

      if(result.affected == 1) {
        const data = await this.driverTransportsRepository.findOneOrFail({ where: { id: transportId, driver: { id: driverId } }});
        data.isMain = true;
        await this.driverTransportsRepository.save(data);
        return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError);
      }
    } catch (err: any) {
      console.log(err)
      if (err instanceof HttpException) {
        throw err;
      } else if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(err.message)
      } else if (err.code === '23505') {
        throw new InternalErrorException(ResponseStauses.DuplicateError, err.message);
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async getTransportByDriverId(driverId: number, transportId: number): Promise<BpmResponse> {
    try {

      const transports: DriverTransport[] = await this.driverTransportsRepository.find({
        where: { driver: { id: driverId }, id: transportId },
        relations: ['driver', 'transportTypes', 'transportKinds', 'cargoTypes', 'cargoLoadMethods', 'transportVerification']
      })
      if (!transports.length) {
        throw new NoContentException()
      }
      return new BpmResponse(true, transports, null);
    } catch (err: any) {
      console.log(err)
      if (err instanceof HttpException) {
        throw err;
      } else if (err.name == 'EntityNotFoundError') {
        throw new NotFoundException(err.message)
      } else if (err.code === '23505') {
        throw new InternalErrorException(ResponseStauses.DuplicateError, err.message);
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }


}