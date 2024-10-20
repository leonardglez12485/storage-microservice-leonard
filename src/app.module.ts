import { Module } from '@nestjs/common';
import { ImagesModule } from './aplication/images/images.module';
import { ConfigModule } from '@nestjs/config';
import { envConfiguration } from './aplication/config/app.config';
import { JoiValidationSchema } from './aplication/config/joi.validation';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './auth/entities/user.entity';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfiguration],
      validationSchema: JoiValidationSchema,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 8001,
      username: process.env.USER_NAME,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
    ImagesModule,
    AuthModule,
    SeedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
