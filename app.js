const express = require('express');
const mongoose = require('mongoose');

const { errors } = require('celebrate');

const NotFoundError = require('./errors/NotFoundError');
const handlerError = require('./middlewares/handlerErr');

const { PORT = 3000, DB_URL = 'mongodb://localhost:27017/mestodb' } = process.env;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/', require('./routers/index'));

app.use('*', (req, res, next) => {
  next(new NotFoundError('Такая страница не найдена'));
});

app.use(errors());
app.use(handlerError);
app.listen(PORT);
