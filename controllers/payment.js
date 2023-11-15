const Razorpay = require("razorpay");
const Order = require("../models/order");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const razorpay = new Razorpay({
  key_id: "rzp_test_EbsXg4zniCoIpx",
  key_secret: "bKLaIcxh7XaBICteJHnHGODS",
});

const createRazorpayOrder = async (req, res) => {
  const token = req.headers.authorization;
  try {
    //get the user from database
    const decodedToken = jwt.verify(token, "your-secret-key");
    const userId = decodedToken.userId;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    //create a new Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: 500, //amount
      currency: "INR", //currency
    });
    console.log("razorpay form payment", razorpayOrder);
    const orderId = razorpayOrder.id;

    //save the orderId & keyId to the database or perform necessary actions

    const order = await Order.create({
      paymentid: "", // Initially empty, It will be updated when the payment will be successful
      orderid: orderId,
      status: "pending",
      userId: user.id,
    });

    const keyId = razorpay.key_id;
    console.log(orderId);
    console.log(keyId);
    res.json({ orderId, keyId });
    // return res.status(201).json({order,key_id:razorpayOrder.key_id})
  } catch (err) {
    console.log(err);

    res
      .status(500)
      .json({ message: "Something went wrong in create order", error: err });
  }
};

const updateTransaction = async (req, res) => {
  const { orderId } = req.params;
  const { paymentId } = req.body;
  try {
    //Finding the order by orderId
    const order = await Order.findOne({ where: { orderid: orderId } });
    if (!order) {
      res.json({ message: "Order not found" });
    }

    //Updating the order with paymentId & status as "completed"
    order.paymentid = paymentId;
    order.status = "completed";
    await order.save();

    //updating the user isPremium field to true

    const user = await User.findByPk(order.userId);
    if (user) {
      user.isPremium = true;
      await user.save();
    }
    res.json({ message: "Transaction updated successfully" });
  } catch (err) {
    console.log(err);
    // throw new Enumerator("Failed to update transaction");
    res.json({ err: "Failed to update transaction" });
  }
};

module.exports = {
  createRazorpayOrder,
  updateTransaction,
};
