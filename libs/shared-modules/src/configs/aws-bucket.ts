import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import * as multerS3 from 'multer-s3';

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

export const multerConfig = {
    storage: multerS3({
        s3: s3,
        bucket: 'tirgo-bucket',
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, uuidv4() + '-' + file.originalname);
        },
    }),
};
