const express = require("express");

const router = express.Router();

const userController = require("../controllers/user");

router.post("/signup", userController.createnewUser);
router.post("/login", userController.loginuser);

module.exports = router;
