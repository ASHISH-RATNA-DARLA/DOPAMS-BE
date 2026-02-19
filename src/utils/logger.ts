import dayjs from 'dayjs';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
});

const logFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf(
    info =>
      `${info.level} | ${dayjs(info.timestamp as string).toLocaleString()} | ${info.requestId || 'N/A - Request Id'} | ${
        info.operationName || 'N/A - Operation Name'
      } | ${info.message}`
  )
);

logger.add(
  new winston.transports.Console({
    format: logFormat,
  })
);

const cirkleLogger = {
  // Fires whenever a GraphQL request is received from a client.
  async requestDidStart(requestContext) {
    logger.info('Request started', {
      requestId: requestContext.contextValue.requestId,
      operationName: requestContext.request.operationName,
    });

    return {
      async didEncounterErrors(requestContext) {
        logger.error('Exception on query : ' + requestContext.request.query);
        logger.error(requestContext.errors, {
          requestId: requestContext.contextValue.requestId,
          operationName: requestContext.request.operationName,
        });
      },
      async willSendResponse(requestContext) {
        logger.info('Sending response', {
          requestId: requestContext.contextValue.requestId,
          operationName: requestContext.request.operationName,
        });
      },
    };
  },
};

export { cirkleLogger, logger };
