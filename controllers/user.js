const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const user = require("../models/user");

const createnewUser = async (req, res) => {
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
              process.env.JWT_SECRET_KEY
            );

            res.json({
              token,
              userId: newuser.id,
              isPremium: newuser.isPremium,
            });
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
};

const loginuser = async (req, res) => {
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
            process.env.JWT_SECRET_KEY
          );

          //return token & userId
          console.log(user);
          res.json({ token, userId: user.id, isPremium: user.isPremium });
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
};

module.exports = {
  createnewUser,
  loginuser,
};
