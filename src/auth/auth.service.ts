import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
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

  async loginUserV2(loginUserDto: LoginUserDto) {
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

    const token = this.jwtService.sign({ _id: user.id.toString() });

    return {
      token,
    };
  }

  async loginUser(loginUserDto: LoginUserDto) {
    // Simulación de un usuario de la base de datos
    const mockUser = {
      id: '1233456789',
      email: 'test@example.com',
      isActive: true,
      validatePassword: async (password: string) => password === 'Password123',
    };

    // Simulación de la búsqueda del usuario
    const user =
      mockUser.email === loginUserDto.email.toLowerCase() ? mockUser : null;

    if (!user) {
      throw new UnauthorizedException(`Email ${loginUserDto.email} not valid`);
    }

    // Eliminamos la validación del estado del usuario
    // if (!user.isActive) {
    //   throw new HttpException('User is disabled', HttpStatus.FORBIDDEN);
    // }

    // Eliminamos la validación de la contraseña
    // const isPasswordValid = await user.validatePassword(loginUserDto.password);
    // if (!isPasswordValid) {
    //   throw new HttpException('Wrong credentials', HttpStatus.FORBIDDEN);
    // }
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

  //   private getJwtToken(payload: JwtPayloadInterface) {
  //     const token = this.jwtService.sign(payload);
  //     return token;
  //   }

  //===========================
  //===Manejando los Errores===
  //===========================
  private handleErrors(error: any): never {
    if (error.code === 11000)
      throw new BadRequestException(
        error.detail,
        'Email already exist in DB, please change it !!!',
      );
    throw new InternalServerErrorException('Please check servers logs !!!');
  }
}
