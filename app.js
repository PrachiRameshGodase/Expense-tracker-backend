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

require("dotenv").config();
const Sib = require("sib-api-v3-sdk");

//configure sendinblue API client with your API key
const client = Sib.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.API_KEY;

const tranEmailApi = new Sib.TransactionalEmailsApi();
const sender = { name: "Prachi", email: "prachigodase2@gmail.com" };

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

app.post("/forgotpassword", async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    //send the dummy email to the specfied email address
    const recievers = [{ email: email }];

    const response = await tranEmailApi.sendTransacEmail({
      sender,
      to: recievers,
      subject: "Forgot Password",
      textContent: "This is dummy email for reset password",
    });
    console.log(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Error during forgot pass" });
  }
});

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
