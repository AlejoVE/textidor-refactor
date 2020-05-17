const fs = require("fs");
const path = require("path");
const config = require("../config");
const util = require("util");

const readFile = util.promisify(fs.readFile);
const readDir = util.promisify(fs.readdir);
const writeFile = util.promisify(fs.writeFile);
const deleteFile = util.promisify(fs.unlink);

// define FILES_DIR
const FILES_DIR = path.join(__dirname, "/..", config.FILES_DIR);

// declare the handlers
const handlers = {
  getFiles: async (req, res) => {
    try {
      const files = await readDir(FILES_DIR);
      console.log(FILES_DIR);
      res.json(files);
    } catch (err) {
      if (err && err.code === "ENOENT") {
        res.status(404).end();
        return;
      }
    }
  },

  getFile: async (req, res) => {
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
  },

  writeFile: async (req, res, next) => {
    try {
      const fileName = req.params.name;
      const fileContent = req.body.text;
      await writeFile(`${FILES_DIR}/${fileName}`, fileContent);

      // refactor hint:
      res.redirect(303, "/api/files");
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
  },
};

// export the handlers
module.exports = handlers;
