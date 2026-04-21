CREATE TABLE IF NOT EXISTS ir54_records (
  id TEXT PRIMARY KEY,
  "IR_of_Accused" TEXT,
  "District_Commissionerate" TEXT,
  "Police_Station" TEXT,
  "Cr_No" TEXT,
  "Section_of_Law" TEXT,
  "Name_of_Accused" TEXT,
  "Father_Name" TEXT,
  "DOB_Age" TEXT,
  "Present_Address" TEXT,
  "Native_Address" TEXT,
  "Native_State" TEXT,
  "Mobile_No" TEXT,
  "PAN_No" TEXT,
  "Aadhar_No" TEXT,
  "Ration_Card_No" TEXT,
  "Vehicle_RC_No" TEXT,
  "occupation" TEXT,
  "identification_marks" TEXT,
  "DL_No" TEXT,
  "Bank_Acount_Details" TEXT,
  "Bank_Statement_Obtained_or_Not" TEXT,
  "CDR_obtained_or_not" TEXT,
  "Update_Database_cdat" TEXT,
  "Update_Database_DOPAMS" TEXT,
  "Nationality" TEXT,
  "Accused_Status_Arrested_Absconding" TEXT,
  "Offender_Type" TEXT,
  "other_offender_type" TEXT,
  "Mode_of_Financial_Transactions" TEXT,
  "Mode_of_Drug_Procurement" TEXT,
  "Mode_of_Drug_Delivery" TEXT,
  "Preventive_Action" TEXT,
  "Fit_for_68_F" TEXT,
  "Fit_for_PITNDPS_Act" TEXT,
  "History_Sheet_details" TEXT,
  "Whether_booked_or_Counselled_or_not" TEXT,
  "Remarks" TEXT,
  "Facts_of_the_Case" TEXT,
  "Date_of_Report" DATE,
  "Investigation_officer" TEXT,
  "Case_Status" TEXT,
  "Passport_No" TEXT,
  "Passport_Place_of_Issue" TEXT,
  "Passport_Date_of_Issue" DATE,
  "Date_of_Passport_Expiry" DATE,
  "Passport_issued_Country" TEXT,
  "Visa_No" TEXT,
  "Visa_Issued_date" DATE,
  "Visa_Expiary_Date" DATE,
  "Purpose_of_Visit_to_India" TEXT,
  "Present_Occupation_in_India" TEXT,
  "Places_visited_in_India_during_his_stay_With_reason" TEXT,
  "Places_resided_in_Inida_during_his_stay_With_reason" TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS ir54_records_unique_case
  ON ir54_records ("District_Commissionerate", "Police_Station", "Cr_No", "Name_of_Accused");

CREATE TABLE IF NOT EXISTS ir54_bank_transactions (
  id BIGSERIAL PRIMARY KEY,
  record_id TEXT NOT NULL REFERENCES ir54_records(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  "BankAccount_UPI_wallet_transaction_Date" DATE,
  "BankAccount_UPI_wallet_transaction_From" TEXT,
  "BankAccount_UPI_wallet_transaction_To" TEXT,
  "BankAccount_UPI_wallet_transaction_Amount" TEXT,
  "BankAccount_UPI_wallet_transaction_no" TEXT,
  "BankAccount_UPI_wallet_transaction_remarks" TEXT
);

CREATE TABLE IF NOT EXISTS ir54_drug_details (
  id BIGSERIAL PRIMARY KEY,
  record_id TEXT NOT NULL REFERENCES ir54_records(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  "Type_of_Drug" TEXT,
  "Drug_Quantity" TEXT,
  "Drug_Quantity_measurement" TEXT,
  "Drug_Quantity_Worth" TEXT,
  "Drug_Quantity_Type" TEXT
);

CREATE TABLE IF NOT EXISTS ir54_social_media_accounts (
  id BIGSERIAL PRIMARY KEY,
  record_id TEXT NOT NULL REFERENCES ir54_records(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  "Social_Media_Accounts" TEXT,
  "Social_Media_Links" TEXT
);

CREATE TABLE IF NOT EXISTS ir54_previous_cases (
  id BIGSERIAL PRIMARY KEY,
  record_id TEXT NOT NULL REFERENCES ir54_records(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  "Previous_Cr_No" TEXT,
  "Previous_Section_of_Law" TEXT,
  "previous_police_station" TEXT,
  "Previous_District_Commissionerate" TEXT,
  "Previous_case_state" TEXT
);

CREATE TABLE IF NOT EXISTS ir54_parcel_details (
  id BIGSERIAL PRIMARY KEY,
  record_id TEXT NOT NULL REFERENCES ir54_records(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  "Parcel_Details_Date" DATE,
  "Parcel_Details_From" TEXT,
  "Parcel_Details_To" TEXT,
  "Parcel_Details_Tracking_ID" TEXT,
  "Parcel_Details_Courier_Service_Name" TEXT
);

CREATE TABLE IF NOT EXISTS ir54_whatsapp_chats (
  id BIGSERIAL PRIMARY KEY,
  record_id TEXT NOT NULL REFERENCES ir54_records(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  "Whatsapp_Chats_Date" DATE,
  "Whatsapp_Chats_From" TEXT,
  "Whatsapp_Chats_To" TEXT,
  "Whatsapp_Chats_Content" TEXT,
  "Whatsapp_remarks" TEXT
);

CREATE TABLE IF NOT EXISTS ir54_gang_associates (
  id BIGSERIAL PRIMARY KEY,
  record_id TEXT NOT NULL REFERENCES ir54_records(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  "Gang_associate_name" TEXT,
  "Gang_associate_status" TEXT,
  "Gange_associate_type" TEXT
);

CREATE TABLE IF NOT EXISTS ir54_documents (
  id BIGSERIAL PRIMARY KEY,
  record_id TEXT NOT NULL REFERENCES ir54_records(id) ON DELETE CASCADE,
  document_field TEXT NOT NULL,
  file_name TEXT NOT NULL,
  stored_name TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT,
  file_path TEXT NOT NULL,
  download_url TEXT,
  view_url TEXT,
  folder TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ir54_documents
  DROP CONSTRAINT IF EXISTS ir54_documents_unique_field;

ALTER TABLE ir54_documents
  ADD COLUMN IF NOT EXISTS download_url TEXT,
  ADD COLUMN IF NOT EXISTS view_url TEXT,
  ADD COLUMN IF NOT EXISTS folder TEXT;

CREATE INDEX IF NOT EXISTS ir54_documents_record_field_idx
  ON ir54_documents (record_id, document_field);
