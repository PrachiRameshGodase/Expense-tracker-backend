const Razorpay=require('razorpay')

const Order=require("../models/order")

const User=require("../models/user")

const razorpay=new Razorpay({
    key_id:"rzp_test_EbsXg4zniCoIpx",
  key_secret:"bKLaIcxh7XaBICteJHnHGODS"
})


const createRazorpayOrder=async(userId)=>{
    try{
        //get the user from database

        const user=await User.findByPk(userId)
        if(!user){
            throw new Error("User not found")
        }


        //create a new Razorpay order
        const razorpayOrder=await razorpay.orders.create({
            amount:2000,//amount
            currency:"INR"//currency
        })
        const orderId=razorpayOrder.id;

        //save the orderId & keyId to the database or perform necessary actions

        const order=await Order.create(
            {
                paymentid:"", // Initially empty, It will be updated when the payment will be successful
                orderid:orderId,
                status:"pending",
                userId:user.id
            }
        )

        const keyId=razorpayOrder.key_id;
        return {keyId,orderId}
    }catch(err){
        console.log(err)
        throw new Error("Failed to create Razorpay order")
    }
    
    
}

const updateTransaction=async (orderId,paymentId)=>{
    try{
        //Finding the order by orderId
        const order=await Order.findOne({where:{orderid:orderId}})
        if(!order){
            throw new Error("Order not found")
        }

        //Updating the order with paymentId & status as "completed"
        order.paymentid=paymentId;
        order.status="completed"
        await order.save()

        //updating the user isPremium field to true

        const user=await User.findByPk(order.userId)
        if(user){
            user.isPremium=true;
            await user.save()
        }
        return "Transaction updated successfully"
    }catch(err){
        console.log(err)
        throw new Enumerator("Failed to update transaction")
    }

}

module.exports=
{
    createRazorpayOrder,
    updateTransaction
}