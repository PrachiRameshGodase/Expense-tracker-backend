const expense=require("../models/expense")


const getAllExpenses=async(req,res)=>{
    try{
        const expenses=await expense.findAll()
        res.json(expense)
    }catch(error){
        console.log(error)
        res.status(500)({error:"Internal server erroe"})
    }

}

const postExpense=async (req,res)=>{
    console.log(res.body)
    try{
        const {amount,category,description}=req.body

        const expense=await req.user.createExpense({
            description,
            amount,
            category
        })
        res.json(expense)
    }catch(err){
        console.log(err)
        res.status(500).json({error:"Internal server error"})
    }
}

const updateExpense=async (req,res)=>{
    console.log(req.body)

    try{
        const {id}=req.params;
        const {amount,category,description}=req.body
        const expense=await expense.findByPk(id)

        if(!expense){
            res.status(404).json({error:"expense not found"})
            return
        }

        expense.amount=amount;
        expense.category=category;
        expense.description=description

        await expense.save()
        res.json(expense)
    }catch(err){
      console.log(err)
      res.status(500).json({err:"Internal server error"})

    }
}

const deleteExpense=async(req,res)=>{
    console.log(req.body)

    try{
        const {id}=req.params

        const expense=await expense.findByPk(id)
        if(!expense){
            res.status(404).json({error:"expense not found"})
            return
        }
        await expense.destroy()
        res.json({message:"Expense is deleted"})
    }catch(err){
        console.log(err)
        res.status(500).json({error:"Internal server error"})
    }

}

module.exports={
    getAllExpenses,
    postExpense,
    updateExpense,
    deleteExpense
}