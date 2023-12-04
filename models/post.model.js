const { sequelize, Sequelize } = require('../models/index');
const { DataTypes, Op } = require('sequelize');
const User = require('./user.model'); // replace './user.model' with the actual path to the User model
const Like = require('./like.model');
const Post = sequelize.define(
  'post',
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 128]
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
    categories: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
      defaultValue: []
    },
    likesCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    dislikesCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    commentsCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    }
  },
  {
    sequelize, // We need to pass the connection instance
    modelName: 'Post', // We need to choose the model name,
    sync: true
  }
);

Post.findAllPopulated = function(conditions, fields, sort, paginate) {
  return this.findAll({
    where: conditions,
    order: sort ? [sort] : undefined,
    limit: paginate?.limit,
    offset: paginate?.offset,
    attributes: fields,
    exclude: ['password', 'passwordConfirm'],
    include: [
      {
        model: User,
        as: 'authorInfo',
        attributes: ['id', 'login', 'email', 'profilePicture']
      }
    ]
  });
};

Post.belongsTo(User, { as: 'authorInfo', foreignKey: 'author' });
User.hasMany(Post, { as: 'posts', foreignKey: 'author' });
Post.hasMany(Like, { as: 'likes', foreignKey: 'entity_id' });

module.exports = Post;
