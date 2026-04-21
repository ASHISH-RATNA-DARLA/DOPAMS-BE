import {
  IR54_BANK_TRANSACTION_FIELDS,
  IR54_DRUG_DETAIL_FIELDS,
  IR54_GANG_ASSOCIATE_FIELDS,
  IR54_MAIN_FIELDS,
  IR54_PARCEL_DETAIL_FIELDS,
  IR54_PREVIOUS_CASE_FIELDS,
  IR54_REQUIRED_MAIN_FIELDS,
  IR54_SOCIAL_MEDIA_FIELDS,
  IR54_WHATSAPP_CHAT_FIELDS,
} from './constants';
import {
  Ir54BankTransaction,
  Ir54DrugDetail,
  Ir54GangAssociate,
  Ir54HttpError,
  Ir54NormalizedRecordInput,
  Ir54ParcelDetail,
  Ir54PreviousCase,
  Ir54RecordInput,
  Ir54ScalarFields,
  Ir54SocialMediaAccount,
  Ir54ValidationIssue,
  Ir54WhatsappChat,
} from './types';

const DATE_FIELD_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const normalizeValue = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }

  return `${value}`.trim() || null;
};

const normalizeRow = <TFields extends readonly string[]>(
  fields: TFields,
  row: Partial<Record<TFields[number], unknown>>
): Record<TFields[number], string | null> => {
  return fields.reduce(
    (accumulator, field) => {
      accumulator[field] = normalizeValue(row[field]);
      return accumulator;
    },
    {} as Record<TFields[number], string | null>
  );
};

const isEmptyRow = (row: Record<string, string | null>) => Object.values(row).every(value => !value);

const normalizeRows = <TFields extends readonly string[]>(
  fields: TFields,
  rows: Partial<Record<TFields[number], unknown>>[] | null | undefined
): Record<TFields[number], string | null>[] => {
  return (rows || []).map(row => normalizeRow(fields, row)).filter(row => !isEmptyRow(row));
};

const validateRequiredFields = (
  issues: Ir54ValidationIssue[],
  data: Record<string, string | null>,
  requiredFields: readonly string[]
) => {
  for (const field of requiredFields) {
    if (!data[field]) {
      issues.push({
        field,
        message: `${field} is required.`,
      });
    }
  }
};

const validateDateFields = (
  issues: Ir54ValidationIssue[],
  data: Record<string, string | null>,
  dateFields: readonly string[]
) => {
  for (const field of dateFields) {
    const value = data[field];
    if (value && !DATE_FIELD_PATTERN.test(value)) {
      issues.push({
        field,
        message: `${field} must be in YYYY-MM-DD format.`,
      });
    }
  }
};

const validateRepeatableRows = (
  issues: Ir54ValidationIssue[],
  rows: Record<string, string | null>[],
  sectionName: string,
  requiredFields: readonly string[]
) => {
  rows.forEach((row, index) => {
    requiredFields.forEach(field => {
      if (!row[field]) {
        issues.push({
          field: `${sectionName}[${index}].${field}`,
          message: `${field} is required for ${sectionName} row ${index + 1}.`,
        });
      }
    });
  });
};

const emptyScalarFields = (): Ir54ScalarFields => {
  return IR54_MAIN_FIELDS.reduce((accumulator, field) => {
    accumulator[field] = null;
    return accumulator;
  }, {} as Ir54ScalarFields);
};

const toScalarFieldRecord = (payload: Ir54NormalizedRecordInput): Record<string, string | null> => {
  return IR54_MAIN_FIELDS.reduce(
    (accumulator, field) => {
      accumulator[field] = payload[field];
      return accumulator;
    },
    {} as Record<string, string | null>
  );
};

export const normalizeIr54RecordInput = (payload: Ir54RecordInput): Ir54NormalizedRecordInput => {
  const scalarFields = emptyScalarFields();

  IR54_MAIN_FIELDS.forEach(field => {
    scalarFields[field] = normalizeValue(payload[field]);
  });

  return {
    ...scalarFields,
    bankTransactions: normalizeRows(IR54_BANK_TRANSACTION_FIELDS, payload.bankTransactions) as Ir54BankTransaction[],
    drugDetails: normalizeRows(IR54_DRUG_DETAIL_FIELDS, payload.drugDetails) as Ir54DrugDetail[],
    socialMediaAccounts: normalizeRows(
      IR54_SOCIAL_MEDIA_FIELDS,
      payload.socialMediaAccounts
    ) as Ir54SocialMediaAccount[],
    previousCases: normalizeRows(IR54_PREVIOUS_CASE_FIELDS, payload.previousCases) as Ir54PreviousCase[],
    parcelDetails: normalizeRows(IR54_PARCEL_DETAIL_FIELDS, payload.parcelDetails) as Ir54ParcelDetail[],
    whatsappChats: normalizeRows(IR54_WHATSAPP_CHAT_FIELDS, payload.whatsappChats) as Ir54WhatsappChat[],
    gangAssociates: normalizeRows(IR54_GANG_ASSOCIATE_FIELDS, payload.gangAssociates) as Ir54GangAssociate[],
  };
};

