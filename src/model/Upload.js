const mongoose = require("mongoose");
const aws = require("aws-sdk");

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const spacesEndpointScality = new aws.Endpoint(process.env.SCALITY_ENDPOINT);
const s3Scality = new aws.S3({
  endpoint: spacesEndpointScality,
  accessKeyId: process.env.SCALITY_ACCESS_KEY_ID,
  secretAccessKey: process.env.SCALITY_SECRET_ACCESS_KEY,
  s3ForcePathStyle: true,
  Bucket: process.env.SCALITY_BUCKET,
});

const UploadSchema = new mongoose.Schema({
  name: String,
  size: Number,
  key: String,
  url: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UploadSchema.pre("save", function () {
  if (process.env.STORAGE_TYPE === "scality") {
    this.url = `${process.env.SCALITY_ENDPOINT}/${process.env.SCALITY_BUCKET}/${this.key}`;
  } else if (!this.url) {
    this.url = `${process.env.APP_URL}/files/${this.key}`;
  }
});
UploadSchema.pre("remove", function () {
  if (process.env.STORAGE_TYPE === "scality") {
    return new Promise((resolve, reject) => {
      s3Scality.deleteObject(
        { Bucket: process.env.SCALITY_BUCKET, Key: this.key },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    });
  } else if (process.env.STORAGE_TYPE === "local") {
    return promisify(fs.unlink)(
      path.resolve(__dirname, "..", "..", "tmp", "uploads", this.key)
    );
  }
});

module.exports = mongoose.model("Upload", UploadSchema);
