const Razorpay = require("razorpay");
const Order = require("../models/order");
const User = require("../models/user");

const razorpay = new Razorpay({
  key_id: "rzp_test_EbsXg4zniCoIpx",
  key_secret: "bKLaIcxh7XaBICteJHnHGODS",
});

const createRazorpayOrder = async (userId, req, res) => {
  try {
    //get the user from database

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    //create a new Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      // key_id:"rzp_test_EbsXg4zniCoIpx",
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
    return { orderId, keyId };
    // return res.status(201).json({order,key_id:razorpayOrder.key_id})
  } catch (err) {
    console.log(err);
    throw new Error("Failed to create Razorpay order");
    // res.status(403).json({message:"Something went wrong in create order",error:err})
  }
};
// const createRazorpayOrder=async(req,res,next)=>{
//     console.log("createorderrrrrrrr")
//     try{
//         const rspay=new Razorpay({
//             key_id:"rzp_test_EbsXg4zniCoIpx",
//             key_secret:"bKLaIcxh7XaBICteJHnHGODS"
//         })
//         const amount=500;
//         rspay.orders.create({
//             amount:amount,
//             currency:"INR"
//         },(err,order)=>{
//             if(err){
//                 throw new Error(JSON.stringify(err))
//             }else{
//                 req.user.
//                 createRazorpayOrder({orderId:order.id,status:"PENDING"})
//                 .then((result)=>{
//                     return res.status(201).json({order,key_id:rspay.key_id})
//                 })
//             }
//         })
//     }catch(err)
//     {
//         console.log(err)
//         res.status(401).json({err:"some error in createorder"})
//     }
// }

const updateTransaction = async (orderId, paymentId) => {
  try {
    //Finding the order by orderId
    const order = await Order.findOne({ where: { orderid: orderId } });
    if (!order) {
      throw new Error("Order not found");
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
    return "Transaction updated successfully";
  } catch (err) {
    console.log(err);
    throw new Enumerator("Failed to update transaction");
  }
};

module.exports = {
  createRazorpayOrder,
  updateTransaction,
};
