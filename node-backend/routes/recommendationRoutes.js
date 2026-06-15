const express = require('express');
const {
  createRecommendation,
  getRecommendations,
  updateRecommendation,
  deleteRecommendation,
} = require('../controllers/recommendationController');

const router = express.Router();

router.route('/')
  .post(createRecommendation)
  .get(getRecommendations);

router.route('/:id')
  .put(updateRecommendation)
  .delete(deleteRecommendation);

module.exports = router;
