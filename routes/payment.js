const express = require("express");

const router = express.Router();

const paymentController = require("../controllers/payment");

router.post("/razorpay/transaction", paymentController.createRazorpayOrder);
router.put(
  "/razorpay/transaction/:orderId",
  paymentController.updateTransaction
);

module.exports = router;
