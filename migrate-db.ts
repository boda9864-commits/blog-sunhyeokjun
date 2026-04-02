import { initDb } from './src/lib/db-init';

async function run() {
  console.log('Starting DB migration...');
  try {
    await initDb();
    console.log('Migration finished successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
