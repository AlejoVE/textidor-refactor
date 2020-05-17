"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const config = require("./config");
const util = require("util");

// - setup -
const FILES_DIR = path.join(__dirname, config.FILES_DIR);
// create the express app
const app = express();

// - use middleware -
const readFile = util.promisify(fs.readFile);
const readDir = util.promisify(fs.readdir);
const writeFile = util.promisify(fs.writeFile);
// allow Cross Origin Resource Sharing
app.use(cors());
// parse the body
app.use(bodyParser.json());

// https://github.com/expressjs/morgan#write-logs-to-a-file
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
app.use(morgan("combined", { stream: accessLogStream }));
// and log to the console
app.use(morgan("dev"));

// statically serve the frontend
app.use("/", express.static(path.join(__dirname, "client")));

// ------ refactor everything from here .....
app.get("/api/files", async (req, res, next) => {
  try {
    const files = await readDir(FILES_DIR);
    res.json(files);
  } catch (err) {
    if (err && err.code === "ENOENT") {
      res.status(404).end();
      return;
    }
    if (err) {
      next(err);
      return;
    }
  }
});

// read a file
//  called by action: fetchAndLoadFile
app.get("/api/files/:name", async (req, res, next) => {
  try {
    const fileName = req.params.name;
    const fileContent = await readFile(`${FILES_DIR}/${fileName}`, "utf-8");
    const responseData = {
      name: fileName,
      text: fileContent,
    };
    res.json(responseData);
  } catch (err) {
    if (err && err.code === "ENOENT") {
      res.status(404).send("File not found").end();
      return;
    }
  }
});

// write a file
//  called by action: saveFile
app.post("/api/files/:name", async (req, res, next) => {
  try {
    const fileName = req.params.name;
    const fileContent = req.body.text;
    await writeFile(`${FILES_DIR}/${fileName}`, fileContent);
    const responseData = {
      name: fileName,
      text: fileContent,
    };

    // refactor hint:
    res.redirect(303, "/api/files").send(responseData);
    // handlers.getFiles(req, res, next);
  } catch (err) {
    if (err && err.code === "ENOENT") {
      res.status(404).end();
      return;
    }
    if (err) {
      next(err);
      return;
    }
  }
});

// delete a file
//  called by action: deleteFile
app.delete("/api/files/:name", (req, res, next) => {
  const fileName = req.params.name;
  fs.unlink(`${FILES_DIR}/${fileName}`, (err) => {
    if (err && err.code === "ENOENT") {
      res.status(404).end();
      return;
    }
    if (err) {
      next(err);
      return;
    }

    // refactor hint:
    res.redirect(303, "/api/files");
    // handlers.getFiles(req, res, next);
  });
});

// ..... to here ------

// - error handling middleware
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).end();
});

// - open server -
app.listen(config.PORT, () => {
  console.log(
    `listening at http://localhost:${config.PORT} (${config.MODE} mode)`
  );
});
