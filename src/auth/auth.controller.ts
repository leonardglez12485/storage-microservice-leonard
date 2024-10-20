import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('Authorize')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    const userExists = await this.authService.findUserByEmail(
      createUserDto.email,
    );

    if (userExists) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await this.authService.hashPassword(
      createUserDto.password,
    );

    const newUser = await this.authService.createUser({
      id: uuidv4(),
      ...createUserDto,
      password: hashedPassword,
    });

    return newUser;
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  //   @Get('users')
  //   @ApiOperation({
  //     summary: 'This endpoint is only for ADMIN',
  //     description: '## IMPORTANT Only get the Active Users',
  //   })
  //   findAll() {
  //     return this.authService.findAll();
  //   }

  //   @Get('private')
  //   @UseGuards(AuthGuard())
  //   testingPrivateRoute(
  //     @GetUser() user: User,
  //     @GetUser('email') userEmail: string,
  //     @RawHeaders() rawHeaders: string[],
  //     @RawHeaders(1) token: string,
  //   ) {
  //     return {
  //       ok: true,
  //       rawHeaders,
  //       token,
  //       user,
  //       userEmail,
  //     };
  //   }

  //@SetMetadata('roles',['admin', 'user-admin'])
  //   @Get('private2')
  //   @RoleProtected(ValidRoles.admin)
  //   @UseGuards(AuthGuard(), UserRolesGuard)
  //   privateRute2(@GetUser() user: User) {
  //     return {
  //       ok: true,
  //       user,
  //     };
  //   }

  //   @Get('private3')
  //   @Auth()
  //   privateRute3(@GetUser() user: User) {
  //     return {
  //       ok: true,
  //       user,
  //     };
  //   }

  // ===================================================
  // ===================================================
}
// function AuthGuard(): Function | import('@nestjs/common').CanActivate {
//   throw new Error('Function not implemented.');
// }

// function GetUser(): (
//   target: AuthController,
//   propertyKey: 'testingPrivateRoute',
//   parameterIndex: 0,
// ) => void {
//   throw new Error('Function not implemented.');
// }
