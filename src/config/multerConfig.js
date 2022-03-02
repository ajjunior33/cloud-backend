const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const spacesEndpoint = new aws.Endpoint(process.env.LINODE_ENDPOINT);
const spacesEndpointScality = new aws.Endpoint(process.env.SCALITY_ENDPOINT);
const s3Scality = new aws.S3({
  endpoint: spacesEndpointScality,
  accessKeyId: process.env.SCALITY_ACCESS_KEY_ID,
  secretAccessKey: process.env.SCALITY_SECRET_ACCESS_KEY,
  s3ForcePathStyle: true,
});
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
});
const storageTypes = {
  local: multer.diskStorage({
    destination: (request, file, cb) => {
      console.log(file);
      cb(null, path.resolve(__dirname, "..", "..", "tmp", "uploads"));
    },
    filename: (request, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err);

        file.key = `${hash.toString("hex")}-${file.originalname}`;

        cb(null, file.key);
      });
    },
  }),
  linode: multerS3({
    s3: s3,
    bucket: "bucketnextcloud",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: (request, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err);

        const fileName = `${hash.toString("hex")}-${file.originalname}`;

        cb(null, fileName);
      });
    },
  }),
  scality: multerS3({
    s3: s3Scality,
    bucket: "bucket",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: (request, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err);

        const fileName = `${hash.toString("hex")}-${file.originalname}`;

        cb(null, fileName);
      });
    },
  }),
};
module.exports = {
  dest: path.resolve(__dirname, "..", "..", "tmp", "uploads"),
  storage: storageTypes[process.env.STORAGE_TYPE],
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (request, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/pjpeg",
      "image/png",
      "image/gig",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
};
