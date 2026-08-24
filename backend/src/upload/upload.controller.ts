import { Controller, Post, Delete, Body, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname, join } from 'path';
import { unlink, readdir, writeFile } from 'fs/promises';
import type { Request } from 'express';
import sharp = require('sharp');

@Controller('upload')
export class UploadController {
  @Post('image')
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    const originalName = file.originalname;
    let filename: string;
    let buffer = file.buffer;

    if (originalName.startsWith('invoice-') || originalName.startsWith('packageslip-')) {
      filename = originalName;
    } else {
      const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
      if (file.mimetype && file.mimetype.startsWith('image/')) {
        filename = `${randomName}.webp`;
        try {
          buffer = await sharp(file.buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();
        } catch (e) {
          console.error('Sharp processing failed:', e);
          filename = `${randomName}${extname(originalName)}`;
        }
      } else {
        filename = `${randomName}${extname(originalName)}`;
      }
    }

    const filePath = join('./uploads', filename);
    await writeFile(filePath, buffer);

    const requestHost = req.get('host');
    const requestBase = req.protocol && requestHost ? `${req.protocol}://${requestHost}` : undefined;
    const configuredBase = process.env.UPLOAD_URL || process.env.API_BASE_URL || process.env.APP_URL || process.env.PUBLIC_URL || requestBase || 'http://localhost:5000';
    const baseUrl = configuredBase.replace(/\/$/, '').replace(/\/uploads$/, '');
    const uploadsBaseUrl = `${baseUrl}/uploads`;

    return {
      filename: filename,
      url: `${uploadsBaseUrl}/${filename}`,
    };
  }

  @Delete('file')
  async deleteFile(@Body('url') url: string) {
    try {
      const filename = url.split('/').pop()?.split('?')[0];
      if (!filename) throw new Error('Invalid URL');
      const filePath = join('./uploads', filename);
      await unlink(filePath);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Delete('order-files')
  async deleteOrderFiles(@Body('orderId') orderId: number) {
    try {
      const uploadsDir = './uploads';
      const files = await readdir(uploadsDir);
      const invoicePattern = `invoice-${orderId}`;
      const packagePattern = `packageslip-${orderId}`;
      
      const deletePromises = files
        .filter(file => file.startsWith(invoicePattern) || file.startsWith(packagePattern))
        .map(file => unlink(join(uploadsDir, file)).catch(e => console.log(`Failed to delete ${file}`)));
      
      await Promise.all(deletePromises);
      return { success: true, deletedCount: deletePromises.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}