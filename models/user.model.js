// const { default: isEmail } = require('validator/lib/isEmail');
// const db = require('../models/index');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sequelize, Sequelize } = require('../models/index');
const { USER } = require('../config/db.config');

const User = sequelize.define(
  'user',
  {
    login: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    fullName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    role: {
      type: Sequelize.ENUM('user', 'admin'),
      allowNull: false,
      defaultValue: 'user'
    },
    profilePicture: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'http://127.0.0.1:3000/img/users/default.png'
    },
    rating: {
      type: Sequelize.VIRTUAL
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        len: [8, 100]
      }
    },
    passwordConfirm: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        len: [8, 100],
        isConfirmed(passwordConfirm) {
          if (passwordConfirm !== this.password) {
            throw new Error('Passwords are not the same');
          }
        }
      }
    },
    passwordCreatedAt: {
      type: Sequelize.DATE,
      allowNull: true
    },
    passwordResetToken: {
      type: Sequelize.STRING,
      allowNull: true
    },
    passwordResetTokenExpires: {
      type: Sequelize.DATE,
      allowNull: true
    },
    accountActivationToken: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: undefined
    },
    accountActivationTokenExpires: {
      type: Sequelize.DATE,
      allowNull: true
    },
    active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    activated: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize, // We need to pass the connection instance
    modelName: 'User', // We need to choose the model name
    sync: true
  }
);

// do not select password and passwordConfirm fields in output
// User.addHook('beforeFind', options => {
//   options.attributes = options.attributes || {};
//   options.attributes.exclude = ['password', 'passwordConfirm'];
// });

/**
 * Checks if passwords match.
 * Available from any object in the program.
 * @param {String} candidatePassword - raw(decrypted) password
 * @param {String} userPassword - encrypted(hashed) password from DB
 * @returns
 */
User.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// for carcade onjects inserting
User.beforeBulkCreate(async (users, options) => {
  for (let user of users) {
    if (!user.changed('password')) continue;
    user.password = await bcrypt.hash(user.password, 12);
    user.passwordChangedAt = Date.now() - 1000; // subtract a second
    user.passwordConfirm = ''; // set to undefined, because it`s raw password
  }
});

User.beforeCreate(async (user, options) => {
  if (!user.changed('password')) return;
  user.password = await bcrypt.hash(user.password, 12);
  user.passwordChangedAt = Date.now() - 1000; // subtract a second
  user.passwordConfirm = ''; // set to undefined, because it`s raw password
});

User.beforeSave(async (user, options) => {
  if (!user.changed('password')) return;
  user.password = await bcrypt.hash(user.password, 12);
  user.passwordChangedAt = Date.now() - 1000; // subtract a second
  user.passwordConfirm = ''; // set to undefined, because it`s raw password
});

/**
 * Checks if password was changed before JWT token was issued,
 * so before the login.
 * If it false, current token isn't valid.
 * @param {Number} JWTTimestamp Timestamp of time JWT token was created(login)
 * @returns {Boolean} Value of statement
 */
User.prototype.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

/**
 * Creates random password reset token to be sent to user via email.
 * Expires in 10 minutes.
 * @returns password reset token
 */
User.prototype.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000; //10 minutes

  return resetToken;
};

User.findAllPopulated = async function(options) {
  return await this.findAll({
    where: options?.conditions,
    order: options?.sort ? [options?.sort] : undefined,
    limit: options?.paginate ? options?.paginate.limit : undefined,
    offset: options?.paginate ? options?.paginate.offset : undefined,
    attributes: {
      include: options?.fields,
      exclude: ['password', 'passwordConfirm']
    }
  });
};

User.findOneActive = async function(id) {
  return await this.findOne({
    where: { id, active: true },
    attributes: [
      'id',
      'login',
      'fullName',
      'role',
      'email',
      'profilePicture',
      'createdAt'
    ]
  });
};

module.exports = User;
