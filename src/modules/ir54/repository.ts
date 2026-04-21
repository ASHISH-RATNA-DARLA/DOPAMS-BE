import dayjs from 'dayjs';
import { PoolClient } from 'pg';

import {
  IR54_BANK_TRANSACTION_FIELDS,
  IR54_DOCUMENT_FIELDS as IR54_ALLOWED_DOCUMENT_FIELDS,
  IR54_GANG_ASSOCIATE_FIELDS,
  IR54_LIST_FIELDS,
  IR54_MAIN_FIELDS,
  IR54_PARCEL_DETAIL_FIELDS,
  IR54_PREVIOUS_CASE_FIELDS,
  IR54_REPEATABLE_TABLES,
  IR54_SOCIAL_MEDIA_FIELDS,
  IR54_WHATSAPP_CHAT_FIELDS,
} from './constants';
import { queryIr54 } from './db';
import { Ir54DocumentField, Ir54ListItem, Ir54NormalizedRecordInput, Ir54Record, Ir54StoredDocument } from './types';

const MAIN_DATE_FIELDS = new Set([
  'Date_of_Report',
  'Passport_Date_of_Issue',
  'Date_of_Passport_Expiry',
  'Visa_Issued_date',
  'Visa_Expiary_Date',
]);

const CHILD_DATE_FIELDS: Record<string, Set<string>> = {
  ir54_bank_transactions: new Set(['BankAccount_UPI_wallet_transaction_Date']),
  ir54_parcel_details: new Set(['Parcel_Details_Date']),
  ir54_whatsapp_chats: new Set(['Whatsapp_Chats_Date']),
};

const quoteIdentifier = (value: string) => `"${value.replace(/"/g, '""')}"`;
const DEFAULT_FILE_SERVER_BASE_URL = 'http://192.168.103.106:8080/files/';

const isHttpUrl = (value: string) => /^https?:\/\//i.test(value);

const joinUrl = (baseUrl: string, pathOrUrl: string) => {
  if (isHttpUrl(pathOrUrl)) {
    return pathOrUrl;
  }

  if (!baseUrl) {
    return pathOrUrl;
  }

  try {
    const parsedBaseUrl = new URL(baseUrl);
    if (pathOrUrl.startsWith('/')) {
      return `${parsedBaseUrl.origin}${pathOrUrl}`;
    }
  } catch (_error) {
    // Fall back to string joining when the configured base is not URL-shaped.
  }

  return `${baseUrl.replace(/\/+$/, '')}/${pathOrUrl.replace(/^\/+/, '')}`;
};

const toTomcatFileUrl = (pathOrUrl: string | null | undefined) => {
  if (!pathOrUrl) {
    return null;
  }

  return joinUrl(
    process.env.TOMCAT_FILE_API_URL || process.env.FILE_SERVER_BASE_URL || DEFAULT_FILE_SERVER_BASE_URL,
    pathOrUrl
  );
};

const toProxyUrl = (pathOrUrl: string | null | undefined) => {
  const tomcatFileUrl = toTomcatFileUrl(pathOrUrl);

  if (!tomcatFileUrl || !isHttpUrl(tomcatFileUrl)) {
    return tomcatFileUrl || '';
  }

  return `/api/file-proxy?url=${encodeURIComponent(tomcatFileUrl)}`;
};

const isDayjsInput = (value: unknown): value is string | number | Date | dayjs.Dayjs => {
  return typeof value === 'string' || typeof value === 'number' || value instanceof Date || dayjs.isDayjs(value);
};

const toDateString = (value: unknown): string | null => {
  if (!value || !isDayjsInput(value)) {
    return null;
  }

  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? parsedDate.format('YYYY-MM-DD') : null;
};

const toTimestampString = (value: unknown): string => {
  if (!isDayjsInput(value)) {
    return '';
  }

  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? parsedDate.toISOString() : '';
};

const mapFields = <TFields extends readonly string[]>(
  row: Record<string, unknown>,
  fields: TFields,
  dateFields: Set<string> = new Set()
): Record<TFields[number], string | null> => {
  return fields.reduce(
    (accumulator, field) => {
      const rawValue = row[field];
      accumulator[field] = dateFields.has(field) ? toDateString(rawValue) : ((rawValue as string | null) ?? null);
      return accumulator;
    },
    {} as Record<TFields[number], string | null>
  );
};

const getListSelectClause = () => {
  return IR54_LIST_FIELDS.map(field => quoteIdentifier(field)).join(', ');
};

