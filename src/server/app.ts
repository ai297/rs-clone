import express from 'express';
import { Server, createServer } from 'http';

export default class App {
  private express;

  private server: Server;

  constructor(private publicPath: string) {
    this.express = express();
    this.server = createServer(this.express);

    this.express.use(express.static(this.publicPath));
  }

  start(port: number): void {
    this.server.listen(port, () => {
      /* eslint-disable */
      console.log(`Server started on port ${port}`);
      console.log(`Public path: ${this.publicPath}`);
      /* eslint-enable */
    });
  }
}
