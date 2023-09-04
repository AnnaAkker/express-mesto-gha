const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const { PORT = 3000, DB_URL = 'mongodb://localhost:27017/mestodb' } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedtopology: true,
});

// app.use((req, res, next) => {
//   req.user = {
//     _id: '64f4f3187018ac238ba5f8cf',
//   };
//   next();
// });

app.use('/users', require('./routers/users'));
app.use('/cards', require('./routers/cards'))

app.listen(PORT);
