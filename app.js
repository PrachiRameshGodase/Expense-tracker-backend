const express = require("express");

const cors = require("cors");
const jwt = require("jsonwebtoken");

const user = require("./models/user");
const Request=require("./models/forgotpassword")
const sequelize = require("./util/database");
const expenses = require("./models/expense");
const expenseRoutes = require("./routes/expense");
const order = require("./models/order");
const paymentController = require("./controllers/payment");

const userRoutes = require("./routes/user");
const leaderboardRoutes = require("./routes/leaderboard");
const { v4: uuidv4 } = require('uuid');  // Add this line

require("dotenv").config();
const Sib = require("sib-api-v3-sdk");

//configure sendinblue API client with your API key
const client = Sib.ApiClient.instance;
const apiKey = client.authentications['api-key'];
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

// ...


app.post("/forgotpassword", async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email)
    // Find the user by email in the User table
    const User = await user.findOne({ where: { email } });
console.log("User",User)
    if (!User) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a new requestId (UUID) for the forgot password request
    const requestId = uuidv4();

    // Save the request details in the database with the correct userId
    await Request.create({
      id: requestId,
      isActive: true,
      userId: User.id,
    });

    // Generate the reset URL with the requestId and userId
    const resetURL = `http://localhost:3000/password/resetpassword/${requestId}/${User.id}`;

console.log("resetURL",resetURL)
    // Send the reset password email to the specified email address
    const receivers = [{ email: email }];
console.log("Receiver",receivers)
    const response = await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "Forgot Password",
      textContent: `Click on the link to reset your password: ${resetURL}`,
    });

    console.log("response",response);
    res.json({ message: "Reset password email sent successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error during forgot pass" });
  }
});


app.get("/password/resetpassword/:requestId/:userId", async (req, res) => {
  const { requestId, userId } = req.params;
  try {
    // Check if the request exists in the database and isActive is true
    const request = await Request.findOne({
      where: {
        id: requestId,
        isActive: true,
      },
    });

    if (!request || request.userId !== parseInt(userId)) {
      return res
        .status(400)
        .json({ error: "Invalid or expired reset request" });
    }

    const resetpass=res.status(200).send(`<html>
      <form action="/password/updatepassword/${userId}/${requestId}" method="get">
        <label for="newPassword">Enter New Password</label>
        <input name="newPassword" type="password" required></input>
        <button type="submit">Reset Password</button>
      </form>
    </html>`);
    console.log("reset pass",resetpass)
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Internal server error while sending form" });
  }
});

app.get("/password/updatepassword/:userId/:requestId", async (req, res) => {
  const { userId, requestId } = req.params;
  const { newPassword } = req.query;
  console.log('FINAL', userId, newPassword)

  try {
    // Find the user by userId (you can also use JWT token to get userId)
    const User = await user.findByPk(userId);

    if (!User) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's password (Don't forget to encrypt the password)
    User.password = newPassword;
    await User.save();

    // Update the request's isActive status to false
    const request = await Request.findOne({
      where: {
        id: requestId,
        userId: User.id,
      },
    });

    if (!request) {
      return res.status(400).json({ error: "Invalid or expired reset request" });
    }

    // Update the request's isActive status to false
    request.isActive = false;
    await request.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error updating password" });
  }
});


user.hasMany(expenses);
expenses.belongsTo(user);


user.hasMany(order);
order.belongsTo(user);

user.hasMany(Request);
Request.belongsTo(user)

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
