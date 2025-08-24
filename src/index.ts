import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import { connectDB } from './db.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

async function main() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start app:', err);
  process.exit(1);
});
