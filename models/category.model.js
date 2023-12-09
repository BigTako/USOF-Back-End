const { sequelize, Sequelize } = require('../models/index');
const { DataTypes } = require('sequelize');

const Category = sequelize.define(
  'category',
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 128]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1024]
      }
    }
  },
  {
    sequelize, // We need to pass the connection instance
    modelName: 'Category', // We need to choose the model name,
    sync: true
  }
);

Category.findAllPopulated = async function(conditions, sort, paginate, fields) {
  return await this.findAll({
    where: conditions,
    order: sort,
    limit: paginate?.limit,
    offset: paginate?.offset,
    attributes: fields
  });
};

module.exports = Category;
