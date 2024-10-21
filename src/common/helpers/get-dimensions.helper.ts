export function getImageDimensions(sizeImage: string): {
  width: number;
  height: number;
} {
  switch (sizeImage) {
    case 'large':
      return { width: 1080, height: 720 };
    case 'midle':
      return { width: 800, height: 600 };
    case 'min':
      return { width: 400, height: 300 };
    default:
      return { width: 800, height: 600 };
  }
}
