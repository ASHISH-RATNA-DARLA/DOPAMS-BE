import UserMutationFields from './user/mutations';
import FirMutationFields from './firs/mutations';
import CriminalProfileMutationFields from './criminal-profile/mutations';
import Ir54MutationFields from './ir54/mutations';

const mutationFields = {
  ...UserMutationFields,
  ...FirMutationFields,
  ...CriminalProfileMutationFields,
  ...Ir54MutationFields,
};

export default mutationFields;