const insertMainRecord = async (
  client: PoolClient,
  id: string,
  payload: Ir54NormalizedRecordInput,
  actor: string | null
) => {
  const columns = ['id', ...IR54_MAIN_FIELDS, 'created_by', 'updated_by', 'created_at', 'updated_at'];
  const values = [id, ...IR54_MAIN_FIELDS.map(field => payload[field]), actor, actor, new Date(), new Date()];

  const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
  await client.query(
    `INSERT INTO ir54_records (${columns.map(quoteIdentifier).join(', ')}) VALUES (${placeholders})`,
    values
  );
};

const updateMainRecord = async (
  client: PoolClient,
  id: string,
  payload: Ir54NormalizedRecordInput,
  actor: string | null
) => {
  const columns = [...IR54_MAIN_FIELDS, 'updated_by', 'updated_at'];
  const values = [...IR54_MAIN_FIELDS.map(field => payload[field]), actor, new Date(), id];

  const setClause = columns.map((column, index) => `${quoteIdentifier(column)} = $${index + 1}`).join(', ');
  await client.query(`UPDATE ir54_records SET ${setClause} WHERE id = $${values.length}`, values);
};

const replaceChildRows = async (
  client: PoolClient,
  tableName: string,
  recordId: string,
  fields: readonly string[],
  rows: Record<string, string | null>[]
) => {
  await client.query(`DELETE FROM ${tableName} WHERE record_id = $1`, [recordId]);

  for (const [index, row] of rows.entries()) {
    const columns = ['record_id', 'sort_order', ...fields];
    const values = [recordId, index + 1, ...fields.map(field => row[field] ?? null)];
    const placeholders = values.map((_, valueIndex) => `$${valueIndex + 1}`).join(', ');
    await client.query(
      `INSERT INTO ${tableName} (${columns.map(quoteIdentifier).join(', ')}) VALUES (${placeholders})`,
      values
    );
  }
};

export const createIr54Record = async (
  client: PoolClient,
  id: string,
  payload: Ir54NormalizedRecordInput,
  actor: string | null
) => {
  await insertMainRecord(client, id, payload, actor);

  await replaceChildRows(
    client,
    IR54_REPEATABLE_TABLES.bankTransactions.tableName,
    id,
    IR54_BANK_TRANSACTION_FIELDS,
    payload.bankTransactions
  );
  await replaceChildRows(
    client,
    IR54_REPEATABLE_TABLES.drugDetails.tableName,
    id,
    IR54_REPEATABLE_TABLES.drugDetails.fields,
    payload.drugDetails
  );
  await replaceChildRows(
    client,
    IR54_REPEATABLE_TABLES.socialMediaAccounts.tableName,
    id,
    IR54_SOCIAL_MEDIA_FIELDS,
    payload.socialMediaAccounts
  );
  await replaceChildRows(
    client,
    IR54_REPEATABLE_TABLES.previousCases.tableName,
    id,
    IR54_PREVIOUS_CASE_FIELDS,
    payload.previousCases
  );
  await replaceChildRows(
    client,
    IR54_REPEATABLE_TABLES.parcelDetails.tableName,
    id,
    IR54_PARCEL_DETAIL_FIELDS,
    payload.parcelDetails
  );
  await replaceChildRows(
    client,
    IR54_REPEATABLE_TABLES.whatsappChats.tableName,
    id,
    IR54_WHATSAPP_CHAT_FIELDS,
    payload.whatsappChats
  );
  await replaceChildRows(
    client,
    IR54_REPEATABLE_TABLES.gangAssociates.tableName,
    id,
    IR54_GANG_ASSOCIATE_FIELDS,
    payload.gangAssociates
  );
};

