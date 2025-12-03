const express = require('express');
const cors = require('cors');
const path = require('path');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/admin', adminRoutes);

// Fallback to index for single page if needed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;