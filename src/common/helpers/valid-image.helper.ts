export function isValidImage(file: Express.Multer.File): boolean {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
  ];
  return allowedMimeTypes.includes(file.mimetype);
}
