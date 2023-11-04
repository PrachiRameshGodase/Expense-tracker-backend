const Sequelize=require('sequelize')

const sequelize=new Sequelize('expense-tracker-app','root','Prachi@123',{
    dialect:'mysql',
    host:'localhost'
})

module.exports=sequelize