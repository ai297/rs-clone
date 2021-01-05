import express from 'express';
import http from 'http';
import path from 'path';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const PUBLIC_PATH = process.env.PUBLIC_PATH ? path.resolve(__dirname, process.env.PUBLIC_PATH)
  : path.resolve(__dirname, './public');

app.use(express.static(PUBLIC_PATH));

server.listen(PORT, () => {
  /* eslint-disable */
  console.log(`Server started on port ${PORT}`);
  console.log(`Public path: ${PUBLIC_PATH}`);
  /* eslint-enable */
});
