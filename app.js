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
                {
                  expiresIn: "1h",
                }
              );
              
            res.json({ token, userId: newuser.id });
          })
          .catch((err) => {
            console.error(error);
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
            {
              expiresIn: "1h",
            }
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
