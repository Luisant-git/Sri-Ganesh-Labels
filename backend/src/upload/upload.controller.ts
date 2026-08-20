import { Controller, Post, Delete, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { unlink, readdir } from 'fs/promises';
import { join } from 'path';

@Controller('upload')
export class UploadController {
  @Post('image')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const originalName = file.originalname;
        if (originalName.startsWith('invoice-') || originalName.startsWith('packageslip-')) {
          cb(null, originalName);
        } else {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        }
      },
    }),
  }))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    const baseUrl = process.env.UPLOAD_URL || 'http://localhost:4062/uploads';
    const timestamp = Date.now();
    return {
      filename: file.filename,
      url: `${baseUrl}/${file.filename}?t=${timestamp}`,
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