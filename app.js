const express = require("express");
const sequelize = require("./util/database");
const cors = require("cors");

const jwt = require("jsonwebtoken");

const user = require("./models/user");
const Request = require("./models/forgotpassword");
const expenses = require("./models/expense");
const order = require("./models/order");

const expenseRoutes = require("./routes/expense");
const paymentRoutes = require("./routes/payment");
const userRoutes = require("./routes/user");
const leaderboardRoutes = require("./routes/leaderboard");
const forgotpasswordRoutes = require("./routes/forgotpassword");

const AWS=require('aws-sdk')

function uploadTos3(data,filename){
  const BUCKET_NAME='expensetrackingapp11';
  const IAM_USER_KEY='AKIA3HM3ZRX6GTI4WOVS';
  const IAM_USER_SECRET='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';
  
  let s3bucket=new AWS.S3({
    accessKeyId:IAM_USER_KEY,
    secretAccessKey:IAM_USER_SECRET
  })

  let params={
    Bucket:BUCKET_NAME,
    Key:filename,
    Body:data,
    ACL:"public-read"
  }

  return new Promise((resolve,reject)=>{
    s3bucket.upload(params,(err,s3response)=>{
      if(err){
        console.log("Something went wrong",err)
      }else{
        console.log("Success",s3response)
        resolve(s3response.Location)
      }
    })
  })
}

app.get("/download",async(req,res)=>{
  try{
    const userId=req.user.id;
    const expenses=await products.findAll({where:{userId}})
    const stringfiedexpense=JSON.stringify(expenses)
    const filename=`Expenses${userId}/${new Date()}.txt`
    const fileUrl=await uploadTos3(stringfiedexpense,filename)
    res.status(200).json({fileUrl,success:true})
  }catch(err){
    console.log(err)
  }
})

const app = express();
app.use(express.json());

app.use(cors());

app.use((req, res, next) => {
  console.log("req", req);

  const token = req.headers.authorization;
  console.log(token);
  if (token) {
    const decodedToken = jwt.verify(token, "your-secret-key");
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

app.use("/", expenseRoutes);
app.use("/", userRoutes);
app.use("/", leaderboardRoutes);
app.use("/", paymentRoutes);
app.use("/", forgotpasswordRoutes);

user.hasMany(expenses);
expenses.belongsTo(user);

user.hasMany(order);
order.belongsTo(user);

user.hasMany(Request);
Request.belongsTo(user);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

sequelize
  .sync()
  .then((result) => {
    return user.findByPk(1);
  })
  .then((user) => {
    console.log(user);
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
