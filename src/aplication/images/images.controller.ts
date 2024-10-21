// image.controller.ts
import {
  Controller,
  Post,
  Get,
  UploadedFile,
  Param,
  UseGuards,
  UseInterceptors,
  Res,
  Query,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Express } from 'express';
import * as multer from 'multer';
import { ImageService } from './images.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Image } from './entities/image.entity';
import { GetImageDto } from './dto/get-image.dto';
import { User } from 'src/auth/entities/user.entity';

@ApiTags('Images')
@Controller('images')
export class ImageController {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: any,
    private readonly imageService: ImageService,
  ) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(
    FileInterceptor('filename', { storage: multer.memoryStorage() }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Upload an Image',
  })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: any,
  ): Promise<string> {
    const createImageDto = { file };
    return this.imageService.uploadImage(createImageDto, user);
  }

  @Get(':url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get an image by url',
    description:
      'Get an image based on its URL, it can be a thumbnail or a standard image',
  })
  async getImage(@Query() dto: GetImageDto, @Res() res: any): Promise<void> {
    const cacheKey = dto.url;
    const cachedImage = await this.cacheManager.get(cacheKey);

    if (cachedImage) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.send(cachedImage);
      return;
    }

    const imageBuffer = await this.imageService.getImage(dto);
    if (imageBuffer) {
      await this.cacheManager.set(cacheKey, imageBuffer, { ttl: 1000 });
      res.setHeader('Content-Type', 'image/jpeg');
      res.send(imageBuffer);
    } else {
      res.status(404).send('Image not found');
    }
  }

  @Get('user/:ownerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get the images uploaded by a user',
    description:
      'Passing a user id returns an array with all the images that have been uploaded',
  })
  async getImagesByUser(@Param('ownerId') ownerId: string): Promise<Image[]> {
    const cacheKey = `user_images_${ownerId}`;
    const cachedImages = (await this.cacheManager.get(cacheKey)) as Image[];

    if (cachedImages) {
      return cachedImages;
    }

    const images = await this.imageService.getImagesByUser(ownerId);
    if (images) {
      await this.cacheManager.set(cacheKey, images, { ttl: 60000 });
    }
    return images;
  }

  @Get('image/:search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Gets the user of the image',
    description:
      'The endpoint searches for the user who uploaded the image. You can search by the image URL, ID, or name.',
  })
  async getUserByImage(@Param('search') search: string): Promise<User> {
    const cacheKey = `image_user_${search}`;
    const cachedUser = (await this.cacheManager.get(cacheKey)) as User;

    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.imageService.getUserByImage(search);
    if (user) {
      await this.cacheManager.set(cacheKey, user, { ttl: 60000 });
    }
    return user;
  }

  @Post('delete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Delete the image',
    description: 'The endpoint searches and delete an image by url.',
  })
  async deleteImage(@Query() dto: GetImageDto): Promise<void> {
    return this.imageService.deleteImage(dto);
  }
}
