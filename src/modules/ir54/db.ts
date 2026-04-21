import fs from 'fs';
import path from 'path';

import { Pool, PoolClient } from 'pg';

import { logger } from 'utils/logger';

import { ir54Config } from './config';

let ir54Pool: Pool | null = null;
let schemaReadyPromise: Promise<void> | null = null;

const schemaFilePath = path.resolve(__dirname, 'migrations', '001_initial.sql');

const getIr54Pool = () => {
  if (!ir54Pool) {
    ir54Pool = new Pool({
      connectionString: ir54Config.databaseUrl,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }

  return ir54Pool;
};

const withAdminClient = async <T>(callback: (client: PoolClient) => Promise<T>): Promise<T> => {
  const adminPool = new Pool({
    connectionString: ir54Config.adminDatabaseUrl,
    max: 1,
    idleTimeoutMillis: 5_000,
  });

  const client = await adminPool.connect();
  try {
    return await callback(client);
  } finally {
    client.release();
    await adminPool.end();
  }
};

const ensureDatabaseExists = async () => {
  await withAdminClient(async client => {
    const existingDatabase = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      ir54Config.databaseName,
    ]);

    if (existingDatabase.rowCount === 0) {
      logger.info(`Creating IR54 database ${ir54Config.databaseName}`);
      await client.query(`CREATE DATABASE "${ir54Config.databaseName.replace(/"/g, '""')}"`);
    }
  });
};

const applySchema = async () => {
  const pool = getIr54Pool();
  const client = await pool.connect();
  try {
    const sql = fs.readFileSync(schemaFilePath, 'utf8');
    await client.query(sql);
  } finally {
    client.release();
  }
};

export const ensureIr54SchemaReady = async () => {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      try {
        await applySchema();
      } catch (error: any) {
        if (error?.code === '3D000') {
          await ensureDatabaseExists();
          await applySchema();
        } else {
          throw error;
        }
      }
    })().catch(error => {
      schemaReadyPromise = null;
      logger.error('Failed to initialize IR54 database schema', error);
      throw error;
    });
  }

  await schemaReadyPromise;
};

export const withIr54Transaction = async <T>(callback: (client: PoolClient) => Promise<T>): Promise<T> => {
  await ensureIr54SchemaReady();

  const pool = getIr54Pool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const queryIr54 = async <T = any>(query: string, values: unknown[] = []) => {
  await ensureIr54SchemaReady();
  return getIr54Pool().query<T>(query, values);
};
