// const express = require("express");
// const mysql = require("mysql");
// const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt")
// const sequelize = require("./util/database");
// const user = require("./models/user");
// // const expense=require("./models/expense")
// // const expenseRoutes=require("./routes/expense")
// const app = express();
// app.use(express.json());

// app.use(cors());

// app.use(async (req, res, next) => {
//   try {
//     console.log("req", req);

//     const token = req.headers.authorization;
//     console.log(token);
//     if (token) {
//       const decodedToken = jwt.verify(token, "your-secret-key");
//       const userId = decodedToken.userId;
//       console.log("userId", userId);

//       const user = await user.findByPk(userId);
//       if (user) {
//         req.user = user;
//         next();
//       } else {
//         throw new Error("User not found");
//       }
//     } else {
//       next();
//     }
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// });

// //signup...........

// app.post("/signup", async (req, res) => {
//   try {
//     console.log("sign", req.body);
//     const { name, email, password } = req.body;

//     //check email in our database

//     const existingUser = await user.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ error: "email already exists" });
//     }

//     //hash the password
//     const hasPassword = await bcrypt.hash(password, 10);

//     //create new user with the hashed password
//     const newUser = await user.create({ name, email, password: hasPassword });

//     //generate a jwt token for the new user
//     const token = jwt.sign(
//       {
//         userId: user.id,
//         name: user.name,
//       },
//       "your-secret-key",
//       {
//         expiresIn: "1h",
//       }
//     );

//     res.json({ token, userId: newuser.id });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// //login................

// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await user.findOne({ where: { email } });
//     if (!user) {
//       return res.status(401).json({ error: "Invalid email" });
//     }

//     //compare the provided password with hashpassword

//     const result = await bcrypt.compare(password, user.password);
//     if (!result) {
//       return res.status(401).json({ error: "Invalid password" });
//     }

//     //generate a jwt token

//     const token = jwt.sign(
//       {
//         userId: user.id,
//         name: user.name,
//       },
//       "your-secret-key",
//       {
//         expiresIn: "1h",
//       }
//     );

//     //return token & userId

//     res.json({ token, userId: user.id });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });



// app.use('/',expenseRoutes)

// expense.belongsTo(user)
// user.hasMany(expense)

// sequelize
//   .sync()
//   .then((result) => {
//     return user.findByPk(1);
//   })
//   .then((user) => {
//     console.log(user);
//     app.listen(3000);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const user = require("./models/user");
const sequelize = require("./util/database");
const expenses=require("./models/expense")
const expenseRoutes=require("./routes/expense");
const order=require('./models/order')
const Razorpay = require("razorpay");

const app = express();
app.use(express.json());

app.use(cors());

app.use((req, res, next) => {
  console.log("req", req);

  const token = req.headers.authorization;
  console.log(token);
  if (token) {
    const decodedToken = jwt.verify(token, "your-secret-key",);
    const userId = decodedToken.userId;
    console.log("userId", userId);

    user
      .findByPk(userId)
      .then((user) => {
        req.user = user;
        next();
      })
      .catch((err) => {
        console.log(err);
        next();
      });
  } else {
    next();
  }
});

const razorpay=new Razorpay({
  key_id:"rzp_test_EbsXg4zniCoIpx",
  key_secret:"bKLaIcxh7XaBICteJHnHGODS"
})

app.post('/razorpay/transaction',async(req,res)=>{
  const token=req.headers.authorization;
  const decodedToken=jwt.verify(token,"your-secret-key")

  const userId=decodedToken.userId

  try{

    //get the user from the database
    const user=await UserActivation.findByPk(userId)

    if(!user){
      return res.status(404).json({error:"User not found"})
    }

    //create a new Razorpay order

    const razorpay=await razorpay.orders.create({
      amount:1000,//amount,
      currency:"INR"//currency

      //add other necessary parameters for the transaction
    })

    const orderId=razorpayOrder.id;

 // Save the orderId and keyId to the database or perform necessary actions
 const order = await Order.create({
  paymentid: "", // Initially empty, will be updated later
  orderid: orderId,
  status: "pending",
  userId: user.id, // Associate the order with the user
});
const keyId=razorpayOrder.key_id
res.json({keyId,orderId})

  }catch(err){
    console.log(err)
    res.status(500).json({error:"Internal server error"})
  }
})

//for Transaction updated successfully"
app.put("/razorpay/transaction/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { paymentId } = req.body;

  try {
    // Find the order by orderId
    const order = await Order.findOne({ where: { orderid: orderId } });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update the order with paymentId and status as "completed"
    order.paymentid = paymentId;
    order.status = "completed";
    await order.save();


    //update the user isPremium filed to true

    const user=await user.findByPk(order.userId)
    if(user){
      user.isPremium=true;
      await user.save()
    }

    res.json({ message: "Transaction updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});



//signup...........

app.post("/signup", (req, res) => {
  console.log("sign", req.body);
  const { name, email, password } = req.body;

  //check email in our database

  user
    .findOne({ where: { email } })
    .then((existingUser) => {
      if (existingUser) {
        return res.status(400).json({ error: "email already exists" });
      }

      //hash the password

      bcrypt.hash(password, 10).then((hasPassword) => {
        //create new user with the hashed password
        user
          .create({ name, email, password: hasPassword })
          .then((newuser) => {
            //generate a jwt token for the new user
            const token = jwt.sign(
                {
                  userId: user.id,
                  name: user.name,
                },
                "your-secret-key",
              
              );

            res.json({ token, userId: newuser.id });
          })
          .catch((err) => {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
          });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

//login................

app.post("/login",(req, res) => {
  const { email, password } = req.body;

  user
    .findOne({ where: { email } })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Invalid email" });
      }

      //compare the provided password with hashpassword

      bcrypt
        .compare(password, user.password)
        .then((result) => {
          if (!result) {
            return res.status(401).json({ error: "Invalid password" });
          }

          //generate a jwt token

          const token = jwt.sign(
            {
              userId: user.id,
              name: user.name,
            },
            "your-secret-key",
            
          );

          //return token & userId

          res.json({ token, userId: user.id });
        })
        .catch((err) => {
          console.log(err);

          res.status(500).json({ erroe: "internal server error" });
        });
    })
    .catch((err) => {
      console.log(err);

      res.status(500).json({ erroe: "internal server error" });
    });
});
app.use('/',expenseRoutes)

expenses.belongsTo(user);
user.hasMany(expenses);


order.belongsTo(user)
user.hasMany(order)

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});


sequelize.sync()
.then((result)=>{
    return user.findByPk(1)
}).then((user)=>{
    console.log(user)
    app.listen(3000)
})
.catch((err)=>{
    console.log(err)
})

