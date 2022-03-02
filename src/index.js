require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path");
const cors = require('cors');

const routes = require("./routes");

const app = express();
app.use(cors());
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
});

app.use(express.json());
app.use(morgan("dev"));
app.use(
  "/files",
  express.static(path.resolve(__dirname, "..", "tmp", "uploads"))
);

app.use(routes);

app.listen(3333, () => {
  console.log("Server is Running");
});
