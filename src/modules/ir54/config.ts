import { URL } from 'url';

import { IR54_DEFAULT_DATABASE_NAME } from './constants';

const getBaseDatabaseUrl = () => {
  if (process.env.IR54_DATABASE_URL) {
    return process.env.IR54_DATABASE_URL;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL or IR54_DATABASE_URL must be configured for the IR54 module.');
  }

  const derivedUrl = new URL(process.env.DATABASE_URL);
  derivedUrl.pathname = `/${IR54_DEFAULT_DATABASE_NAME}`;
  return derivedUrl.toString();
};

const getAdminDatabaseUrl = () => {
  const databaseUrl = new URL(getBaseDatabaseUrl());
  databaseUrl.pathname = '/postgres';
  return databaseUrl.toString();
};

const getDatabaseName = () => {
  const databaseUrl = new URL(getBaseDatabaseUrl());
  return databaseUrl.pathname.replace(/^\//, '');
};

export const ir54Config = {
  databaseUrl: getBaseDatabaseUrl(),
  adminDatabaseUrl: getAdminDatabaseUrl(),
  databaseName: getDatabaseName(),
};
