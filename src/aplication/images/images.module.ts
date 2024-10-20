import { Module } from '@nestjs/common';
import { ImageController } from './images.controller';
import { ImageService } from './images.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { AuthModule } from 'src/auth/auth.module';
import { FirebaseService } from 'src/services/firebase/firebase.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisService } from 'src/services/redis/redis.service';
//import { FirebaseService } from 'src/services/firebase/firebase.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Image]),
    ClientsModule.register([
      {
        name: 'IMAGE_CACHE',
        transport: Transport.REDIS,
        options: {
          host: 'redis-axis-leonardglez12485.k.aivencloud.com',
          port: 10886,
          retryAttempts: 500,
          retryDelay: 3000,
          connectTimeout: 10000,
          maxRetriesPerRequest: 2000,
          password: process.env.REDIS_PASSWORD,
        },
      },
    ]),
  ],
  controllers: [ImageController],
  providers: [ImageService, JwtAuthGuard, FirebaseService, RedisService],
})
export class ImagesModule {}
