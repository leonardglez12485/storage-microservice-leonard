import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsImageFileConstraint implements ValidatorConstraintInterface {
  validate(file: Express.Multer.File) {
    if (!file) return false;
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
    ];
    return allowedMimeTypes.includes(file.mimetype);
  }

  defaultMessage() {
    return 'El archivo debe ser una imagen (jpeg, png, gif)';
  }
}

export function IsImageFile(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsImageFileConstraint,
    });
  };
}
