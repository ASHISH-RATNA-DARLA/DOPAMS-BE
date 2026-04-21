import {
  IR54_BANK_TRANSACTION_FIELDS,
  IR54_DOCUMENT_FIELDS,
  IR54_DRUG_DETAIL_FIELDS,
  IR54_GANG_ASSOCIATE_FIELDS,
  IR54_MAIN_FIELDS,
  IR54_PARCEL_DETAIL_FIELDS,
  IR54_PREVIOUS_CASE_FIELDS,
  IR54_SOCIAL_MEDIA_FIELDS,
  IR54_WHATSAPP_CHAT_FIELDS,
} from './constants';

export type NullableString = string | null;

export type Ir54MainField = (typeof IR54_MAIN_FIELDS)[number];
export type Ir54DocumentField = (typeof IR54_DOCUMENT_FIELDS)[number];

type FieldsToObject<TFields extends readonly string[]> = {
  [TField in TFields[number]]: NullableString;
};

export type Ir54ScalarFields = FieldsToObject<typeof IR54_MAIN_FIELDS>;
export type Ir54BankTransaction = FieldsToObject<typeof IR54_BANK_TRANSACTION_FIELDS>;
export type Ir54DrugDetail = FieldsToObject<typeof IR54_DRUG_DETAIL_FIELDS>;
export type Ir54SocialMediaAccount = FieldsToObject<typeof IR54_SOCIAL_MEDIA_FIELDS>;
export type Ir54PreviousCase = FieldsToObject<typeof IR54_PREVIOUS_CASE_FIELDS>;
export type Ir54ParcelDetail = FieldsToObject<typeof IR54_PARCEL_DETAIL_FIELDS>;
export type Ir54WhatsappChat = FieldsToObject<typeof IR54_WHATSAPP_CHAT_FIELDS>;
export type Ir54GangAssociate = FieldsToObject<typeof IR54_GANG_ASSOCIATE_FIELDS>;

export interface Ir54RecordInput extends Partial<Ir54ScalarFields> {
  bankTransactions?: Partial<Ir54BankTransaction>[] | null;
  drugDetails?: Partial<Ir54DrugDetail>[] | null;
  socialMediaAccounts?: Partial<Ir54SocialMediaAccount>[] | null;
  previousCases?: Partial<Ir54PreviousCase>[] | null;
  parcelDetails?: Partial<Ir54ParcelDetail>[] | null;
  whatsappChats?: Partial<Ir54WhatsappChat>[] | null;
  gangAssociates?: Partial<Ir54GangAssociate>[] | null;
}

export interface Ir54StoredDocument {
  id: number;
  documentField: Ir54DocumentField;
  fileName: string;
  storedName: string;
  mimeType: string | null;
  fileSize: number | null;
  filePath: string;
  downloadUrl: string;
  viewUrl: string | null;
  folder: string | null;
}

export interface Ir54Record extends Ir54ScalarFields {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  bankTransactions: Ir54BankTransaction[];
  drugDetails: Ir54DrugDetail[];
  socialMediaAccounts: Ir54SocialMediaAccount[];
  previousCases: Ir54PreviousCase[];
  parcelDetails: Ir54ParcelDetail[];
  whatsappChats: Ir54WhatsappChat[];
  gangAssociates: Ir54GangAssociate[];
  documents: Partial<Record<Ir54DocumentField, Ir54StoredDocument[]>>;
}

export interface Ir54ListItem {
  id: string;
  created_at: string;
  updated_at: string;
  IR_of_Accused: string | null;
  District_Commissionerate: string | null;
  Police_Station: string | null;
  Cr_No: string | null;
  Section_of_Law: string | null;
  Name_of_Accused: string | null;
  Nationality: string | null;
  Accused_Status_Arrested_Absconding: string | null;
  Offender_Type: string | null;
}

export interface Ir54NormalizedRecordInput extends Ir54ScalarFields {
  bankTransactions: Ir54BankTransaction[];
  drugDetails: Ir54DrugDetail[];
  socialMediaAccounts: Ir54SocialMediaAccount[];
  previousCases: Ir54PreviousCase[];
  parcelDetails: Ir54ParcelDetail[];
  whatsappChats: Ir54WhatsappChat[];
  gangAssociates: Ir54GangAssociate[];
}

export interface Ir54ValidationIssue {
  field: string;
  message: string;
}

export class Ir54HttpError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}
