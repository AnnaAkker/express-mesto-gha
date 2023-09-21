const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const HandlerError = require('./middlewares/HandlerError');

const { PORT = 3000, DB_URL = 'mongodb://localhost:27017/mestodb' } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedtopology: true,
});

app.use('/', require('./routers/index'));

app.use('*', (req, res) => {
  res.status(404).send({ message: 'Такая страница не найдена' });
});

app.use(errors());
app.use(HandlerError);
app.listen(PORT);
