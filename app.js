const express = require("express");

const cors = require("cors");
const jwt = require("jsonwebtoken");

const user = require("./models/user");
const sequelize = require("./util/database");
const expenses = require("./models/expense");
const expenseRoutes = require("./routes/expense");
const order = require("./models/order");
const paymentController = require("./controllers/payment");

const userRoutes = require("./routes/user");
const leaderboardRoutes = require("./routes/leaderboard");

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

app.post("/razorpay/transaction", async (req, res) => {
  const token = req.headers.authorization;
  const decodedToken = jwt.verify(token, "your-secret-key");

  const userId = decodedToken.userId;

  try {
    const { keyId, orderId } = await paymentController.createRazorpayOrder(
      userId
    );
    // console.log(keyId)
    console.log(orderId);
    res.json({ keyId, orderId });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//for Transaction updated successfully"
app.put("/razorpay/transaction/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { paymentId } = req.body;

  try {
    const message = await paymentController.updateTransaction(
      orderId,
      paymentId
    );

    res.json({ message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.use("/", expenseRoutes);
app.use("/", userRoutes);
app.use("/", leaderboardRoutes);

expenses.belongsTo(user);
user.hasMany(expenses);

order.belongsTo(user);
user.hasMany(order);

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
