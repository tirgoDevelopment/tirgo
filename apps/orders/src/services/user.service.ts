import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '..';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User) private usersRepository: Repository<User>
    ) { }

    async findUserById(id: number): Promise<User> {
        try {
           return await this.usersRepository.findOneOrFail({ where: { id } });
        } catch (err: any) {
            console.log(err)
        }
    }
}
