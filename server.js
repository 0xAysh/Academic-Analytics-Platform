const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3001;
const staticDirectory = path.join(__dirname, 'public');

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(staticDirectory));

const authRoutes = require('./routes/auth');
const transcriptRoutes = require('./routes/transcripts');

app.use('/api/auth', authRoutes);
app.use('/api/transcripts', transcriptRoutes);

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

app.get('/', (req, res) => {
  res.sendFile(path.join(staticDirectory, 'html', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on http://127.0.0.1:${port}/`);
});
