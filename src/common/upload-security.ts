import { MulterError } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';

export const ALLOWED_IMAGE_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg',
];

export function createSecureUploadOptions(fieldName: string = 'photo', maxSizeBytes: number = 10 * 1024 * 1024) {
    return {
        fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
            const isExtensionValid = Boolean(file.originalname && file.originalname.match(/^.*\.(jpg|jpeg|png|webp)$/i));
            const isMimeValid = ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype?.toLowerCase());

            if (isExtensionValid && isMimeValid) {
                cb(null, true);
            } else {
                cb(new MulterError('LIMIT_UNEXPECTED_FILE', fieldName), false);
            }
        },
        limits: { fileSize: maxSizeBytes },
        storage: require('multer').diskStorage({
            destination: './uploads',
            filename: (req: any, file: Express.Multer.File, cb: any) => {
                const ext = extname(file.originalname).toLowerCase() || '.jpg';
                const safeName = `${Date.now()}-${randomUUID()}${ext}`;
                cb(null, safeName);
            },
        }),
    };
}
