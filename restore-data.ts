import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

const PHOTOS_JSON_PATH = path.join(process.cwd(), 'public', 'images', 'photos', 'photos.json');

async function migratePhotos() {
  console.log('--- Photos Migration Start ---');
  if (!fs.existsSync(PHOTOS_JSON_PATH)) {
    console.log('No photos.json found. Skipping photos migration.');
    return;
  }

  const photos = JSON.parse(fs.readFileSync(PHOTOS_JSON_PATH, 'utf-8'));
  console.log(`Found ${photos.length} photos in photos.json.`);

  for (const photo of photos) {
    try {
      // Check if already exists to avoid duplicates
      const check = await sql`SELECT * FROM photos WHERE filename = ${photo.filename}`;
      if (check.rowCount > 0) {
        console.log(`Skipping ${photo.filename} (already exists)`);
        continue;
      }

      await sql`
        INSERT INTO photos (filename, url, caption)
        VALUES (${photo.filename}, ${photo.url}, ${photo.caption})
      `;
      console.log(`Migrated photo: ${photo.filename}`);
    } catch (err) {
      console.error(`Failed to migrate ${photo.filename}:`, err);
    }
  }
}

async function run() {
  try {
    await migratePhotos();
    console.log('--- Migration Complete ---');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
