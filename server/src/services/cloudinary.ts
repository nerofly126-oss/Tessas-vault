import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { env } from '../config';
cloudinary.config(env.cloudinary);
export function uploadMedia(file: Express.Multer.File) {
  return new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'memory-vault',
        resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
      },
      (e, r) => (e ? reject(e) : resolve(r)),
    );
    Readable.from(file.buffer).pipe(stream);
  });
}
export const removeMedia = (publicId: string, resourceType: string) =>
  cloudinary.uploader.destroy(publicId, { resource_type: resourceType as 'image' | 'video' });
