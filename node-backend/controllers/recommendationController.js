const Recommendation = require('../models/Recommendation');

const createRecommendation = async (req, res, next) => {
  try {
    const recommendation = await Recommendation.create(req.body);
    res.status(201).json(recommendation);
  } catch (error) {
    next(error);
  }
};

const getRecommendations = async (req, res, next) => {
  try {
    const filter = req.query.userId ? { userId: req.query.userId } : {};
    const recommendations = await Recommendation.find(filter).sort({ createdAt: -1 });
    res.json(recommendations);
  } catch (error) {
    next(error);
  }
};

const updateRecommendation = async (req, res, next) => {
  try {
    const recommendation = await Recommendation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    res.json(recommendation);
  } catch (error) {
    next(error);
  }
};

const deleteRecommendation = async (req, res, next) => {
  try {
    const recommendation = await Recommendation.findByIdAndDelete(req.params.id);

    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRecommendation,
  getRecommendations,
  updateRecommendation,
  deleteRecommendation,
};
