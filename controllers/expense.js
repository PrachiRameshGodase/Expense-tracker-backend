const Expense = require("../models/expense");
const User=require("../models/user");
const sequelize = require("../util/database");

// const ITEMS_PER_PAGE = 5;

// const getAllExpenses = async (req, res) => {
//   console.log("get expensesssssssss");
//   const {page,limit}=req.query;
//   const currentPage=parseInt(page) || 1;
//   const offset = (currentPage - 1) * parseInt(limit);
//   console.log("PAGE",page)
//   try {
//     const userId=req.user.id
//     const {count,rows:expenses}=await Expense.findAndCountAll({
//       where:{userId},
//       limit:parseInt(limit),
//       offset
//     })
//     res.status(201).json({expenses,totalItems:count})
//     console.log("get", expenses);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Internal server erroe" });
//   }
// };
const getAllExpenses=async (req, res) => {
  const { page, limit } = req.query;
  const currentPage = parseInt(page) || 1;
  const offset = (currentPage - 1) * limit;
  console.log("PAGE",page)
  try {
    const userId = req.user.id;
    const { count, rows: expenses } = await Expense.findAndCountAll({
      where: { userId },
      limit: parseInt(limit),
      offset,
    });

    res.status(201).json({ expenses, totalItems: count });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createExpense = async (req, res) => {
  const t=await sequelize.transaction()
  console.log("i am createddddddddddddddddd");
  try {
    console.log(req.body);

    const { amount, category, description} = req.body;
    console.log(req.user);
    const expense = await req.user.createExpense({
      amount,
      category,
      description,
      // totalexpense
    },{transaction:t});
    const user = await User.findByPk(req.user.id,{transaction:t});
    user.totalexpense = (user.totalexpense || 0) + parseFloat(amount); // Add the expense amount to the total or initialize to 0 if null
    await user.save({transaction:t}); // Save the updated user
await t.commit()
    res.json(expense);
    console.log(expense);
  } catch (err) {
    console.log(err);
    await t.rollback()
    res.status(500).json({ error: "Internal server error for create expense" });
  }
};

const updateExpense = async (req, res) => {
  const t=await sequelize.transaction()
  console.log(req.body);

  try {
    const { id } = req.params;
    const { amount, category, description,totalexpense } = req.body;
    const expense = await Expense.findByPk(id,{transaction:t});

    if (!expense) {
      res.status(404).json({ error: "expense not found" });
      await t.rollback()
      return;
    }
    const oldAmount = expense.amount; // getting old amount
    expense.amount = amount;
    expense.category = category;
    expense.description = description;

    await expense.save({transaction:t});

    // Fetch the user associated with the product
    const user = await User.findByPk(product.userId,{transaction:t});

    // Calculate the new totalexpense
    user.totalexpense = (user.totalexpense || 0) - oldAmount + parseFloat(amount);

    await user.save({transaction:t}); // Save the updated user
await t.commit()
    res.json(expense);
  } catch (err) {
    console.log(err);
    await t.rollback()
    res.status(500).json({ err: "Internal server error" });
  }
};

const deleteExpense = async (req, res) => {
  const t=await sequelize.transaction()
  console.log(req.body);

  try {
    const { id } = req.params;

    const expense = await Expense.findByPk(id,{transaction:t});
    if (!expense) {
      res.status(404).json({ error: "expense not found" });
      await t.rollback()
      return;
    }
    const amount=expense.amount

    //fetch the user
    const user=await User.findByPk(expense.userId,{transaction:t})

    user.totalexpense=(user.totalexpense||0)-parseFloat(amount)
    await user.save({transaction:t})
    await expense.destroy({transaction:t});
    await t.commit()
    res.json({ message: "Expense is deleted" });
  } catch (err) {
    console.log(err);
    await t.rollback()
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
