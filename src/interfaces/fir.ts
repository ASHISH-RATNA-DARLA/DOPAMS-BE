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

export interface FirFilterInput {
  firNumber?: string; // search box
  crimeType?: string; // search box
  name?: string;
  psName?: string[];
  relativeName?: string;
  caseStatus?: string[];
  units?: string[];
  dateRange?: Range<string>;
  caseClass?: string[];
  accuseds?: string[];
  years?: number[];
  drugTypes?: string[];
  domicile?: Domicile;
  drugQuantityRange?: Range<number>;
  drugWorthRange?: Range<number>;
}
