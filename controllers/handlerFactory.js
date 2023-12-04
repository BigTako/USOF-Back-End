const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');
const Like = require('../models/like.model');
const filtration = require('../utils/filtration');

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    const selectOptions = new ApiFeatures(req.query)
      .filter()
      .limitFields()
      .sort()
      .paginage()
      .getOptions();
    const docs = await Model.findAllPopulated(
      selectOptions.conditions,
      selectOptions.fields,
      selectOptions.sort,
      selectOptions.paginate
    );
    await res.status(200).json({
      status: 'success',
      data: docs
    });
  });

exports.getOne = Model => {
  return catchAsync(async (req, res, next) => {
    const selectOptions = new ApiFeatures(req.query)
      .filter()
      .limitFields()
      .sort()
      .paginage()
      .getOptions();
    // const doc = await Model.findByPk(req.params.id);
    const [doc] = await Model.findAllPopulated(
      selectOptions.conditions,
      selectOptions.fields,
      selectOptions.sort,
      selectOptions.paginate
    );
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    await res.status(200).json({
      status: 'success',
      data: doc
    });
  });
};

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    await res.status(201).json({
      status: 'success',
      data: doc
    });
  });

exports.updateOne = (Model, allowedFields) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByPk(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    let filteredBody;
    if (allowedFields && allowedFields.length > 0) {
      filteredBody = filtration(req.body, ...allowedFields);
    } else {
      filteredBody = req.body;
    }

    if (req.user.role !== 'admin' && req.user.id !== doc.authorId) {
      return next(
        new AppError('You are not allowed to perform this action', 403)
      );
    }

    await doc.update(filteredBody);
    await res.status(200).json({
      status: 'success',
      data: doc
    });
  });

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByPk(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    if (req.user.role !== 'admin' && req.user.id !== doc.authorId) {
      return next(
        new AppError('You are not allowed to perform this action', 403)
      );
    }

    await doc.destroy();
    await res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.getEntityData = Model =>
  catchAsync(async (req, res, next) => {
    const selectOptions = new ApiFeatures(req.query)
      .filter()
      .limitFields()
      .sort()
      .paginage()
      .getOptions();

    const docs = await Model.findAllPopulated(
      { ...selectOptions.conditions, entity_id: req.params.id },
      selectOptions.fields,
      selectOptions.sort,
      selectOptions.paginate
    );

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        docs
      }
    });
  });
