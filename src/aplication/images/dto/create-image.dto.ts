import { IsNotEmpty } from 'class-validator';
import { IsImageFile } from 'src/common/validator/custom.validators';

export class CreateImageDto {
  @IsNotEmpty()
  @IsImageFile({
    message: 'El archivo debe ser una imagen válida (jpeg, png, gif)',
  })
  file: Express.Multer.File;
}
