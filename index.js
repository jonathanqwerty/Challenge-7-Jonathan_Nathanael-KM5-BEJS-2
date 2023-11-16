const express = require("express"),
  app = express(),
  PORT = process.env.PORT || 3000,
  cors = require("cors"),
  router = require("./routers"),
  bodyParser = require("body-parser");

require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.set("views", "./views");
app.set("view engine", "ejs");
app.use(router);

app.listen(PORT, () => console.log(`Server running at PORT ${PORT}`));
