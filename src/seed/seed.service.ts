import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { resolveSoa } from 'dns';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { User } from 'src/auth/entities/user.entity';
import { ValidRole } from 'src/common/enums/role.enum';
import { Repository } from 'typeorm';
//import { UUID } from 'typeorm/driver/mongodb/bson.typings';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  //Seed
  async excecuteSeed() {
    if ((await this.userRepository.find()).length === 0) {
      await this.excecuteUser();
    }
  }
  async excecuteUser(): Promise<User> {
    const user: CreateUserDto = {
      email: 'test@seed.com',
      password: 'Password123',
      fullName: 'Test User',
      isActive: true,
      roles: [ValidRole.user],
    };
    try {
      const newUser = this.userRepository.create(user);
      return this.userRepository.save(newUser);
    } catch (error) {
      throw error;
    }
  }

  //Seed Departamento
}
