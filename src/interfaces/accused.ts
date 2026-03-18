type Range<T> = {
  from?: T;
  to?: T;
};

type Domicile = {
  houseNo?: string;
  streetRoadNo?: string;
  wardColony?: string;
  landmarkMilestone?: string;
  localityVillage?: string;
  areaMandal?: string;
  district?: string;
  stateUT?: string;
  country?: string;
  residencyType?: string;
  pinCode?: string;
  jurisdictionPS?: string;
};

export interface AccusedFilterInput {
  name?: string; // search box filter
  units?: string[];
  years?: number[];
  accuseds?: string[];
  drugTypes?: string[];
  nationality?: string[];
  state?: string[];
  gender?: string[];
  caseStatus?: string[];
  domicile?: Domicile;
  domicileClass?: string[];
  ageRange?: Range<number>;
  dateRange?: Range<string>;
  ps?: string[];
  caseClass?: string[];
  accusedStatus?: string[];
  accusedType?: string[];
  // NEW: filter by role in crime (peddler, supplier, transporter, etc.)
  // Maps to brief_facts_accused.accused_type via the "accusedRole" column in accuseds_mv
  accusedRole?: string[];
}
