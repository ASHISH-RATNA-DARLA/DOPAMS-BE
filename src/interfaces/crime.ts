interface CrimeEntity {
  crime_id: string;
  accused_no?: string;
  fir_no?: string;
  year?: string;
  sec_of_law?: string;
  crime_ps?: string;
  crime_district?: string;
  crime_state?: string;
  crime_mo?: string;
  crime_major_head?: string;
  crime_property_lost?: string;
  offence_phone?: string;
  offence_email?: string;
  offence_facebook?: string;
  offence_other_social_media?: string;
  offence_bank_account?: string;
  offence_bank_name?: string;
  offence_bank_state?: string;
  offence_bank_district?: string;
  offence_ifsc_code?: string;
  remarks?: string;
  crime_crtd_date?: string;
  crime_mdfd_date?: string;
  crime_crtd_user?: string;
  crime_mdfd_user?: string;
  wallet_info?: string;
  fir_contents?: string;
  crime_material_seized?: string;
  crime_personcategory?: string;
  fir_reg_num?: string;
  drug_type?: string;
  person_category_search?: string;
  mdfd_user?: string;
  deported_date?: string;
  deported_country?: string;
  charge_sheet_remarks?: string;
  confession_statement?: string;
  remand_report?: string;
  ir_status?: string;
  ir_content?: string;
  fsl_report?: string;
  seizure?: string;
  fir_status?: string;
  cc_no__?: string;
}

interface CrimesEntity {
  crimes: CrimeEntity[];
  pageInfo: any;
}

export { CrimeEntity, CrimesEntity };
