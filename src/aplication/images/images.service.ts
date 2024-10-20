import { Injectable } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { FirebaseService } from 'src/services/firebase/firebase.service';
//import { isValidImage } from 'src/common/helpers/valid-image.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import * as sharp from 'sharp';
import Redis from 'ioredis';
import { RedisService } from 'src/services/redis/redis.service';
//import { SizeImage } from 'src/common/enums/size-image.enum';
import { GetImageDto } from './dto/get-image.dto';

@Injectable()
export class ImageService {
  private redisClient: Redis;
  constructor(
    private readonly firebaseService: FirebaseService,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly redisService: RedisService,
  ) {}

  async uploadImage(
    createImageDto: CreateImageDto,
    user: any,
  ): Promise<string> {
    const { file } = createImageDto;
    const ownerId = user.sub;

    if (!this.isValidImage(file)) {
      throw new Error('Only image files are allowed');
    }

    const url = await this.firebaseService.uploadFile(file);

    const thumbnailBuffer = await this.generateThumbnail(file.buffer);
    const thumbnailUrl = await this.firebaseService.uploadFile({
      originalname: `thumbnail-${file.originalname}`,
      buffer: thumbnailBuffer,
      fieldname: file.fieldname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      size: thumbnailBuffer.length,
      stream: file.stream,
      destination: file.destination,
      filename: file.filename,
      path: file.path,
    });

    const image = new Image();
    image.fileName = file.originalname;
    image.thumbnairURL = thumbnailUrl.downloadURL;
    image.url = url.downloadURL;
    image.ownerId = ownerId;
    image.dateCreated = new Date();

    await this.imageRepository.save(image);

    //await this.redisService.set(file.filename, image.url);

    return url;
  }

  //===Get image===
  async getImage(dto: GetImageDto): Promise<Buffer | null> {
    const { url, sizeImage } = dto;
    let width: number;
    let height: number;
    switch (sizeImage) {
      case 'large':
        width = 1080;
        height = 720;
      case 'midle':
        width = 800;
        height = 600;
      case 'min':
        width = 400;
        height = 300;
        break;

      default:
        width = 800;
        height = 600;
    }
    const imageBuffer = await this.firebaseService.getImage(url);
    if (!imageBuffer) {
      return null;
    }

    if (width || height) {
      return await sharp(imageBuffer).resize(width, height).toBuffer();
    }

    return imageBuffer;
  }

  //===Find images by user====
  async getImagesByUser(ownerId: string): Promise<Image[]> {
    return await this.imageRepository.find({ where: { ownerId } });
  }

  private async generateThumbnail(buffer: Buffer): Promise<Buffer> {
    return await sharp(buffer).resize({ width: 100, height: 100 }).toBuffer();
  }

  // async cacheImageUrl(imageId: string, imageUrl: string) {
  //   const cacheKey = `image:${imageId}`;
  //   await this.redisClient.set(cacheKey, imageUrl, 'EX', 3600); // Cache for 1 hour
  // }

  // async getCachedImageUrl(imageId: string): Promise<string | null> {
  //   const cacheKey = `image:${imageId}`;
  //   return await this.redisClient.get(cacheKey);
  // }

  private isValidImage(file: any): boolean {
    const imagePattern = /\.(jpg|jpeg|png|gif)$/i;
    return imagePattern.test(file.originalname);
  }
}
