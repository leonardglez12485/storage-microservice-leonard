import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt.auth.guard';

//import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: configService.get('ACCES_STOKEN_EXPIRE'),
          algorithm: 'HS256',
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtService, JwtAuthGuard],
  controllers: [AuthController],
  exports: [
    JwtModule,
    PassportModule,
    JwtService,
    JwtStrategy,
    TypeOrmModule,
    AuthService,
  ],
})
export class AuthModule {}
