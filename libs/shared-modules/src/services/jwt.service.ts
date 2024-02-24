import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entites/users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class CustomJwtService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) { }

  async generateToken(payload: any): Promise<string> {
    // Generate a new JWT token with the provided payload
    return await this.jwtService.signAsync(payload, { expiresIn: '24h', secret: process.env.JWT_SECRET_KEY });
  }

  async verifyTokenAndGetPayload(token: string): Promise<any> {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });
      return decoded; // This will be the parsed payload
    } catch (error) {
      console.log(error)
      // Handle errors, such as token expiration or invalid signature
      throw new Error('Token verification failed');
    }
  }

async findUserById(id: number): Promise<User> {
    try {
       return await this.usersRepository.findOneOrFail({ where: { id } });
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