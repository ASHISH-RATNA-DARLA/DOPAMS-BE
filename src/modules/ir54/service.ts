import { v4 as uuid } from 'uuid';
import { FileUpload } from 'graphql-upload-ts';

import { IR54_DOCUMENT_FIELDS } from './constants';
import { withIr54Transaction } from './db';
import {
  createDocumentMetadata,
  createIr54Record,
  getIr54DocumentByField,
  getIr54RecordById,
  listIr54Records,
  updateIr54Record,
} from './repository';
import { Ir54DocumentField, Ir54HttpError, Ir54RecordInput } from './types';
import { normalizeIr54RecordInput, validateIr54RecordInput } from './validation';
import { processFileUploadToTomcat } from 'utils/misc';

const getActorName = (currentUser?: { email?: string | null }) => currentUser?.email || null;

const sanitizeFolderSegment = (value: string) => value.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-');

const getStoredName = (viewUrl: string, fallback: string) => {
  const [pathWithoutQuery] = viewUrl.split('?');
  const storedName = pathWithoutQuery.split('/').filter(Boolean).pop();
  return storedName || fallback;
};

export const createIr54RecordService = async (payload: Ir54RecordInput, currentUser?: { email?: string | null }) => {
  const normalizedPayload = normalizeIr54RecordInput(payload);
  validateIr54RecordInput(normalizedPayload);

  const recordId = uuid();
  const actor = getActorName(currentUser);

  await withIr54Transaction(async client => {
    await createIr54Record(client, recordId, normalizedPayload, actor);
  });

  const createdRecord = await getIr54RecordById(recordId);

  if (!createdRecord) {
    throw new Ir54HttpError(500, 'IR54 record was created but could not be reloaded.');
  }

  return createdRecord;
};

export const getIr54RecordService = async (recordId: string) => {
  const record = await getIr54RecordById(recordId);

  if (!record) {
    throw new Ir54HttpError(404, 'IR54 record not found.');
  }

  return record;
};

export const updateIr54RecordService = async (
  recordId: string,
  payload: Ir54RecordInput,
  currentUser?: { email?: string | null }
) => {
  const existingRecord = await getIr54RecordById(recordId);
  if (!existingRecord) {
    throw new Ir54HttpError(404, 'IR54 record not found.');
  }

  const normalizedPayload = normalizeIr54RecordInput(payload);
  validateIr54RecordInput(normalizedPayload);

  await withIr54Transaction(async client => {
    await updateIr54Record(client, recordId, normalizedPayload, getActorName(currentUser));
  });

  return getIr54RecordService(recordId);
};

export const listIr54RecordsService = async (searchText?: string, limit?: number) => {
  const sanitizedLimit = Number.isFinite(limit) ? Math.max(1, Math.min(Number(limit), 100)) : 50;
  return listIr54Records(searchText, sanitizedLimit);
};

export const getIr54DocumentService = async (recordId: string, documentField: string) => {
  if (!IR54_DOCUMENT_FIELDS.includes(documentField as Ir54DocumentField)) {
    throw new Ir54HttpError(400, 'Invalid IR54 document field.');
  }

  const document = await getIr54DocumentByField(recordId, documentField as Ir54DocumentField);

  if (!document) {
    throw new Ir54HttpError(404, 'IR54 document not found.');
  }

  return document;
};

export const uploadIr54DocumentService = async (
  file: FileUpload,
  recordId: string,
  documentField: string,
  currentUser?: { email?: string | null }
) => {
  if (!currentUser) {
    throw new Ir54HttpError(401, 'Authentication is required to upload IR54 documents.');
  }

  if (!IR54_DOCUMENT_FIELDS.includes(documentField as Ir54DocumentField)) {
    throw new Ir54HttpError(400, 'Invalid IR54 document field.');
  }

  const existingRecord = await getIr54RecordById(recordId);
  if (!existingRecord) {
    throw new Ir54HttpError(404, 'IR54 record not found.');
  }

  const normalizedDocumentField = documentField as Ir54DocumentField;
  const uploadResult = await processFileUploadToTomcat(
    file,
    `ir54-documents/${sanitizeFolderSegment(recordId)}/${sanitizeFolderSegment(normalizedDocumentField)}`
  );

  await withIr54Transaction(async client => {
    await createDocumentMetadata(client, recordId, normalizedDocumentField, {
      fileName: uploadResult.fileName,
      storedName: getStoredName(uploadResult.viewUrl, uploadResult.fileName),
      mimeType: uploadResult.mimeType || null,
      fileSize: uploadResult.size,
      filePath: uploadResult.viewUrl,
      downloadUrl: uploadResult.downloadUrl,
      viewUrl: uploadResult.viewUrl,
      folder: uploadResult.folder,
    });
  });

  return 'File uploaded successfully';
};