export const updateIr54Record = async (
  client: PoolClient,
  id: string,
  payload: Ir54NormalizedRecordInput,
  actor: string | null
) => {
  await updateMainRecord(client, id, payload, actor);

  await replaceChildRows(
    client,
    IR54_REPEATABLE_TABLES.bankTransactions.tableName,
    id,
    IR54_BANK_TRANSACTION_FIELDS,
    payload.bankTransactions
  );
  await replaceChildRows(
    client,
    IR54_REPEATABLE_TABLES.drugDetails.tableName,
    id,
    IR54_REPEATABLE_TABLES.drugDetails.fields,
    payload.drugDetails
  );
  await replaceChildRows(
    client,
    IR54_REPEATABLE_TABLES.socialMediaAccounts.tableName,
    id,
    IR54_SOCIAL_MEDIA_FIELDS,
    payload.socialMediaAccounts
  );
  await replaceChildRows(
    client,
    IR54_REPEATABLE_TABLES.previousCases.tableName,
    id,
    IR54_PREVIOUS_CASE_FIELDS,
    payload.previousCases
  );
  await replaceChildRows(
    client,
    IR54_REPEATABLE_TABLES.parcelDetails.tableName,
    id,
    IR54_PARCEL_DETAIL_FIELDS,
    payload.parcelDetails
  );
  await replaceChildRows(
    client,
    IR54_REPEATABLE_TABLES.whatsappChats.tableName,
    id,
    IR54_WHATSAPP_CHAT_FIELDS,
    payload.whatsappChats
  );
  await replaceChildRows(
    client,
    IR54_REPEATABLE_TABLES.gangAssociates.tableName,
    id,
    IR54_GANG_ASSOCIATE_FIELDS,
    payload.gangAssociates
  );
};

interface Ir54DocumentMetadataInput {
  fileName: string;
  storedName: string;
  mimeType: string | null;
  fileSize: number | null;
  filePath: string;
  downloadUrl: string | null;
  viewUrl: string | null;
  folder: string | null;
}

