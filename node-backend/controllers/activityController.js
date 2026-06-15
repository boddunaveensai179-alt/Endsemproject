const ActivityLog = require('../models/ActivityLog');

const createActivity = async (req, res, next) => {
  try {
    const activity = await ActivityLog.create(req.body);
    res.status(201).json(activity);
  } catch (error) {
    next(error);
  }
};

const getActivities = async (req, res, next) => {
  try {
    const filter = req.query.userId ? { userId: req.query.userId } : {};
    const activities = await ActivityLog.find(filter).sort({ timestamp: -1 });
    res.json(activities);
  } catch (error) {
    next(error);
  }
};

const updateActivity = async (req, res, next) => {
  try {
    const activity = await ActivityLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity log not found' });
    }

    res.json(activity);
  } catch (error) {
    next(error);
  }
};

const deleteActivity = async (req, res, next) => {
  try {
    const activity = await ActivityLog.findByIdAndDelete(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity log not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createActivity,
  getActivities,
  updateActivity,
  deleteActivity,
};
