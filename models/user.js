const Sequelize=require('sequelize')

const sequelize=require("../util/database")

const user=sequelize.define("users",{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    name:{
        type:Sequelize.STRING,
    },
    email:{
        type:Sequelize.STRING,
        allowNull:false,
        unique:true
    },
    password:{
        type:Sequelize.STRING,
        allowNull:false
    },
    isPremium: {
        type: Sequelize.BOOLEAN, // Set the field type explicitly as BOOLEAN
        defaultValue: false, // Set the default value as false
      },
    
});

module.exports=user;