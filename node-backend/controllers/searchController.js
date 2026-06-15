const SearchHistory = require('../models/SearchHistory');

const createSearch = async (req, res, next) => {
  try {
    const search = await SearchHistory.create(req.body);
    res.status(201).json(search);
  } catch (error) {
    next(error);
  }
};

const getSearches = async (req, res, next) => {
  try {
    const filter = req.query.userId ? { userId: req.query.userId } : {};
    const searches = await SearchHistory.find(filter).sort({ timestamp: -1 });
    res.json(searches);
  } catch (error) {
    next(error);
  }
};

const updateSearch = async (req, res, next) => {
  try {
    const search = await SearchHistory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!search) {
      return res.status(404).json({ message: 'Search history record not found' });
    }

    res.json(search);
  } catch (error) {
    next(error);
  }
};

const deleteSearch = async (req, res, next) => {
  try {
    const search = await SearchHistory.findByIdAndDelete(req.params.id);

    if (!search) {
      return res.status(404).json({ message: 'Search history record not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSearch,
  getSearches,
  updateSearch,
  deleteSearch,
};
