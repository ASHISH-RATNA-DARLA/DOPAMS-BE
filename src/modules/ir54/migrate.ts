import { ensureIr54SchemaReady } from './db';

ensureIr54SchemaReady()
  .then(() => {
    console.log('IR54 database is ready.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to initialize IR54 database.', error);
    process.exit(1);
  });
