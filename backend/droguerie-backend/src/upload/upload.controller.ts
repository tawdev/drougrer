import { Controller, Post, UseInterceptors, UploadedFile, UploadedFiles, BadRequestException, Req } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import type { Request } from 'express';

// Use process.cwd() to get the project root accurately
const UPLOADS_DIR = join(process.cwd(), 'uploads');

// Ensure the directory exists
mkdirSync(UPLOADS_DIR, { recursive: true });

@Controller('upload')
export class UploadController {
    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: UPLOADS_DIR,
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, callback) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    return callback(new BadRequestException('Only image files are allowed!'), false);
                }
                callback(null, true);
            },
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB limit
            },
        }),
    )
    uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
        if (!file) {
            throw new BadRequestException('File is required');
        }
        
        const url = `/uploads/${file.filename}`;
        console.log(`[Upload] File saved. Returning relative URL: ${url}`);
        
        return {
            url,
            filename: file.filename,
        };
    }

    @Post('multiple')
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            storage: diskStorage({
                destination: UPLOADS_DIR,
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, callback) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    return callback(new BadRequestException('Only image files are allowed!'), false);
                }
                callback(null, true);
            },
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB limit
            },
        }),
    )
    uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
        if (!files || files.length === 0) {
            throw new BadRequestException('Files are required');
        }

        return files.map(file => ({
            url: `/uploads/${file.filename}`,
            filename: file.filename,
        }));
    }
}
