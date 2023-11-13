const Expense = require("../models/expense");

const getAllExpenses = async (req, res) => {
  console.log("get expensesssssssss");
  try {
    const expenses = await Expense.findAll();
    res.json(expenses);
    console.log("get", expenses);
  } catch (error) {
    console.log(error);
    res.status(500)({ error: "Internal server erroe" });
  }
};

const createExpense = async (req, res) => {
  console.log("i am createddddddddddddddddd");
  try {
    console.log(req.body);

    const { amount, category, description } = req.body;
    console.log(req.user);
    const expense = await req.user.createExpense({
      amount,
      category,
      description,
    });
    res.json(expense);
    console.log(expense);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error for create expense" });
  }
};

const updateExpense = async (req, res) => {
  console.log(req.body);

  try {
    const { id } = req.params;
    const { amount, category, description } = req.body;
    const expense = await Expense.findByPk(id);

    if (!expense) {
      res.status(404).json({ error: "expense not found" });
      return;
    }

    expense.amount = amount;
    expense.category = category;
    expense.description = description;

    await expense.save();
    res.json(expense);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Internal server error" });
  }
};

const deleteExpense = async (req, res) => {
  console.log(req.body);

  try {
    const { id } = req.params;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      res.status(404).json({ error: "expense not found" });
      return;
    }
    await expense.destroy();
    res.json({ message: "Expense is deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
