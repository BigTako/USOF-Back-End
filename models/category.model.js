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

Category.findAllPopulated = async function(options) {
  return await this.findAll({
    where: options?.conditions,
    order: options?.sort ? [options?.sort] : undefined,
    limit: options?.paginate?.limit,
    offset: options?.paginate?.offset,
    attributes: options?.fields
  });
};

module.exports = Category;
