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
