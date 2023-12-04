/*
  Filter - get only objects which fields satisfy given criteria(e.x. price[gte|gt|lte|lt]=2).
  Sort - sort by given object field(if fields have same value, add one more of field to sort by it).
  Limit - send to user objects only with given set of fields.
  Paginate - divide full set of objects into subsets (page or limit)
*/

const { Op } = require('sequelize');

/**
 * This function transforms query object to string with SQL query
 * @param {Object} query object with criterias to filter, example: {price: {gte: 2}}
 * @returns
 */
function transformQuery(query) {
  const transformedQuery = {};

  for (let key in query) {
    let operator = Object.keys(query[key])[0];
    let value = query[key][operator];

    if (typeof query[key] === 'string') {
      transformedQuery[key] = query[key];
    } else {
      console.log(query[key]);
      console.log(key);
      switch (operator) {
        case 'gt':
          transformedQuery[key] = { [Op.gt]: Number(value) };
          break;
        case 'gte':
          transformedQuery[key] = { [Op.gte]: Number(value) };
          break;
        case 'lt':
          transformedQuery[key] = { [Op.lt]: Number(value) };
          break;
        case 'lte':
          transformedQuery[key] = { [Op.lte]: Number(value) };
          break;
        case 'cont':
          transformedQuery[key] = {
            [Op.contains]: value.split(',').map(Number)
          };
          break;
        default:
          transformedQuery[key] = value;
      }
    }
  }

  return transformedQuery;
}

class ApiFeatures {
  constructor(query) {
    this.query = query;
    this.selectOptions = {};
  }

  filter() {
    const clearQuery = { ...this.query };
    //leave only object fields with criterias
    ['page', 'limit', 'sort', 'fields', 'order'].forEach(
      field => delete clearQuery[field]
    );

    if (Object.keys(clearQuery).length > 0) {
      this.selectOptions.conditions = transformQuery(clearQuery);
    }

    return this;
  }

  limitFields() {
    if (this.query.fields) {
      this.selectOptions.fields = this.query.fields.split(',');
    }
    return this;
  }

  sort() {
    if (this.query.sort) {
      this.selectOptions = {
        ...this.selectOptions,
        sort: [this.query.sort, this.query.order || 'asc']
      };
    }
    return this;
  }

  paginage() {
    if (this.query.page || this.query.limit) {
      const page = this.query.page * 1 || 1;
      const limit = this.query.limit * 1 || 100;
      const offset = (page - 1) * limit;

      this.selectOptions.paginate = { limit, offset };
    }
    // this.dbQuery += ` LIMIT ${limit} OFFSET ${skip}`;

    return this;
  }

  getOptions() {
    return this.selectOptions;
  }
}

module.exports = ApiFeatures;
