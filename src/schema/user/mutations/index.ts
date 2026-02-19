import AcceptUserInvite from './accept-user-invite';
import ForgotPassword from './forgot-password';
import Login from './login';
import Signup from './signup';
import UpdateBackgroundColor from './update-background-color';
import UpdateBulkUserStatus from './update-bulk-user-status';
import UpdateUserRole from './update-user-role';
import UpdateUserStatus from './update-user-status';
import RemoveUser from './remove-user';
import ResetPassword from './reset-password';
import CreateUser from './create-user';

const UserMutationFields = {
  login: Login,
  signup: Signup,
  createUser: CreateUser,
  acceptUserInvite: AcceptUserInvite,
  forgotPassword: ForgotPassword,
  resetPassword: ResetPassword,
  updateUserStatus: UpdateUserStatus,
  updateBulkUserStatus: UpdateBulkUserStatus,
  updateUserRole: UpdateUserRole,
  updateUserBackgroundColor: UpdateBackgroundColor,
  removeUser: RemoveUser,
};

export default UserMutationFields;
