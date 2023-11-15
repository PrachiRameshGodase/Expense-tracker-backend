const express = require("express");

const router = express.Router();

const forgotpasswordController = require("../controllers/forgotpassword");

router.post("/forgotpassword", forgotpasswordController.forgotpassword);
router.get(
  "/password/resetpassword/:requestId/:userId",
  forgotpasswordController.resetpassword
);
router.get(
  "/password/updatepassword/:userId/:requestId",
  forgotpasswordController.updatepassword
);

module.exports = router;
