const { Router } = require("express");
const res = require("express/lib/response");
const multer = require("multer");

const multerConfig = require("../config/multerConfig");

const Upload = require("../model/Upload");

const routes = Router();

routes.get("/", async (request, response) => {
  return response.status(200).json({
    message: "Hello,world!",
    author: "André Souza (  ajjunior33 )",
    email: "ajjunior33@gmail.com",
  });
});
routes.get("/upload", async (request, response) => {
  const uploadedList = await Upload.find({});
  console.log(uploadedList);
  return response.status(200).json({
    message: "List Images",
    data: uploadedList,
    status: true,
  });
});
routes.post(
  "/upload",
  multer(multerConfig).single("file"),
  async (request, response) => {
    const { originalname: name, size, key, url = "" } = request.file;
    const create = await Upload.create({
      name,
      size,
      key,
      url,
    });
    return response.json(create);
  }
);

routes.delete("/upload/:id", async (request, response) => {
  const { id } = request.params;

  const uploadImage = await Upload.findById(id);

  await uploadImage.remove();

  return response.status(204).send();
});

module.exports = routes;