export const validateIr54RecordInput = (payload: Ir54NormalizedRecordInput) => {
  const issues: Ir54ValidationIssue[] = [];
  const scalarFieldData = toScalarFieldRecord(payload);

  validateRequiredFields(issues, scalarFieldData, IR54_REQUIRED_MAIN_FIELDS);

  if (payload.Offender_Type === 'Other' && !payload.other_offender_type) {
    issues.push({
      field: 'other_offender_type',
      message: 'other_offender_type is required when Offender_Type is Other.',
    });
  }

  validateDateFields(issues, scalarFieldData, [
    'Date_of_Report',
    'Passport_Date_of_Issue',
    'Date_of_Passport_Expiry',
    'Visa_Issued_date',
    'Visa_Expiary_Date',
  ]);

  validateRepeatableRows(issues, payload.bankTransactions, 'bankTransactions', [
    'BankAccount_UPI_wallet_transaction_Date',
    'BankAccount_UPI_wallet_transaction_From',
    'BankAccount_UPI_wallet_transaction_To',
    'BankAccount_UPI_wallet_transaction_Amount',
    'BankAccount_UPI_wallet_transaction_no',
  ]);
  validateRepeatableRows(issues, payload.drugDetails, 'drugDetails', [
    'Type_of_Drug',
    'Drug_Quantity',
    'Drug_Quantity_Type',
  ]);
  validateRepeatableRows(issues, payload.socialMediaAccounts, 'socialMediaAccounts', [
    'Social_Media_Accounts',
    'Social_Media_Links',
  ]);
  validateRepeatableRows(issues, payload.previousCases, 'previousCases', [
    'Previous_Cr_No',
    'Previous_Section_of_Law',
    'Previous_case_state',
  ]);
  validateRepeatableRows(issues, payload.parcelDetails, 'parcelDetails', [
    'Parcel_Details_Date',
    'Parcel_Details_From',
    'Parcel_Details_To',
    'Parcel_Details_Tracking_ID',
    'Parcel_Details_Courier_Service_Name',
  ]);
  validateRepeatableRows(issues, payload.whatsappChats, 'whatsappChats', [
    'Whatsapp_Chats_Date',
    'Whatsapp_Chats_From',
    'Whatsapp_Chats_To',
    'Whatsapp_Chats_Content',
  ]);
  validateRepeatableRows(issues, payload.gangAssociates, 'gangAssociates', [
    'Gang_associate_name',
    'Gang_associate_status',
    'Gange_associate_type',
  ]);

  payload.bankTransactions.forEach((row, index) => {
    if (
      row.BankAccount_UPI_wallet_transaction_Date &&
      !DATE_FIELD_PATTERN.test(row.BankAccount_UPI_wallet_transaction_Date)
    ) {
      issues.push({
        field: `bankTransactions[${index}].BankAccount_UPI_wallet_transaction_Date`,
        message: 'BankAccount_UPI_wallet_transaction_Date must be in YYYY-MM-DD format.',
      });
    }
  });

  payload.parcelDetails.forEach((row, index) => {
    if (row.Parcel_Details_Date && !DATE_FIELD_PATTERN.test(row.Parcel_Details_Date)) {
      issues.push({
        field: `parcelDetails[${index}].Parcel_Details_Date`,
        message: 'Parcel_Details_Date must be in YYYY-MM-DD format.',
      });
    }
  });

  payload.whatsappChats.forEach((row, index) => {
    if (row.Whatsapp_Chats_Date && !DATE_FIELD_PATTERN.test(row.Whatsapp_Chats_Date)) {
      issues.push({
        field: `whatsappChats[${index}].Whatsapp_Chats_Date`,
        message: 'Whatsapp_Chats_Date must be in YYYY-MM-DD format.',
      });
    }
  });

  if (issues.length > 0) {
    throw new Ir54HttpError(400, 'Invalid IR54 payload', issues);
  }
};
