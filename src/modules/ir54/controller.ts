import { Request, Response } from 'express';

import { logger } from 'utils/logger';

import {
  createIr54RecordService,
  getIr54DocumentService,
  getIr54RecordService,
  listIr54RecordsService,
  updateIr54RecordService,
} from './service';
import { Ir54HttpError, Ir54RecordInput } from './types';

export interface Ir54Request extends Request {
  currentUser?: {
    email?: string | null;
  };
}

const handleControllerError = (error: unknown, res: Response) => {
  if (error instanceof Ir54HttpError) {
    res.status(error.statusCode).json({
      message: error.message,
      details: error.details,
    });
    return;
  }

  if ((error as { code?: string })?.code === '23505') {
    res.status(409).json({
      message: 'An IR54 record already exists for the same district, police station, crime number, and accused.',
    });
    return;
  }

  logger.error('IR54 controller failure', error);
  res.status(500).json({
    message: 'Unexpected IR54 module error.',
  });
};

export const createIr54RecordController = async (req: Ir54Request, res: Response) => {
  try {
    const record = await createIr54RecordService(req.body as Ir54RecordInput, req.currentUser);
    res.status(201).json(record);
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getIr54RecordController = async (req: Request, res: Response) => {
  try {
    const record = await getIr54RecordService(req.params.id);
    res.status(200).json(record);
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const updateIr54RecordController = async (req: Ir54Request, res: Response) => {
  try {
    const record = await updateIr54RecordService(req.params.id, req.body as Ir54RecordInput, req.currentUser);
    res.status(200).json(record);
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const listIr54RecordsController = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const records = await listIr54RecordsService(req.query.search as string | undefined, limit);
    res.status(200).json(records);
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getIr54DocumentController = async (req: Request, res: Response) => {
  try {
    const document = await getIr54DocumentService(req.params.id, req.params.documentField);

    if (!document.downloadUrl) {
      throw new Ir54HttpError(404, 'IR54 document file URL is missing.');
    }

    res.redirect(document.downloadUrl);
  } catch (error) {
    handleControllerError(error, res);
  }
};
