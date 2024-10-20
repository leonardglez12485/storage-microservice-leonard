import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUrl } from 'class-validator';
import { SizeImage } from 'src/common/enums/size-image.enum';

export class GetImageDto {
  @ApiProperty({
    required: true,
    description: 'Image URL',
  })
  @IsUrl()
  url: string;

  @ApiProperty({ required: true, enum: SizeImage })
  @IsEnum(SizeImage)
  @IsString()
  sizeImage: string;
}
