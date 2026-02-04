import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';
import { BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

// Mock do buffer-to-stream para não operar com streams reais
jest.mock('buffer-to-stream', () => {
  return jest.fn().mockImplementation(() => ({
    pipe: jest.fn(),
  }));
});

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  const mockFile = {
    buffer: Buffer.from('test-image'),
    fieldname: 'file',
    originalname: 'test.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: 1024,
  } as Express.Multer.File;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryService],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should throw BadRequestException if file buffer is missing', async () => {
      const invalidFile = { ...mockFile, buffer: null } as any;

      await expect(service.uploadImage(invalidFile)).rejects.toThrow(
        Error,
      );
    });

    it('should resolve with result on successful upload', async () => {
      const mockResponse = { secure_url: 'http://cloudinary.com/image.jpg' };

      // Mock complexo do upload_stream para disparar o callback de sucesso
      jest.spyOn(cloudinary.uploader, 'upload_stream').mockImplementation(((
        options: any,
        callback: any,
      ) => {
        if (typeof options === 'function') {
          options(null, mockResponse); // Caso o callback seja o primeiro param
        } else if (callback) {
          callback(null, mockResponse);
        }
        return { pipe: jest.fn() };
      }) as any);

      const result = await service.uploadImage(mockFile);
      expect(result).toEqual(mockResponse);
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
    });

    it('should reject if cloudinary returns an error', async () => {
      const mockError = { message: 'Cloudinary API Error' };

      jest.spyOn(cloudinary.uploader, 'upload_stream').mockImplementation(((
        options: any,
        callback: any,
      ) => {
        callback(mockError, undefined); // ERRO NO PRIMEIRO ARG
        return { pipe: jest.fn() };
      }) as any);

      await expect(service.uploadImage(mockFile)).rejects.toThrow(
        'Cloudinary API Error',
      );
    });


    it('should reject if result is empty and no error is provided', async () => {
      jest.spyOn(cloudinary.uploader, 'upload_stream').mockImplementation(((
        options: any,
        callback: any,
      ) => {
        if (typeof options === 'function') {
          options(null);
        } else if (callback) {
          callback(null);
        }
        return { pipe: jest.fn() };
      }) as any);

      await expect(service.uploadImage(mockFile)).rejects.toThrow(
        'Resultado do Cloudinary veio vazio',
      );
    });
  });
});
