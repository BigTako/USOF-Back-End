const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');
const filtration = require('../utils/filtration');

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    const selectOptions = new ApiFeatures(req.query)
      .filter()
      .limitFields()
      .sort()
      .paginage()
      .getOptions();

    const docs = await Model.findAllPopulated(selectOptions);

    // console.log(docs);
    await res.status(200).json({
      status: 'success',
      count: docs.length,
      docs
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
    const [doc] = await Model.findAllPopulated({
      conditions: { ...selectOptions.conditions, id: req.params.id },
      fields: selectOptions.fields,
      sort: selectOptions.sort,
      paginage: selectOptions.paginate
    });
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    await res.status(200).json({
      status: 'success',
      doc
    });
  });
};

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    await res.status(201).json({
      status: 'success',
      doc
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

    if (req.user.role !== 'admin' && req.user.id !== doc.author) {
      return next(
        new AppError('You are not allowed to perform this action', 403)
      );
    }

    await doc.update(filteredBody);
    await res.status(200).json({
      status: 'success',
      doc
    });
  });

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByPk(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    if (
      !req.user ||
      (req.user.role !== 'admin' && req.user.id !== doc.author)
    ) {
      return next(
        new AppError('You are not allowed to perform this action', 403)
      );
    }

    await doc.destroy();
    await res.status(204).json({
      status: 'success',
      data: {}
    });
  });

/**
 *
 * @param {*} Model - Model of objects wanted to be get(whose who has entity_id)
 * @param {*} entityName - name of entity to be get post/comment
 * @returns
 */
exports.getEntityData = (Model, entityName) =>
  catchAsync(async (req, res, next) => {
    const selectOptions = new ApiFeatures(req.query)
      .filter()
      .limitFields()
      .sort()
      .paginage()
      .getOptions();
    console.log(selectOptions);
    // conditions, fields, sort, paginate
    const docs = await Model.findAllPopulated({
      conditions: {
        ...selectOptions.conditions,
        entity: entityName.toLowerCase(),
        entity_id: req.params.id
      },
      fields: selectOptions.fields,
      sort: selectOptions.sort,
      paginate: selectOptions.paginate
    });

    // console.log(docs);
    await res.status(200).json({
      status: 'success',
      docs
    });
  });
