const router = require('express').Router();

const users = require('./users');
const cards = require('./cards');

const auth = require('../middlewares/auth');
const signup = require('./signup');
const signin = require('./signin');

router.use('/signup', signup);
router.use('/signin', signin);

router.use('/users', auth, users);
router.use('/cards', auth, cards);

module.exports = router;
