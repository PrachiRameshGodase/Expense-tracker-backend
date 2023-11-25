const express = require("express");
const router = express.Router();
const downloadController = require("../controllers/download");

router.get("/", downloadController.download);
router.get("/", downloadController.alldownload);

module.exports = router;
