import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entites/users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTypes } from '..';


@Injectable()
export class CustomJwtService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) { }

  async generateToken(payload: any): Promise<string> {
    // Generate a new JWT token with the provided payload
    return await this.jwtService.signAsync(payload, { expiresIn: '24h', secret: 'tirgO_jWt_secre1_k3y' });
  }

  async verifyTokenAndGetPayload(token: string): Promise<any> {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: 'tirgO_jWt_secre1_k3y',
      });
      return decoded; // This will be the parsed payload
    } catch (error) {
      console.log(error)
      // Handle errors, such as token expiration or invalid signature
      throw new Error('Token verification failed');
    }
  }

async findUserById(id: number, userType: string): Promise<User> {
    try {
      const relations: string[] = ['role'];
      if(userType == 'staff') {
        relations.push('staff')
      } else if(userType == 'client') {
        relations.push('client')
      } else if(userType == 'driver') {
        relations.push('driver', 'driver.driverMerchant')
      } else if(userType == 'client_merchant_user') {
        relations.push('clientMerchantUser', 'clientMerchantUser.clientMerchant')
      } else if(userType == 'driver_merchant_user') {
        relations.push('driverMerchantUser', 'driverMerchantUser.driverMerchant')
      }

      return await this.usersRepository.findOneOrFail({ 
        select: ['id', 'userType', 'lastLogin'],
        where: { id, userType }, 
        relations
       });
    } catch (err: any) {
        console.log(err)
    }
}

async updateUserLastLogin(id: number): Promise<void> {
  try {
     await this.usersRepository.update({id}, { lastLogin: new Date() });
  } catch (err: any) {
      console.log(err)
  }
}
}