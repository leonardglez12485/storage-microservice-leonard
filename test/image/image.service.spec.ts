import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FirebaseService } from 'src/services/firebase/firebase.service';
import { RedisService } from 'src/services/redis/redis.service';
import { Repository } from 'typeorm';
import { Image } from '../../src/aplication/images/entities/image.entity';

//import * as sharp from 'sharp';
import { ImageService } from 'src/aplication/images/images.service';
import { CreateImageDto } from 'src/aplication/images/dto/create-image.dto';

describe('ImageService', () => {
  let imageService: ImageService;
  let firebaseService: FirebaseService;
  let imageRepository: Repository<Image>;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: FirebaseService,
          useValue: {
            uploadFile: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Image),
          useClass: Repository,
        },
        {
          provide: RedisService,
          useValue: {
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    imageService = module.get<ImageService>(ImageService);
    firebaseService = module.get<FirebaseService>(FirebaseService);
    imageRepository = module.get<Repository<Image>>(getRepositoryToken(Image));
    redisService = module.get<RedisService>(RedisService);
  });

  it('should throw an error if the file is not a valid image', async () => {
    const createImageDto: CreateImageDto = {
      file: {
        fieldname: 'file',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 0,
        buffer: Buffer.from(''),
        stream: null,
        destination: '',
        filename: '',
        path: '',
      },
    };
    const user = { sub: 'userId' };

    await expect(
      imageService.uploadImage(createImageDto, user),
    ).rejects.toThrow('Only image files are allowed');
  });

  it('should upload the image and return the URL if the file is valid', async () => {
    const createImageDto: CreateImageDto = {
      file: {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 0,
        buffer: Buffer.from(''),
        stream: null,
        destination: '',
        filename: '',
        path: '',
      },
    };
    const user = { sub: 'userId' };
    const uploadFileMock = jest
      .fn()
      .mockResolvedValue({ downloadURL: 'http://test-url.com' });
    firebaseService.uploadFile = uploadFileMock;

    const result = await imageService.uploadImage(createImageDto, user);

    expect(result).toBe('http://test-url.com');
    expect(uploadFileMock).toHaveBeenCalledTimes(2); // Once for the image and once for the thumbnail
  });

  it('should generate a thumbnail and upload it', async () => {
    const createImageDto: CreateImageDto = {
      file: {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 0,
        buffer: Buffer.from(''),
        stream: null,
        destination: '',
        filename: '',
        path: '',
      },
    };
    const user = { sub: 'userId' };
    const uploadFileMock = jest
      .fn()
      .mockResolvedValue({ downloadURL: 'http://test-url.com' });
    firebaseService.uploadFile = uploadFileMock;

    await imageService.uploadImage(createImageDto, user);

    expect(uploadFileMock).toHaveBeenCalledWith(
      expect.objectContaining({
        originalname: 'thumbnail-test.jpg',
      }),
    );
  });

  it('should save the image details in the repository', async () => {
    const createImageDto: CreateImageDto = {
      file: {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 0,
        buffer: Buffer.from(''),
        stream: null,
        destination: '',
        filename: '',
        path: '',
      },
    };
    const user = { sub: 'userId' };
    const uploadFileMock = jest
      .fn()
      .mockResolvedValue({ downloadURL: 'http://test-url.com' });
    firebaseService.uploadFile = uploadFileMock;
    const saveMock = jest.fn();
    imageRepository.save = saveMock;

    await imageService.uploadImage(createImageDto, user);

    expect(saveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: 'test.jpg',
        url: 'http://test-url.com',
        ownerId: 'userId',
      }),
    );
  });
});
