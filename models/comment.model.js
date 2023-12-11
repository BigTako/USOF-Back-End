const { sequelize } = require('../models/index');
const { DataTypes } = require('sequelize');
const User = require('./user.model');

const Comment = sequelize.define(
  'comment',
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
    status: {
      type: DataTypes.ENUM('active', 'unactive', 'locked'),
      allowNull: false,
      defaultValue: 'active'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [4, 1024]
      }
    },
    entity: {
      type: DataTypes.ENUM('post', 'comment'),
      allowNull: false
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    likesCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    dislikesCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    commentsCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    sequelize, // We need to pass the connection instance
    modelName: 'Comment', // We need to choose the model name,
    sync: true
  }
);

Comment.findAllPopulated = async function(conditions, sort, paginate, fields) {
  return await this.findAll({
    where: conditions,
    order: sort,
    limit: paginate?.limit,
    offset: paginate?.offset,
    attributes: fields,
    include: [
      {
        model: User,
        as: 'authorInfo',
        attributes: ['id', 'login', 'fullName', 'email', 'profilePicture']
      }
    ]
  });
};

Comment.belongsTo(User, {
  as: 'authorInfo',
  foreignKey: 'author',
  onDelete: 'CASCADE'
});

module.exports = Comment;
