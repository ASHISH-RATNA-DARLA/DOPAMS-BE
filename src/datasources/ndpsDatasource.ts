import { Client } from 'pg';

/**
 * Runs a raw SQL query on the given Postgres database URL.
 * @param dbUrl - The Postgres connection string.
 * @param query - The SQL query to execute.
 * @param params - Optional parameters for parameterized queries.
 * @returns The result rows from the query.
 */

export async function runQueryOnNdpsDatasource<T = any>(query: string, params?: any[]): Promise<T[]> {
  const client = new Client({
    connectionString:
      'postgres://postgres:W9sM8pjDrK58FYrzAtws@ts-dopams-dev-qtlrj-prod.toystack.store:10571/ndps_database?schema=public',
  });
  try {
    await client.connect();
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    await client.end();
  }
}
