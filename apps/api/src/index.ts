import { createApp } from './app';
import { connectDb } from './db';
import { config } from './config';

async function main() {
  await connectDb();
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port}`);
    console.log(`Health: http://localhost:${config.port}/api/health`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
