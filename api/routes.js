// require the handlers
const handlers = require("./handlers");
const express = require("express");

// build the router
const router = express.Router();

router.get("/", (req, res) => {
  res.send("files API!");
});

// add routes to router
router.get("/api/files", handlers.getFiles);
router.get("/api/files/:name", handlers.getFile);
router.post("/api/files/:name", handlers.writeFile);
// export the router
module.exports = router;
