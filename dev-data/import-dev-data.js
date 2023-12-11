const fs = require('fs');

const Sequelize = require('sequelize');
const Post = require('../models/post.model');
const User = require('../models/user.model');
const Comment = require('../models/comment.model');
const Like = require('../models/like.model');
const Category = require('../models/category.model');

const dbConfig = require('./../config/db.config');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

sequelize
  .sync()
  .then(() => {
    console.log('Database connection established successfully.');
  })
  .catch(err => {
    console.log('Failed to sync db: ' + err.message);
  });

// READ JSON FILES

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/users-data.json`, 'utf-8')
);
const posts = JSON.parse(
  fs.readFileSync(`${__dirname}/posts-data.json`, 'utf-8')
);
const comments = JSON.parse(
  fs.readFileSync(`${__dirname}/comments-data.json`, 'utf-8')
);
const categories = JSON.parse(
  fs.readFileSync(`${__dirname}/categories-data.json`, 'utf-8')
);
const likes = JSON.parse(
  fs.readFileSync(`${__dirname}/likes-data.json`, 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await User.bulkCreate(users, { hooks: true });
    await Category.bulkCreate(categories, { hooks: true });
    await Post.bulkCreate(posts, { hooks: true });
    await Comment.bulkCreate(comments, { hooks: true });
    await Like.bulkCreate(likes, { hooks: true });
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Post.destroy({ where: {} });
    await sequelize.query('ALTER SEQUENCE posts_id_seq RESTART WITH 1');

    await Comment.destroy({ where: {} });
    await sequelize.query('ALTER SEQUENCE comments_id_seq RESTART WITH 1');

    await Like.destroy({ where: {} });
    await sequelize.query('ALTER SEQUENCE likes_id_seq RESTART WITH 1');

    await Category.destroy({ where: {} });
    await sequelize.query('ALTER SEQUENCE categories_id_seq RESTART WITH 1');

    await User.destroy({ where: {} });
    await sequelize.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');

    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
