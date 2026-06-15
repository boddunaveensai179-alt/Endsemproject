const express = require('express');
const {
  createSearch,
  getSearches,
  updateSearch,
  deleteSearch,
} = require('../controllers/searchController');

const router = express.Router();

router.route('/')
  .post(createSearch)
  .get(getSearches);

router.route('/:id')
  .put(updateSearch)
  .delete(deleteSearch);

module.exports = router;
