const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const attractionRoutes = require('./routes/auth'); // or wherever your router is
require('dotenv').config();

const app = express();
app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(attractionRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/auth', require('./routes/auth'));

app.listen(process.env.PORT || 8888, () => {
  console.log('Server running on port 8888');
});
