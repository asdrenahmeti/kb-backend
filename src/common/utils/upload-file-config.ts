import { HttpException, HttpStatus } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid'; // Import for generating unique IDs

export const siteImageFile = {
  storage: diskStorage({
    destination: 'src/uploads/site-images',
    filename: (req: any, file, cb) => {
      const uniqueSuffix = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, uniqueSuffix);
    },
  }),
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|heic)$/)) {
      cb(null, true);
    } else {
      cb(
        new HttpException(`Unsupported file type`, HttpStatus.BAD_REQUEST),
        false,
      );
    }
  },
};
