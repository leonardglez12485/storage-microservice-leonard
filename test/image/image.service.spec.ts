import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FirebaseService } from '../../src/services/firebase/firebase.service';
import { Repository } from 'typeorm';
import { Image } from '../../src/aplication/images/entities/image.entity';

//import * as sharp from 'sharp';
import { ImageService } from '../../src/aplication/images/images.service';
import { CreateImageDto } from '../../src/aplication/images/dto/create-image.dto';
import { User } from '../../src/auth/entities/user.entity';

describe('ImageService', () => {
  let imageService: ImageService;
  let firebaseService: FirebaseService;
  let imageRepository: Repository<Image>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: FirebaseService,
          useValue: {
            uploadFile: jest.fn(),
            getImage: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Image),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    imageService = module.get<ImageService>(ImageService);
    firebaseService = module.get<FirebaseService>(FirebaseService);
    imageRepository = module.get<Repository<Image>>(getRepositoryToken(Image));
  });

  it('should throw an error if the file is not a valid image', async () => {
    const createImageDto: CreateImageDto = {
      file: {
        fieldname: 'file',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 0,
        buffer: Buffer.from(
          'https://firebasestorage.googleapis.com/v0/b/app-demo-3875e.appspot.com/o/files%2Fthumbnail-289616650_1474241472989920_7233755254774016175_n.jpg%202024-10-18%2023%3A15%3A44?alt=media&token=37e46677-93c1-4605-a9b1-912832e387cb',
        ),
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
});
