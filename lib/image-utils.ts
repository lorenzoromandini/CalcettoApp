/**
 * Image cropping utilities for avatar upload
 * Uses Canvas API for client-side processing
 */

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Crop an image to the specified area and return as Blob
 * @param imageSrc - Source image URL (from FileReader)
 * @param pixelCrop - Crop coordinates from react-easy-crop
 * @returns Promise<Blob> - Cropped image as JPEG blob
 */
export function getCroppedImg(imageSrc: string, pixelCrop: CropArea): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Square output (1:1 aspect ratio from cropper)
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      // Convert to JPEG with 95% quality (per research recommendation)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas to Blob failed'));
        },
        'image/jpeg',
        0.95
      );
    };

    image.onerror = () => reject(new Error('Failed to load image'));
  });
}

/**
 * Resize image to maximum dimensions while maintaining aspect ratio
 * @param file - Input image file
 * @param maxWidth - Maximum width (default 512 for avatars)
 * @param maxHeight - Maximum height (default 512 for avatars)
 * @returns Promise<Blob> - Resized image
 */
export function resizeImage(
  file: File,
  maxWidth = 512,
  maxHeight = 512
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas to Blob failed'));
          },
          'image/jpeg',
          0.95
        );
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
