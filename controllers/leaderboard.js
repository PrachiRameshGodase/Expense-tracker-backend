const user = require("../models/user");
const { Sequelize } = require("sequelize");
const sequelize = require("../util/database");
const expenses = require("../models/expense");

const getLeaderboard = async (req, res) => {
  try {
    //fetch all users from the database
    const leaderboard = await user.findAll({
      attributes: [
        "id",
        "name",
        [sequelize.fn("sum", sequelize.col("expenses.amount")), "totalExpense"],
      ],
      include: [
        {
          model: expenses,
          attributes: [],
        },
      ],
      group: ["id"],
      order: [["totalExpense", "DESC"]],
    });

    //Initialize an array to store user expenses

    // const userExpenses=[]

    // for(const user of users){

    //   const expense=await expenses.findAll({where:{userId:user.id}})

    //   const totalExpense=expense.reduce((sum,expense)=>
    //     sum+expense.amount
    //   ,0)

    //   userExpenses.push({name:user.name,totalExpense})
    // }

    // const leaderboard = userExpenses.sort((a, b) => b.totalExpense - a.totalExpense);

    res.json({ leaderboard });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Error in getting leaderboard expenxse" });
  }
};
module.exports = { getLeaderboard };
