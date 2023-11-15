const sequelize = require("../util/database");
const Sequelize = require("sequelize");

const Request = sequelize.define("Request", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Request;
