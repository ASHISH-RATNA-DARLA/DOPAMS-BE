import { deny, or, rule } from 'graphql-shield';
import { shield } from 'graphql-shield';
import { GraphQLError } from 'graphql';

import RoleEnumType from 'schema/user/enums/user-role';
import { getUserRole } from 'schema/user/services';
import { getEnumValue } from 'utils/misc';

const isAuthenticated = rule({ cache: 'contextual' })(async (_root, _args, context, _info) => {
  const { currentUser } = context;
  if (currentUser && currentUser.email) return true;

  return new GraphQLError('Unauthenticated', {
    extensions: {
      code: 'UNAUTHENTICATED',
    },
  });
});

const isSuperAdmin = rule({ cache: 'contextual' })(async (_root, _args, context, _info) => {
  try {
    const { currentUser } = context;
    const userRole = await getUserRole(currentUser.id);

    if (userRole === getEnumValue(RoleEnumType.getValue('SUPER_ADMIN'))) return true;
  } catch (error) {
    // If the above is false or if currentUser is null we can proceed to raise an error
  }

  return new GraphQLError('You do not have the necessary permissions to view or perform this action', {
    extensions: {
      code: 'FORBIDDEN',
    },
  });
});

const isAdmin = rule({ cache: 'contextual' })(async (_root, _args, context, _info) => {
  try {
    const { currentUser } = context;
    const userRole = await getUserRole(currentUser.id);

    if (userRole === getEnumValue(RoleEnumType.getValue('ADMIN'))) return true;
  } catch (error) {
    // If the above is false or if currentUser is null we can proceed to raise an error
  }

  return new GraphQLError('You do not have the necessary permissions to view or perform this action', {
    extensions: {
      code: 'FORBIDDEN',
    },
  });
});

const allowByDefault = rule({ cache: 'contextual' })(async (_root, _args, _context, _info) => {
  return true;
});

const servicePermissions = shield(
  {
    Query: {},
    Mutation: {},
  },
  { allowExternalErrors: true }
);

const servicePermissionsWithAllEnabled = shield(
  {
    Query: {
      '*': allowByDefault,
    },
    Mutation: {
      '*': allowByDefault,
    },
  },
  { allowExternalErrors: true }
);

const servicePermissionsWithAllDisabled = shield(
  {
    Query: {
      '*': deny,
    },
    Mutation: {
      '*': deny,
    },
  },
  { allowExternalErrors: false }
);

export { servicePermissions, servicePermissionsWithAllEnabled, servicePermissionsWithAllDisabled };
