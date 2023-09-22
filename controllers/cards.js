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
      if (!card) {
        return next(new NotFoundError('Карточка с таким _id не найдена.'));
      }

      Card.findById(card._id)
        .populate('owner')
        .then((data) => res.status(HTTP_STATUS_CREATED).send(data))
        .catch((err) => {
          if (err instanceof mongoose.Error.DocumentNotFoundError) {
            return next(new NotFoundError('Карточка с таким _id не найдена.'));
          }
          return next(err);
        });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError(err.message));
      }
      return next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        return next(new NotFoundError(`Карточка с таким _id: ${req.params.cardId} не найдена.`));
      }

      if (!card.owner.equals(req.user._id)) {
        throw new ForbiddenError('Карточка другого пользователя');
      }

      Card.deleteOne({ _id: card._id })
        .then(() => {
          res.status(HTTP_STATUS_OK).send({ message: 'Карточка удалена' });
        })
        .catch(next);
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        return next(new NotFoundError(`Карточка с таким _id: ${req.params.cardId} не найдена.`));
      }
      res.status(HTTP_STATUS_OK).send(card);
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        return next(new NotFoundError(`Карточка с таким _id: ${req.params.cardId} не найдена.`));
      }
      res.status(HTTP_STATUS_OK).send(card);
    })
    .catch(next);
};
