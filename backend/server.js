const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const interviewRoutes = require('./routes/interview');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.use('/api/interview', interviewRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'interview-coach' });
});

app.listen(PORT, () => {
  console.log(`Interview Coach API running on port ${PORT}`);
});
