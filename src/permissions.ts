import { deny, rule, shield } from 'graphql-shield';

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
