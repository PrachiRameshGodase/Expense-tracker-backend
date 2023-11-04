const sequelize=require('sequelize')

const Sequelize=require("sequelize") 

const expense=sequelize.define("expense",{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    amount:{
        type:Sequelize.DOUBLE,
        allowNull:false
    },
    category:{
        type:Sequelize.STRING,
        allowNull:false
    },
    description:
        Sequelize.STRING
    
})
module.exports=expense;