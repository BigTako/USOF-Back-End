const Category = require('../models/category.model');

const handlerFactory = require('./handlerFactory');

exports.getAllCategories = handlerFactory.getAll(Category);

exports.createCategory = handlerFactory.createOne(Category);

exports.getCategory = handlerFactory.getOne(Category);
exports.updateCategory = handlerFactory.updateOne(Category);
exports.deleteCategory = handlerFactory.deleteOne(Category);
