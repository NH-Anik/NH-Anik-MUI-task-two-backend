import multer from 'multer';
import path from 'path';

// Multer config with disk storage and file filter
const update = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        if (  ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.PNG') { 
            cb(new Error('File type is not supported'), false);
            return;
        }
        cb(null, true);
    }
});

export default update;