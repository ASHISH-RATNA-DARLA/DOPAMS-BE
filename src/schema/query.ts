import HomeQueryFields from './home/query';
import UserQueryFields from './user/query';
import PersonQueryFields from './persons/query';
import CriminalProfileQueryFields from './criminal-profile/query';
import FirQueryFields from './firs/query';
import SeizuresQueryFields from './firs/query/seizures';
import AccusedQueryFields from './accused/query';
import AdvancedSearchQueryFields from './advanced-search/query';

const queryFields = {
  ...HomeQueryFields,
  ...UserQueryFields,
  ...CriminalProfileQueryFields,
  ...PersonQueryFields,
  ...FirQueryFields,
  ...SeizuresQueryFields,
  ...AccusedQueryFields,
  ...AdvancedSearchQueryFields,
};

export default queryFields;
