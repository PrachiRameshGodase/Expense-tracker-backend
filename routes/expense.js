const express = require("express");

const router = express.Router();

const expenseController = require("../controllers/expense");

router.get("/expense", expenseController.getAllExpenses);
router.post("/expense", expenseController.createExpense);
router.put("/expense/:id", expenseController.updateExpense);
router.delete("/expense/:id", expenseController.deleteExpense);

module.exports = router;
