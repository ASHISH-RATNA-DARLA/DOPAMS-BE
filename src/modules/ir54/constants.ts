export const IR54_MAIN_FIELDS = [
  'IR_of_Accused',
  'District_Commissionerate',
  'Police_Station',
  'Cr_No',
  'Section_of_Law',
  'Name_of_Accused',
  'Father_Name',
  'DOB_Age',
  'Present_Address',
  'Native_Address',
  'Native_State',
  'Mobile_No',
  'PAN_No',
  'Aadhar_No',
  'Ration_Card_No',
  'Vehicle_RC_No',
  'occupation',
  'identification_marks',
  'DL_No',
  'Bank_Acount_Details',
  'Bank_Statement_Obtained_or_Not',
  'CDR_obtained_or_not',
  'Update_Database_cdat',
  'Update_Database_DOPAMS',
  'Nationality',
  'Accused_Status_Arrested_Absconding',
  'Offender_Type',
  'other_offender_type',
  'Mode_of_Financial_Transactions',
  'Mode_of_Drug_Procurement',
  'Mode_of_Drug_Delivery',
  'Preventive_Action',
  'Fit_for_68_F',
  'Fit_for_PITNDPS_Act',
  'History_Sheet_details',
  'Whether_booked_or_Counselled_or_not',
  'Remarks',
  'Facts_of_the_Case',
  'Date_of_Report',
  'Investigation_officer',
  'Case_Status',
  'Passport_No',
  'Passport_Place_of_Issue',
  'Passport_Date_of_Issue',
  'Date_of_Passport_Expiry',
  'Passport_issued_Country',
  'Visa_No',
  'Visa_Issued_date',
  'Visa_Expiary_Date',
  'Purpose_of_Visit_to_India',
  'Present_Occupation_in_India',
  'Places_visited_in_India_during_his_stay_With_reason',
  'Places_resided_in_Inida_during_his_stay_With_reason',
] as const;

export const IR54_REQUIRED_MAIN_FIELDS = [
  'IR_of_Accused',
  'District_Commissionerate',
  'Police_Station',
  'Cr_No',
  'Section_of_Law',
  'Name_of_Accused',
  'Nationality',
  'CDR_obtained_or_not',
  'Update_Database_cdat',
  'Update_Database_DOPAMS',
  'Accused_Status_Arrested_Absconding',
  'Offender_Type',
] as const;

export const IR54_DOCUMENT_FIELDS = [
  'FIR',
  'photograph',
  'Interrogation_report',
  'Confession_statement',
  'bank_statement',
  'CDAT_Links',
  'DOPAMS_Links',
  'Mobile_Analisys_Data',
] as const;

export const IR54_BANK_TRANSACTION_FIELDS = [
  'BankAccount_UPI_wallet_transaction_Date',
  'BankAccount_UPI_wallet_transaction_From',
  'BankAccount_UPI_wallet_transaction_To',
  'BankAccount_UPI_wallet_transaction_Amount',
  'BankAccount_UPI_wallet_transaction_no',
  'BankAccount_UPI_wallet_transaction_remarks',
] as const;

export const IR54_DRUG_DETAIL_FIELDS = [
  'Type_of_Drug',
  'Drug_Quantity',
  'Drug_Quantity_measurement',
  'Drug_Quantity_Worth',
  'Drug_Quantity_Type',
] as const;

export const IR54_SOCIAL_MEDIA_FIELDS = ['Social_Media_Accounts', 'Social_Media_Links'] as const;

export const IR54_PREVIOUS_CASE_FIELDS = [
  'Previous_Cr_No',
  'Previous_Section_of_Law',
  'previous_police_station',
  'Previous_District_Commissionerate',
  'Previous_case_state',
] as const;

export const IR54_PARCEL_DETAIL_FIELDS = [
  'Parcel_Details_Date',
  'Parcel_Details_From',
  'Parcel_Details_To',
  'Parcel_Details_Tracking_ID',
  'Parcel_Details_Courier_Service_Name',
] as const;

export const IR54_WHATSAPP_CHAT_FIELDS = [
  'Whatsapp_Chats_Date',
  'Whatsapp_Chats_From',
  'Whatsapp_Chats_To',
  'Whatsapp_Chats_Content',
  'Whatsapp_remarks',
] as const;

export const IR54_GANG_ASSOCIATE_FIELDS = [
  'Gang_associate_name',
  'Gang_associate_status',
  'Gange_associate_type',
] as const;

export const IR54_REPEATABLE_TABLES = {
  bankTransactions: {
    tableName: 'ir54_bank_transactions',
    fields: IR54_BANK_TRANSACTION_FIELDS,
  },
  drugDetails: {
    tableName: 'ir54_drug_details',
    fields: IR54_DRUG_DETAIL_FIELDS,
  },
  socialMediaAccounts: {
    tableName: 'ir54_social_media_accounts',
    fields: IR54_SOCIAL_MEDIA_FIELDS,
  },
  previousCases: {
    tableName: 'ir54_previous_cases',
    fields: IR54_PREVIOUS_CASE_FIELDS,
  },
  parcelDetails: {
    tableName: 'ir54_parcel_details',
    fields: IR54_PARCEL_DETAIL_FIELDS,
  },
  whatsappChats: {
    tableName: 'ir54_whatsapp_chats',
    fields: IR54_WHATSAPP_CHAT_FIELDS,
  },
  gangAssociates: {
    tableName: 'ir54_gang_associates',
    fields: IR54_GANG_ASSOCIATE_FIELDS,
  },
} as const;

export const IR54_LIST_FIELDS = [
  'IR_of_Accused',
  'District_Commissionerate',
  'Police_Station',
  'Cr_No',
  'Section_of_Law',
  'Name_of_Accused',
  'Nationality',
  'Accused_Status_Arrested_Absconding',
  'Offender_Type',
] as const;

export const IR54_DEFAULT_DATABASE_NAME = 'dopams_ir54_db';
