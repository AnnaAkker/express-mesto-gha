const { HTTP_STATUS_OK, HTTP_STATUS_CREATED } = require('http2').constants;
const mongoose = require('mongoose');

const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

const Card = require('../models/card');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.status(HTTP_STATUS_OK).send(cards))
    .catch(next);
};

module.exports.addCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      Card.findById(card._id)
        .orFail(new NotFoundError('Карточка с таким _id не найдена.'))
        .populate('owner')
        .then((data) => res.status(HTTP_STATUS_CREATED).send(data))
        .catch(next);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError(err.message));
      } else {
        next(err);
      }
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError(`Карточка с таким _id: ${req.params.cardId} не найдена.`);
      }
      if (!card.owner.equals(req.user._id)) {
        throw new ForbiddenError('Карточка другого пользователя');
      }
      return Card.deleteOne({ _id: card._id });
    })
    .then(() => {
      res.status(HTTP_STATUS_OK).send({ message: 'Карточка удалена' });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        next(new BadRequestError(`Некорректный _id: ${req.params.cardId} карточки`));
      } else {
        next(err);
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new NotFoundError(`Карточка с таким _id: ${req.params.cardId} не найдена.`))
    .populate(['owner', 'likes'])
    .then((card) => {
      res.status(HTTP_STATUS_OK).send(card);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        next(new BadRequestError(`Некорректный _id: ${req.params.cardId} карточки`));
      } else {
        next(err);
      }
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new NotFoundError(`Карточка с таким _id: ${req.params.cardId} не найдена.`))
    .populate(['owner', 'likes'])
    .then((card) => {
      res.status(HTTP_STATUS_OK).send(card);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        next(new BadRequestError(`Некорректный _id: ${req.params.cardId} карточки`));
      } else {
        next(err);
      }
    });
};
