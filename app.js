const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const globalErrorHandler = require('./controllers/errorController');

const userRouters = require('./routes/user.routes');
const postRouters = require('./routes/post.routes');
const commentRouters = require('./routes/comment.routes');
const likeRouters = require('./routes/like.routes');
const categoryRouters = require('./routes/category.routes');
const authRouters = require('./routes/auth.routes');

const AppError = require('./utils/appError');

const app = express();
// Implement CORS
// app.use(cors());

// app.options('*', cors());

app.enable('trust proxy');

app.use(
  cors({
    origin: true, // specify the exact origin
    credentials: true
  })
);

// app.use((req, res, next) => {
//   res.header({ 'Access-Control-Allow-Origin': '*' });
//   next();
// });

// 1) GLOBAL MIDDLEWARES

// app.options('/api/v1/tours/:id', cors());

// Serving static files
app.use(express.static('public'));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too many requests from this IP, please try again in an hour!'
// });
// app.use('/api', limiter);

// Body parser, reading data from body into req.body
// app.use(express.json({ limit: '10kb' }));
app.use(express.json());
// app.use(express.urlencoded({ extended: true, limit: '10kb' })); // allows to get data from HTML form(from elements by names)
app.use(cookieParser());
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

app.use(compression()); // compress all the text sent to clients

// 3) ROUTES

app.use('/api/v1/users', userRouters);
app.use('/api/v1/posts', postRouters);
app.use('/api/v1/comments', commentRouters);
app.use('/api/v1/likes', likeRouters);
app.use('/api/v1/categories', categoryRouters);
app.use('/api/v1/auth', authRouters);
app.use(globalErrorHandler);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

module.exports = app;
