const express = require('express');
const {
  createActivity,
  getActivities,
  updateActivity,
  deleteActivity,
} = require('../controllers/activityController');

const router = express.Router();

router.route('/')
  .post(createActivity)
  .get(getActivities);

router.route('/:id')
  .put(updateActivity)
  .delete(deleteActivity);

module.exports = router;
