const express = require('express');
const cors = require('cors');

const connectDb = require('./config/db');
const searchRoutes = require('./routes/searchRoutes');
const activityRoutes = require('./routes/activityRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

connectDb();

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8000'],
  credentials: true,
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'node-backend', database: 'library_mongo' });
});

app.use('/search', searchRoutes);
app.use('/activity', activityRoutes);
app.use('/recommendations', recommendationRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Node.js backend running on http://localhost:${PORT}`);
});
