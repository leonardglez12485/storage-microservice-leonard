import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, HttpException } from '@nestjs/common';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';
import { User } from '../../src/auth/entities/user.entity';
import { AuthService } from '../../src/auth/auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('testToken'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should throw an error if user is not found', async () => {
    const loginUserDto: LoginUserDto = {
      email: 'test@example.com',
      password: 'password',
    };
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    await expect(authService.loginUserV2(loginUserDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw an error if password is invalid', async () => {
    const loginUserDto: LoginUserDto = {
      email: 'test@example.com',
      password: 'wrongPassword',
    };
    const user = new User();
    user.email = 'test@example.com';
    user.password = 'hashedPassword';
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
    jest.spyOn(user, 'validatePassword').mockResolvedValue(false);

    await expect(authService.loginUserV2(loginUserDto)).rejects.toThrow(
      HttpException,
    );
  });

  it('should return a token if credentials are valid', async () => {
    const loginUserDto: LoginUserDto = {
      email: 'test@example.com',
      password: 'Password',
    };
    const user = new User();
    user.id = '1';
    user.email = 'test@example.com';
    user.password = 'Password';
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
    jest.spyOn(user, 'validatePassword').mockResolvedValue(true);

    const result = await authService.loginUserV2(loginUserDto);
    expect(result).toEqual({ token: 'testToken' });
  });
});
