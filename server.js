const express = require('express');
const path = require('path');

const app = express();
const port = 3001;
const staticDirectory = path.join(__dirname, 'public');

app.use(express.static(staticDirectory));

app.get('/', (req, res) => {
  res.sendFile(path.join(staticDirectory, 'html', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on http://127.0.0.1:${port}/`);
});
