import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServer } from '@apollo/server';
import { json } from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import depthLimit from 'graphql-depth-limit';
import { applyMiddleware } from 'graphql-middleware';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import 'module-alias/register';
import { servicePermissions, servicePermissionsWithAllDisabled } from './permissions';

import packageJson from '../package.json';
import schema from './schema';
import { cirkleLogger, logger } from './utils/logger';
import { generateReferenceId, returnSuccessHTTPResponse } from './utils/misc';
import { authenticateUser } from './schema/user/services';
import fileProxyRouter from './routes/fileProxy';
import ir54Router from './modules/ir54/router';
import { ensureIr54SchemaReady } from './modules/ir54/db';

dotenv.config();
const { PORT, NODE_ENV } = process.env;

const app = express();

app.use(cors());

const startServer = async () => {
  let permissions;
  permissions = servicePermissions;

  const server = new ApolloServer({
    schema: applyMiddleware(schema, permissions),
    introspection: NODE_ENV !== 'production',
    plugins: [cirkleLogger],
    validationRules: [depthLimit(6)],
  });

  const serverInternal = new ApolloServer({
    schema: applyMiddleware(schema, servicePermissionsWithAllDisabled),
    introspection: true,
    plugins: [cirkleLogger],
    validationRules: [depthLimit(6)],
  });

  await server.start();
  await serverInternal.start();
  app.use(graphqlUploadExpress());

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const sessionToken = req.headers.authorization || undefined;
        let user = await authenticateUser(req);
        return {
          sessionToken,
          currentUser: user,
          requestId: generateReferenceId(4),
          dataSources: {},
        };
      },
    })
  );

  // Internal endpoint for codegen
  app.use('/graphql-internal', cors<cors.CorsRequest>(), json());
};

app.use(
  express.urlencoded({
    limit: '50mb',
    parameterLimit: 100000,
    extended: true,
  })
);

app.use(
  express.json({
    limit: '50mb',
  })
);

// Mount REST API routes (file proxy, etc.)
app.use('/api', fileProxyRouter);
app.use('/api/ir54', ir54Router);
app.use('/ir54', ir54Router);

app.get('/version', (_req: Request, res: Response): void => {
  getVersion(res);
});

startServer();
ensureIr54SchemaReady().catch(error => {
  logger.error('IR54 database bootstrap failed during server startup', error);
});
app.listen({ port: PORT }, async () => {
  logger.info(`Apollo Server on http://localhost:${PORT}/graphql`);
});

export async function getVersion(res) {
  if (res) return returnSuccessHTTPResponse(packageJson.version, res);
  return { number: packageJson.version };
}
