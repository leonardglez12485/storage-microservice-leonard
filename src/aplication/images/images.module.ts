import { Module } from '@nestjs/common';
import { ImageController } from './images.controller';
import { ImageService } from './images.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { AuthModule } from 'src/auth/auth.module';
import { FirebaseService } from 'src/services/firebase/firebase.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';
import { CacheModule } from '@nestjs/cache-manager';
import redisStore from 'cache-manager-redis-store';
import type { RedisClientOptions } from 'redis';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Image]),
    ConfigModule.forRoot(),
    CacheModule.register<RedisClientOptions>({
      store: redisStore as unknown as string,
      // Store-specific configuration:
      url: 'localhost:6379',
      //port: process.env.REDIS_PASSWORD,
    }),
  ],
  controllers: [ImageController],
  providers: [ImageService, JwtAuthGuard, FirebaseService],
})
export class ImagesModule {}
