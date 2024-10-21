import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async loginUser(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException(`Email ${loginUserDto.email} not valid`);
    }

    // if (!user.isActive) {
    //   throw new HttpException('User is disabled', HttpStatus.FORBIDDEN);
    // }

    const isPasswordValid = await user.validatePassword(loginUserDto.password);
    if (!isPasswordValid) {
      throw new HttpException('Wrong credentials', HttpStatus.FORBIDDEN);
    }

    const payload = { username: user.email, sub: user.id };
    const token = this.jwtService.sign(payload, {
      expiresIn: '1h',
      secret: process.env.JWT_SECRET,
    });

    return {
      user,
      token,
    };
  }

  // async loginUserV2(loginUserDto: LoginUserDto) {
  //   //==== Simulating a database user=====//
  //   const mockUser = {
  //     id: '1233456789',
  //     email: 'test@example.com',
  //     isActive: true,
  //     validatePassword: async (password: string) => password === 'Password123',
  //   };

  //   // Simulating a search users
  //   const user =
  //     mockUser.email === loginUserDto.email.toLowerCase() ? mockUser : null;

  //   if (!user) {
  //     throw new UnauthorizedException(`Email ${loginUserDto.email} not valid`);
  //   }

  //   if (!user.isActive) {
  //     throw new HttpException('User is disabled', HttpStatus.FORBIDDEN);
  //   }

  //   const payload = { username: user.email, sub: user.id };
  //   const token = this.jwtService.sign(payload, {
  //     expiresIn: '1h',
  //     secret: process.env.JWT_SECRET,
  //   });

  //   return {
  //     user,
  //     token,
  //   };
  // }

  async findUserByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create(createUserDto);
    return this.userRepository.save(newUser);
  }
}