export const createDocumentMetadata = async (
  client: PoolClient,
  recordId: string,
  documentField: Ir54DocumentField,
  document: Ir54DocumentMetadataInput
) => {
  await client.query(
    `INSERT INTO ir54_documents (
      record_id,
      document_field,
      file_name,
      stored_name,
      mime_type,
      file_size,
      file_path,
      download_url,
      view_url,
      folder,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
    [
      recordId,
      documentField,
      document.fileName,
      document.storedName,
      document.mimeType,
      document.fileSize,
      document.filePath,
      document.downloadUrl,
      document.viewUrl,
      document.folder,
    ]
  );
};

const getChildRows = async (
  recordId: string,
  tableName: string,
  fields: readonly string[]
): Promise<Record<string, string | null>[]> => {
  const result = await queryIr54(
    `SELECT ${fields.map(quoteIdentifier).join(', ')} FROM ${tableName} WHERE record_id = $1 ORDER BY sort_order ASC`,
    [recordId]
  );

  return result.rows.map(row => mapFields(row, fields, CHILD_DATE_FIELDS[tableName]));
};

const getDocuments = async (recordId: string): Promise<Partial<Record<Ir54DocumentField, Ir54StoredDocument[]>>> => {
  const result = await queryIr54(
    `SELECT id, document_field, file_name, stored_name, mime_type, file_size, file_path, download_url, view_url, folder
     FROM ir54_documents
     WHERE record_id = $1
     ORDER BY created_at DESC, id DESC`,
    [recordId]
  );

  return result.rows.reduce(
    (accumulator, row) => {
      const documentField = row.document_field as Ir54DocumentField;

      if (!IR54_ALLOWED_DOCUMENT_FIELDS.includes(documentField)) {
        return accumulator;
      }

      const document: Ir54StoredDocument = {
        id: Number(row.id),
        documentField,
        fileName: row.file_name,
        storedName: row.stored_name,
        mimeType: row.mime_type,
        fileSize: row.file_size ? Number(row.file_size) : null,
        filePath: row.file_path,
        downloadUrl: toProxyUrl(row.view_url || row.download_url || row.file_path),
        viewUrl: row.view_url,
        folder: row.folder,
      };

      accumulator[documentField] = [...(accumulator[documentField] || []), document];
      return accumulator;
    },
    {} as Partial<Record<Ir54DocumentField, Ir54StoredDocument[]>>
  );
};

export const getIr54RecordById = async (recordId: string): Promise<Ir54Record | null> => {
  const result = await queryIr54(
    `SELECT id, created_by, updated_by, created_at, updated_at, ${IR54_MAIN_FIELDS.map(quoteIdentifier).join(', ')}
     FROM ir54_records
     WHERE id = $1`,
    [recordId]
  );

  if (result.rowCount === 0) {
    return null;
  }

  const row = result.rows[0];
  const baseRecord = mapFields(row, IR54_MAIN_FIELDS, MAIN_DATE_FIELDS);

  return {
    id: row.id,
    ...baseRecord,
    created_by: row.created_by ?? null,
    updated_by: row.updated_by ?? null,
    created_at: toTimestampString(row.created_at),
    updated_at: toTimestampString(row.updated_at),
    bankTransactions: (await getChildRows(
      recordId,
      IR54_REPEATABLE_TABLES.bankTransactions.tableName,
      IR54_BANK_TRANSACTION_FIELDS
    )) as Ir54Record['bankTransactions'],
    drugDetails: (await getChildRows(
      recordId,
      IR54_REPEATABLE_TABLES.drugDetails.tableName,
      IR54_REPEATABLE_TABLES.drugDetails.fields
    )) as Ir54Record['drugDetails'],
    socialMediaAccounts: (await getChildRows(
      recordId,
      IR54_REPEATABLE_TABLES.socialMediaAccounts.tableName,
      IR54_SOCIAL_MEDIA_FIELDS
    )) as Ir54Record['socialMediaAccounts'],
    previousCases: (await getChildRows(
      recordId,
      IR54_REPEATABLE_TABLES.previousCases.tableName,
      IR54_PREVIOUS_CASE_FIELDS
    )) as Ir54Record['previousCases'],
    parcelDetails: (await getChildRows(
      recordId,
      IR54_REPEATABLE_TABLES.parcelDetails.tableName,
      IR54_PARCEL_DETAIL_FIELDS
    )) as Ir54Record['parcelDetails'],
    whatsappChats: (await getChildRows(
      recordId,
      IR54_REPEATABLE_TABLES.whatsappChats.tableName,
      IR54_WHATSAPP_CHAT_FIELDS
    )) as Ir54Record['whatsappChats'],
    gangAssociates: (await getChildRows(
      recordId,
      IR54_REPEATABLE_TABLES.gangAssociates.tableName,
      IR54_GANG_ASSOCIATE_FIELDS
    )) as Ir54Record['gangAssociates'],
    documents: await getDocuments(recordId),
  };
};

export const listIr54Records = async (searchText?: string, limit = 50): Promise<Ir54ListItem[]> => {
  const search = searchText?.trim();

  if (search) {
    const result = await queryIr54(
      `SELECT id, created_at, updated_at, ${getListSelectClause()}
       FROM ir54_records
       WHERE
         "IR_of_Accused" ILIKE $1 OR
         "Name_of_Accused" ILIKE $1 OR
         "Cr_No" ILIKE $1 OR
         "District_Commissionerate" ILIKE $1 OR
         "Police_Station" ILIKE $1
       ORDER BY updated_at DESC
       LIMIT $2`,
      [`%${search}%`, limit]
    );

    return result.rows.map(row => ({
      id: row.id,
      created_at: toTimestampString(row.created_at),
      updated_at: toTimestampString(row.updated_at),
      IR_of_Accused: row.IR_of_Accused ?? null,
      District_Commissionerate: row.District_Commissionerate ?? null,
      Police_Station: row.Police_Station ?? null,
      Cr_No: row.Cr_No ?? null,
      Section_of_Law: row.Section_of_Law ?? null,
      Name_of_Accused: row.Name_of_Accused ?? null,
      Nationality: row.Nationality ?? null,
      Accused_Status_Arrested_Absconding: row.Accused_Status_Arrested_Absconding ?? null,
      Offender_Type: row.Offender_Type ?? null,
    }));
  }

  const result = await queryIr54(
    `SELECT id, created_at, updated_at, ${getListSelectClause()}
     FROM ir54_records
     ORDER BY updated_at DESC
     LIMIT $1`,
    [limit]
  );

  return result.rows.map(row => ({
    id: row.id,
    created_at: toTimestampString(row.created_at),
    updated_at: toTimestampString(row.updated_at),
    IR_of_Accused: row.IR_of_Accused ?? null,
    District_Commissionerate: row.District_Commissionerate ?? null,
    Police_Station: row.Police_Station ?? null,
    Cr_No: row.Cr_No ?? null,
    Section_of_Law: row.Section_of_Law ?? null,
    Name_of_Accused: row.Name_of_Accused ?? null,
    Nationality: row.Nationality ?? null,
    Accused_Status_Arrested_Absconding: row.Accused_Status_Arrested_Absconding ?? null,
    Offender_Type: row.Offender_Type ?? null,
  }));
};

export const getIr54DocumentByField = async (recordId: string, documentField: Ir54DocumentField) => {
  const documents = await getDocuments(recordId);
  return documents[documentField]?.[0] || null;
};
