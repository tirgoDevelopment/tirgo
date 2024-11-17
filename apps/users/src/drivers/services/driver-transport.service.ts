import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
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
    private dataSource: DataSource
  ) { }

  async addDriverTransport(driverId: number, dto: DriverTransportDto): Promise<BpmResponse> {
    const queryRunner = await this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const driver: Driver = await queryRunner.manager.findOneOrFail(Driver, { where: { id: driverId } });
      const driverExistingTransports: DriverTransport[] = await queryRunner.manager.find(DriverTransport, { where: { driver: { id: driverId }, isDeleted: false } });
      
      const transport: DriverTransport = new DriverTransport();
      const isActiveTransportExists = driverExistingTransports.some((transport: DriverTransport) => transport.isMain)
      if(isActiveTransportExists) {
        if(dto.isMain !== true && dto.isMain !== false) {
          throw new BadRequestException(ResponseStauses.IsMainFieldIsReuqired);
        }
        transport.isMain = dto.isMain == true;
      } else {
        transport.isMain = true;
      }

      transport.brand = dto.brand;
      transport.driver = driver;
      transport.transportKind = await queryRunner.manager.findOneOrFail(TransportKind, { where: { id: dto.transportKindId } });

      if(dto.transportTypeId) {
        transport.transportType = await queryRunner.manager.findOneOrFail(TransportType, { where: { id: dto.transportTypeId } });
      }
      if(dto.cargoLoadMethodIds) {
        transport.cargoLoadMethods = await queryRunner.manager.find(CargoLoadMethod,{ where: { id: In(dto.cargoLoadMethodIds) } });
      }
      if(dto.volume) {
        transport.volume = dto.volume;
      }
      if(dto.capacity) {
        transport.capacity = dto.capacity;
      }
      if (dto.cubature) {
        transport.cubature = dto.cubature;
      }
      if (dto.transportNumber) {
        transport.transportNumber = dto.transportNumber;
      }
      if (dto.isAdr) {
        transport.isAdr = dto.isAdr == true;
      }
      if (dto.heightCubature) {
        transport.heightCubature = dto.heightCubature;
      }
      if (dto.refrigeratorFromCount) {
        transport.refrigeratorFromCount = dto.refrigeratorFromCount;
      }
      if (dto.refrigeratorToCount) {
        transport.refrigeratorToCount = dto.refrigeratorToCount;
      }
      if (dto.isRefrigerator) {
        transport.isRefrigerator = dto.isRefrigerator == true;
      }
      if (dto.isHook) {
        transport.isHook = dto.isHook == true;
      }
      if (dto.loadCapacity) {
        transport.loadCapacity = dto.loadCapacity;
      }

      if(isActiveTransportExists && dto.isMain == true) {
        await queryRunner.manager.update(DriverTransport, { driver: { id: driverId } }, { isMain: false });
      }
      await queryRunner.manager.save(DriverTransport, transport);
      await queryRunner.commitTransaction();
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      console.log(err)
      await queryRunner.rollbackTransaction();
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
    finally {
      await queryRunner.release();
    }
  }

  async updateDriverTransport(transportId: number, driverId: number, dto: DriverTransportDto): Promise<BpmResponse> {
    try {

      const driver: Driver = await this.driversRepository.findOneOrFail({ where: { id: driverId } });
      const transport: DriverTransport = await this.driverTransportsRepository.findOneOrFail({ where: { id: transportId } });

      transport.brand = dto.brand;
      transport.transportNumber = dto.transportNumber;
      transport.transportKind = await this.transportKindsRepository.findOneOrFail({ where: { id: dto.transportKindId } });
      transport.transportType = await this.transportTypesRepository.findOneOrFail({ where: { id: dto.transportTypeId } });

      if(dto.cargoLoadMethodIds) {
        transport.cargoLoadMethods = await this.cargoLoadMethodsRepository.find({ where: { id: In(dto.cargoLoadMethodIds) } });
      }
      if (dto.capacity && dto.capacity != null) {
        transport.capacity = dto.capacity;
      }
      if (dto.isAdr) {
        transport.isAdr = dto.isAdr;
      }
      if (dto.heightCubature) {
        transport.heightCubature = dto.heightCubature;
      }
      if (dto.refrigeratorFromCount) {
        transport.refrigeratorFromCount = dto.refrigeratorFromCount;
      }
      if (dto.refrigeratorToCount) {
        transport.refrigeratorToCount = dto.refrigeratorToCount;
      }
      if (dto.isRefrigerator) {
        transport.isRefrigerator = dto.isRefrigerator;
      }
      if (dto.isHook) {
        transport.isHook = dto.isHook;
      }
      if(dto.volume) {
        transport.volume = dto.volume;
      }
      if(dto.capacity) {
        transport.capacity = dto.capacity;
      }
      
      await this.driverTransportsRepository.save(transport);
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

  async addDriverTransportToVerification(files: any, dto: DriverTransportVerificationDto){
    try {
      // if (!dto.driverId || isNaN(dto.driverId)) {
      //   throw new BadRequestException(ResponseStauses.IdIsRequired);
      // }
      // const transport: DriverTransport = await this.driverTransportsRepository.findOneOrFail({ where: { id: dto.transportId } });
      // console.log(JSON.parse(dto.transportKindIds), 'transportKindIds')
      // console.log(JSON.parse(dto.transportTypeIds), 'transportTypeIds')
      // console.log(JSON.parse(dto.loadingMethodIds), 'loadingMethodIds')
      // console.log(JSON.parse(dto.cargoTypeIds), 'cargoTypeIds')
      // const driver: Driver = await this.driversRepository.findOneOrFail({ where: { id: dto.driverId } });
      // const transportKinds: TransportKind[] = await this.transportKindsRepository.find({ where: { id: In(JSON.parse(dto.transportKindIds)) } });
      // const transportTypes: TransportType[] = await this.transportTypesRepository.find({ where: { id: In(JSON.parse(dto.transportTypeIds)) } });
      // const cargoLoads: CargoLoadMethod[] = await this.cargoLoadMethodsRepository.find({ where: { id: In(JSON.parse(dto.loadingMethodIds)) } });
      // const cargoTypes: CargoType[] = await this.cargoTypesRepository.find({ where: { id: In(JSON.parse(dto.cargoTypeIds)) } });

      // transport.transportKinds = transportKinds;
      // transport.transportTypes = transportTypes;
      // transport.cargoLoadMethods = cargoLoads;
      // transport.cargoTypes = cargoTypes;
      // transport.driver = driver;
      // transport.name = dto.name;
      // transport.cubicCapacity = dto.cubicCapacity;
      // transport.stateNumber = dto.stateNumber;
      // transport.isAdr = dto.isAdr;

      // transport.refrigeratorFrom = dto.refrigeratorFrom || transport.refrigeratorFrom;
      // transport.refrigeratorTo = dto.refrigeratorTo || transport.refrigeratorTo;
      // transport.refrigeratorCount = dto.refrigeratorCount || transport.refrigeratorCount;
      // transport.isHook = dto.isHook || transport.isHook;

      // transport.requestToVerification = true;
      // transport.verified = true;

      // if (files) {
      //   const uploads: any = [];
      //   if (files.techPassportFrontFilePath) {
      //     transport.techPassportFrontFilePath = files.techPassportFrontFilePath[0].originalname.split(' ').join('');
      //     uploads.push(files.techPassportFrontFilePath[0])
      //   } else if(!dto.techPassportFrontFilePath) {
      //     throw new BadRequestException(ResponseStauses.AllFieldsRequired);
      //   }
      //   if (files.techPassportBackFilePath) {
      //     transport.techPassportBackFilePath = files.techPassportBackFilePath[0].originalname.split(' ').join('');
      //     uploads.push(files.techPassportBackFilePath[0])
      //   }
      //   else if(!dto.techPassportBackFilePath) {
      //     throw new BadRequestException(ResponseStauses.AllFieldsRequired);
      //   }
      //   if (files.transportFrontFilePath) {
      //     transport.transportFrontFilePath = files.transportFrontFilePath[0].originalname.split(' ').join('');
      //     uploads.push(files.transportFrontFilePath[0])
      //   }
      //   else if(!dto.transportFrontFilePath) {
      //     throw new BadRequestException(ResponseStauses.AllFieldsRequired);
      //   }
      //   if (files.transportBackFilePath) {
      //     transport.transportBackFilePath = files.transportBackFilePath[0].originalname.split(' ').join('');
      //     uploads.push(files.transportBackFilePath[0])
      //   }
      //   else if(!dto.transportBackFilePath) {
      //     throw new BadRequestException(ResponseStauses.AllFieldsRequired);
      //   }
      //   if (files.transportSideFilePath) {
      //     transport.transportSideFilePath = files.transportSideFilePath[0].originalname.split(' ').join('');
      //     uploads.push(files.transportSideFilePath[0])
      //   }
      //   else if(!dto.transportSideFilePath) {
      //     throw new BadRequestException(ResponseStauses.AllFieldsRequired);
      //   }
      //   if (files.goodsTransportationLicenseCardFilePath) {
      //     transport.goodsTransportationLicenseCardFilePath = files.goodsTransportationLicenseCardFilePath[0].originalname.split(' ').join('');
      //     uploads.push(files.goodsTransportationLicenseCardFilePath[0])
      //   }
      //   else if(!dto.goodsTransportationLicenseCardFilePath) {
      //     throw new BadRequestException(ResponseStauses.AllFieldsRequired);
      //   }
      //   if (files.driverLicenseFilePath) {
      //     transport.driverLicenseFilePath = files.driverLicenseFilePath[0].originalname.split(' ').join('');
      //     uploads.push(files.driverLicenseFilePath[0])
      //   }
      //   else if(!dto.driverLicenseFilePath) {
      //     throw new BadRequestException(ResponseStauses.AllFieldsRequired);
      //   }
      //   if (files.passportFilePath) {
      //     transport.passportFilePath = files.passportFilePath[0].originalname.split(' ').join('');
      //     uploads.push(files.passportFilePath[0])
      //   }
      //   else if(!dto.passportFilePath) {
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

  async deleteDriverTransport(driverId: number, transportId: number, user): Promise<BpmResponse> {
    try {
    
      const data = await this.driverTransportsRepository.findOneOrFail({ where: { id: transportId, driver: { id: driverId } }});

      data.isDeleted = true;
      data.deletedAt = new Date();
      data.deletedBy = user;
      await this.driverTransportsRepository.save(data);
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyDeleted]);
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
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const result = await queryRunner.manager.update(DriverTransport ,{ driver: { id: driverId } }, { isMain: false });
      if(result.affected) {
        const data = await queryRunner.manager.findOneOrFail(DriverTransport ,{ where: { id: transportId, driver: { id: driverId } }});
        data.isMain = true;
        await queryRunner.manager.save(data);
        await queryRunner.commitTransaction();
        return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError);
      }
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
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
      const transport = await this.driverTransportsRepository.createQueryBuilder(`t`)
        .leftJoinAndSelect(`t.driver`, `d`)
        .leftJoinAndSelect(`t.transportType`, `tt`)
        .leftJoinAndSelect(`t.transportKind`, `tk`)
        .leftJoinAndSelect(`t.cargoLoadMethods`, `clm`)
        .where(`t.id = :id`, { id: transportId })
        .andWhere(`d.id = :driverId`, { driverId })
        .getOneOrFail();

      return new BpmResponse(true, transport, null);
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