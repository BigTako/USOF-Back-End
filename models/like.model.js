const { sequelize, Sequelize } = require('../models/index');
const { DataTypes } = require('sequelize');
const User = require('./user.model');

const Like = sequelize.define(
  'like',
  {
    author: {
      type: DataTypes.INTEGER,
      allowNull: false,
      foreignKey: true,
      references: {
        model: User,
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('like', 'dislike'),
      allowNull: false
    },
    entity: {
      type: DataTypes.ENUM('post', 'comment'),
      allowNull: false
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize, // We need to pass the connection instance
    modelName: 'Like', // We need to choose the model name,
    sync: true
  }
);

Like.findAllPopulated = async function(options) {
  return await this.findAll({
    where: options?.conditions,
    order: options?.sort ? [options?.sort] : undefined,
    limit: options?.paginate?.limit,
    offset: options?.paginate?.offset,
    attributes: options?.fields,
    include: [
      {
        model: User,
        as: 'authorInfo',
        attributes: ['id', 'login', 'profilePicture']
      }
    ]
  });
};

Like.belongsTo(User, {
  as: 'authorInfo',
  foreignKey: 'author',
  onDelete: 'CASCADE'
});
// Like.belongsTo(Post);

module.exports = Like;
