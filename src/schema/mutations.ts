import UserMutationFields from './user/mutations';
import FirMutationFields from './firs/mutations';
import CriminalProfileMutationFields from './criminal-profile/mutations';

const mutationFields = {
  ...UserMutationFields,
  ...FirMutationFields,
  ...CriminalProfileMutationFields,
};

export default mutationFields;
