const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const user = require("./models/user");
const sequelize = require("./util/database");

const app = express();
app.use(express.json());

app.use(cors());

app.use(async (req, res, next) => {
  try {
    console.log("req", req);

    const token = req.headers.authorization;
    console.log(token);
    if (token) {
      const decodedToken = jwt.verify(token, "your-secret-key");
      const userId = decodedToken.userId;
      console.log("userId", userId);

      const user = await user.findByPk(userId);
      if (user) {
        req.user = user;
        next();
      } else {
        throw new Error("User not found");
      }
    } else {
      next();
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//signup...........

app.post("/signup", async (req, res) => {
  try {
    console.log("sign", req.body);
    const { name, email, password } = req.body;

    //check email in our database

    const existingUser = await user.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "email already exists" });
    }

    //hash the password
    const hasPassword = await bcrypt.hash(password, 10);

    //create new user with the hashed password
    const newUser = await user.create({ name, email, password: hasPassword });

    //generate a jwt token for the new user
    const token = jwt.sign(
      {
        userId: user.id,
        name: user.name,
      },
      "your-secret-key",
      {
        expiresIn: "1h",
      }
    );

    res.json({ token, userId: newuser.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//login................

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await user.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email" });
    }

    //compare the provided password with hashpassword

    const result = await bcrypt.compare(password, user.password);
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
      {
        expiresIn: "1h",
      }
    );

    //return token & userId

    res.json({ token, userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
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
