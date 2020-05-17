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
};

// export the handlers
module.exports = handlers;
