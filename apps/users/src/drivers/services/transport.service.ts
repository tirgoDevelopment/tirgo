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

  async addDriverTransport(files: any, transportDto: DriverTransportDto): Promise<BpmResponse> {
    try {
      if (!transportDto.driverId || isNaN(transportDto.driverId)) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const transport: DriverTransport = new DriverTransport();
      const driver: Driver = await this.driversRepository.findOneOrFail({ where: { id: transportDto.driverId } });
      
      if(transportDto.transportKindIds) {
        console.log(JSON.parse(transportDto.transportKindIds), 'transportKindIds')
        const transportKinds: TransportKind[] = await this.transportKindsRepository.find({ where: { id: In(JSON.parse(transportDto.transportKindIds)) } });
        transport.transportKinds = transportKinds;
      }
      if(transportDto.transportTypeIds) {
      console.log(JSON.parse(transportDto.transportTypeIds), 'transportTypeIds')
      const transportTypes: TransportType[] = await this.transportTypesRepository.find({ where: { id: In(JSON.parse(transportDto.transportTypeIds)) } });
      transport.transportTypes = transportTypes;
        
      }
      if(transportDto.loadingMethodIds) {
      console.log(JSON.parse(transportDto.loadingMethodIds), 'loadingMethodIds')
      const cargoLoads: CargoLoadMethod[] = await this.cargoLoadMethodsRepository.find({ where: { id: In(JSON.parse(transportDto.loadingMethodIds)) } });
      transport.cargoLoadMethods = cargoLoads;
      }
      if(transportDto.cargoTypeIds) {
      console.log(JSON.parse(transportDto.cargoTypeIds), 'cargoTypeIds')
      const cargoTypes: CargoType[] = await this.cargoTypesRepository.find({ where: { id: In(JSON.parse(transportDto.cargoTypeIds)) } });
      transport.cargoTypes = cargoTypes;
      }
      if(transportDto.cisternVolume) {
        transport.cisternVolume = transportDto.cisternVolume;
      }
      if(transportDto.containerVolume) {
        transport.containerVolume = transportDto.containerVolume;
      }

      transport.driver = driver;

      if (transportDto.name) {
        transport.name = transportDto.name;
      }
      if (transportDto.cubicCapacity) {
        transport.cubicCapacity = transportDto.cubicCapacity;
      }
      if (transportDto.stateNumber) {
        transport.stateNumber = transportDto.stateNumber;
      }
      if (transportDto.isAdr) {
        transport.isAdr = transportDto.isAdr.toString() == 'true';
      }
      if (transportDto.isHighCube) {
        transport.isHighCube = transportDto.isHighCube.toString() == 'true';
      }
      if (transportDto.refrigeratorFrom) {
        transport.refrigeratorFrom = transportDto.refrigeratorFrom;
      }
      if (transportDto.refrigeratorTo) {
        transport.refrigeratorTo = transportDto.refrigeratorTo;
      }
      if (transportDto.refrigeratorCount) {
        transport.refrigeratorCount = transportDto.refrigeratorCount;
      }
      if (transportDto.isHook) {
        transport.isHook = transportDto.isHook;
      }
      if (transportDto.loadCapacity) {
        transport.loadCapacity = transportDto.loadCapacity;
      }
      if (files) {
        const uploads: any = [];
        if (files.techPassportFrontFilePath) {
          transport.techPassportFrontFilePath = files.techPassportFrontFilePath[0].originalname.split(' ').join('');
          uploads.push(files.techPassportFrontFilePath[0])
        }
        if (files.techPassportBackFilePath) {
          transport.techPassportBackFilePath = files.techPassportBackFilePath[0].originalname.split(' ').join('');
          uploads.push(files.techPassportBackFilePath[0])
        }
        if (files.transportFrontFilePath) {
          transport.transportFrontFilePath = files.transportFrontFilePath[0].originalname.split(' ').join('');
          uploads.push(files.transportFrontFilePath[0])
        }
        if (files.transportBackFilePath) {
          transport.transportBackFilePath = files.transportBackFilePath[0].originalname.split(' ').join('');
          uploads.push(files.transportBackFilePath[0])
        }
        if (files.transportSideFilePath) {
          transport.transportSideFilePath = files.transportSideFilePath[0].originalname.split(' ').join('');
          uploads.push(files.transportSideFilePath[0])
        }
        if (files.goodsTransportationLicenseCardFilePath) {
          transport.goodsTransportationLicenseCardFilePath = files.goodsTransportationLicenseCardFilePath[0].originalname.split(' ').join('');
          uploads.push(files.goodsTransportationLicenseCardFilePath[0])
        }
        if (files.driverLicenseFilePath) {
          transport.driverLicenseFilePath = files.driverLicenseFilePath[0].originalname.split(' ').join('');
          uploads.push(files.driverLicenseFilePath[0])
        }
        if (files.passportFilePath) {
          transport.passportFilePath = files.passportFilePath[0].originalname.split(' ').join('');
          uploads.push(files.passportFilePath[0])
        }

        await Promise.all(uploads.map((file: any) => this.awsService.uploadFile(UserTypes.Driver, file)));
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

  async addDriverTransportToVerification(files: any, transportDto: DriverTransportVerificationDto): Promise<BpmResponse> {
    try {
      if (!transportDto.driverId || isNaN(transportDto.driverId)) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const transport: DriverTransport = await this.driverTransportsRepository.findOneOrFail({ where: { id: transportDto.transportId } });
      console.log(JSON.parse(transportDto.transportKindIds), 'transportKindIds')
      console.log(JSON.parse(transportDto.transportTypeIds), 'transportTypeIds')
      console.log(JSON.parse(transportDto.loadingMethodIds), 'loadingMethodIds')
      console.log(JSON.parse(transportDto.cargoTypeIds), 'cargoTypeIds')
      const driver: Driver = await this.driversRepository.findOneOrFail({ where: { id: transportDto.driverId } });
      const transportKinds: TransportKind[] = await this.transportKindsRepository.find({ where: { id: In(JSON.parse(transportDto.transportKindIds)) } });
      const transportTypes: TransportType[] = await this.transportTypesRepository.find({ where: { id: In(JSON.parse(transportDto.transportTypeIds)) } });
      const cargoLoads: CargoLoadMethod[] = await this.cargoLoadMethodsRepository.find({ where: { id: In(JSON.parse(transportDto.loadingMethodIds)) } });
      const cargoTypes: CargoType[] = await this.cargoTypesRepository.find({ where: { id: In(JSON.parse(transportDto.cargoTypeIds)) } });

      transport.transportKinds = transportKinds;
      transport.transportTypes = transportTypes;
      transport.cargoLoadMethods = cargoLoads;
      transport.cargoTypes = cargoTypes;
      transport.driver = driver;
      transport.name = transportDto.name;
      transport.cubicCapacity = transportDto.cubicCapacity;
      transport.stateNumber = transportDto.stateNumber;
      transport.isAdr = transportDto.isAdr;

      transport.refrigeratorFrom = transportDto.refrigeratorFrom || transport.refrigeratorFrom;
      transport.refrigeratorTo = transportDto.refrigeratorTo || transport.refrigeratorTo;
      transport.refrigeratorCount = transportDto.refrigeratorCount || transport.refrigeratorCount;
      transport.isHook = transportDto.isHook || transport.isHook;

      transport.requestToVerification = true;
      transport.verified = true;

      if (files) {
        const uploads: any = [];
        if (files.techPassportFrontFilePath) {
          transport.techPassportFrontFilePath = files.techPassportFrontFilePath[0].originalname.split(' ').join('');
          uploads.push(files.techPassportFrontFilePath[0])
        } else if(!transportDto.techPassportFrontFilePath) {
          throw new BadRequestException(ResponseStauses.AllFieldsRequired);
        }
        if (files.techPassportBackFilePath) {
          transport.techPassportBackFilePath = files.techPassportBackFilePath[0].originalname.split(' ').join('');
          uploads.push(files.techPassportBackFilePath[0])
        }
        else if(!transportDto.techPassportBackFilePath) {
          throw new BadRequestException(ResponseStauses.AllFieldsRequired);
        }
        if (files.transportFrontFilePath) {
          transport.transportFrontFilePath = files.transportFrontFilePath[0].originalname.split(' ').join('');
          uploads.push(files.transportFrontFilePath[0])
        }
        else if(!transportDto.transportFrontFilePath) {
          throw new BadRequestException(ResponseStauses.AllFieldsRequired);
        }
        if (files.transportBackFilePath) {
          transport.transportBackFilePath = files.transportBackFilePath[0].originalname.split(' ').join('');
          uploads.push(files.transportBackFilePath[0])
        }
        else if(!transportDto.transportBackFilePath) {
          throw new BadRequestException(ResponseStauses.AllFieldsRequired);
        }
        if (files.transportSideFilePath) {
          transport.transportSideFilePath = files.transportSideFilePath[0].originalname.split(' ').join('');
          uploads.push(files.transportSideFilePath[0])
        }
        else if(!transportDto.transportSideFilePath) {
          throw new BadRequestException(ResponseStauses.AllFieldsRequired);
        }
        if (files.goodsTransportationLicenseCardFilePath) {
          transport.goodsTransportationLicenseCardFilePath = files.goodsTransportationLicenseCardFilePath[0].originalname.split(' ').join('');
          uploads.push(files.goodsTransportationLicenseCardFilePath[0])
        }
        else if(!transportDto.goodsTransportationLicenseCardFilePath) {
          throw new BadRequestException(ResponseStauses.AllFieldsRequired);
        }
        if (files.driverLicenseFilePath) {
          transport.driverLicenseFilePath = files.driverLicenseFilePath[0].originalname.split(' ').join('');
          uploads.push(files.driverLicenseFilePath[0])
        }
        else if(!transportDto.driverLicenseFilePath) {
          throw new BadRequestException(ResponseStauses.AllFieldsRequired);
        }
        if (files.passportFilePath) {
          transport.passportFilePath = files.passportFilePath[0].originalname.split(' ').join('');
          uploads.push(files.passportFilePath[0])
        }
        else if(!transportDto.passportFilePath) {
          throw new BadRequestException(ResponseStauses.AllFieldsRequired);
        }

        await Promise.all(uploads.map((file: any) => this.awsService.uploadFile(UserTypes.Driver, file)));
      }

      driver.verified = true;
      await this.driversRepository.save(driver);
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

  async updateDriverTransport(files: any, transportDto: DriverTransportDto): Promise<BpmResponse> {
    try {
      if (!transportDto.driverId && !transportDto.id || isNaN(transportDto.driverId) && isNaN(transportDto.id)) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const transport: DriverTransport = await this.driverTransportsRepository.findOneOrFail({ where: { id: transportDto.id } });
      console.log(JSON.parse(transportDto.transportKindIds), 'transportKindIds')
      console.log(JSON.parse(transportDto.transportTypeIds), 'transportTypeIds')
      console.log(JSON.parse(transportDto.loadingMethodIds), 'loadingMethodIds')
      console.log(JSON.parse(transportDto.cargoTypeIds), 'cargoTypeIds')
      const driver: Driver = await this.driversRepository.findOneOrFail({ where: { id: transportDto.driverId } });
      const transportKinds: TransportKind[] = await this.transportKindsRepository.find({ where: { id: In(JSON.parse(transportDto.transportKindIds)) } });
      const transportTypes: TransportType[] = await this.transportTypesRepository.find({ where: { id: In(JSON.parse(transportDto.transportTypeIds)) } });
      const cargoLoads: CargoLoadMethod[] = await this.cargoLoadMethodsRepository.find({ where: { id: In(JSON.parse(transportDto.loadingMethodIds)) } });
      const cargoTypes: CargoType[] = await this.cargoTypesRepository.find({ where: { id: In(JSON.parse(transportDto.cargoTypeIds)) } });

      transport.transportKinds = transportKinds;
      transport.transportTypes = transportTypes;
      transport.cargoLoadMethods = cargoLoads;
      transport.cargoTypes = cargoTypes;
      transport.driver = driver;
      if (transportDto.name && transportDto.name != null) {
        transport.name = transportDto.name;
      }
      if (transportDto.cubicCapacity && transportDto.cubicCapacity != null) {
        transport.cubicCapacity = transportDto.cubicCapacity;
      }
      if (transportDto.stateNumber && transportDto.stateNumber != null) {
        transport.stateNumber = transportDto.stateNumber;
      }
      if (transportDto.isAdr) {
        transport.isAdr = transportDto.isAdr;
      }
      if (transportDto.isHighCube) {
        transport.isHighCube = transportDto.isHighCube.toString() == 'true';
      }
      if (transportDto.refrigeratorFrom && transportDto.refrigeratorFrom != null) {
        transport.refrigeratorFrom = transportDto.refrigeratorFrom;
      }
      if (transportDto.refrigeratorTo && transportDto.refrigeratorTo != null) {
        transport.refrigeratorTo = transportDto.refrigeratorTo;
      }
      if (transportDto.refrigeratorCount && transportDto.refrigeratorCount != null) {
        transport.refrigeratorCount = transportDto.refrigeratorCount;
      }
      if (transportDto.isHook && transportDto.isHook != null) {
        transport.isHook = transportDto.isHook;
      }
      if(transportDto.cisternVolume) {
        transport.cisternVolume = transportDto.cisternVolume;
      }
      if(transportDto.containerVolume) {
        transport.containerVolume = transportDto.containerVolume;
      }

      if (files) {
        const uploads: any = [];
        if (files.techPassportFrontFilePath) {
          transport.techPassportFrontFilePath = files.techPassportFrontFilePath[0].originalname.split(' ').join('');
          uploads.push(files.techPassportFrontFilePath[0])
        }
        if (files.techPassportBackFilePath) {
          transport.techPassportBackFilePath = files.techPassportBackFilePath[0].originalname.split(' ').join('');
          uploads.push(files.techPassportBackFilePath[0])
        }
        if (files.transportFrontFilePath) {
          transport.transportFrontFilePath = files.transportFrontFilePath[0].originalname.split(' ').join('');
          uploads.push(files.transportFrontFilePath[0])
        }
        if (files.transportBackFilePath) {
          transport.transportBackFilePath = files.transportBackFilePath[0].originalname.split(' ').join('');
          uploads.push(files.transportBackFilePath[0])
        }
        if (files.transportSideFilePath) {
          transport.transportSideFilePath = files.transportSideFilePath[0].originalname.split(' ').join('');
          uploads.push(files.transportSideFilePath[0])
        }
        if (files.goodsTransportationLicenseCardFilePath) {
          transport.goodsTransportationLicenseCardFilePath = files.goodsTransportationLicenseCardFilePath[0].originalname.split(' ').join('');
          uploads.push(files.goodsTransportationLicenseCardFilePath[0])
        }
        if (files.driverLicenseFilePath) {
          transport.driverLicenseFilePath = files.driverLicenseFilePath[0].originalname.split(' ').join('');
          uploads.push(files.driverLicenseFilePath[0])
        }
        if (files.passportFilePath) {
          transport.passportFilePath = files.passportFilePath[0].originalname.split(' ').join('');
          uploads.push(files.passportFilePath[0])
        }

        await Promise.all(uploads.map((file: any) => this.awsService.uploadFile(UserTypes.Driver, file)));
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

  async removeDriverTransport(dto: RemoveDriverTransportDto): Promise<BpmResponse> {
    try {
    
      const data = await this.driverTransportsRepository.findOneOrFail({
        where: {
          id: dto.transportId,
          driver: { id: dto.driverId}
        }
      })

      data.deleted = true;
      const res = await this.driverTransportsRepository.save(data);
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

  async changeActiveDriverTransport(dto: ChangeStatusDriverTransportDto): Promise<BpmResponse> {
    try {
      
      if(dto.status) {
        const count = await this.driverTransportsRepository.count({
           where: { 
            id: dto.transportId,
            driver: { id: dto.driverId},
            active: true
           } 
        })
        if(count > 0) {
          throw new InternalErrorException(ResponseStauses.DuplicateError, 'Driver already hase active transport');
        }
      }

      const data = await this.driverTransportsRepository.findOneOrFail({
        where: {
          id: dto.transportId,
          driver: { id: dto.driverId}
        }
      });
      data.active = dto.status;
      const res = await this.driverTransportsRepository.save(data);
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

  async getTransportByDriverId(driverId: number, transportId: number): Promise<BpmResponse> {
    try {
      if (!driverId || isNaN(driverId)) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      if (!transportId || isNaN(transportId)) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
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