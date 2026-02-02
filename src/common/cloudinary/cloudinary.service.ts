import { Injectable, BadRequestException } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import toStream from 'buffer-to-stream';

@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: 'pascom_comprovantes',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            return reject(
              new Error(error.message || 'Erro no upload do Cloudinary'),
            );
          }
          if (!result) {
            return reject(new Error('Resultado do Cloudinary veio vazio'));
          }
          resolve(result);
        },
      );

      if (!file.buffer) {
        return reject(
          new BadRequestException('Arquivo sem conteúdo (buffer vazio)'),
        );
      }

      toStream(file.buffer).pipe(upload);
    });
  }
}
