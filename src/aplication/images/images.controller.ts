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
} from '@nestjs/common';
import { Express } from 'express';
import * as multer from 'multer';
//import * as fs from 'fs';
import { ImageService } from './images.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
//import { User } from 'src/auth/entities/user.entity';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Image } from './entities/image.entity';
//import path from 'path';
//import { SizeImage } from 'src/common/enums/size-image.enum';
import { GetImageDto } from './dto/get-image.dto';
import { User } from 'src/auth/entities/user.entity';
import { IsImageFile } from 'src/common/validator/custom.validators';
import { ValidatorConstraint } from 'class-validator';

@ApiTags('Images')
@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

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
  async getImage(@Query() dto: GetImageDto, @Res() res: any): Promise<void> {
    const imageBuffer = await this.imageService.getImage(dto);
    if (imageBuffer) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.send(imageBuffer);
    } else {
      res.status(404).send('Image not found');
    }
  }

  @Get('user/:ownerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async getImagesByUser(@Param('ownerId') ownerId: string): Promise<Image[]> {
    return this.imageService.getImagesByUser(ownerId);
  }

  @Get('image/:search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async getUserbyImage(@Param('search') search: string): Promise<User> {
    return this.imageService.getUserByImage(search);
  }
}
