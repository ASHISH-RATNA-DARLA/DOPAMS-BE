import { Prisma, User } from '@prisma/client';
import { JsonWebTokenError, JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import { v4 } from 'uuid';
import UserAuthException from 'utils/errors/userAuthException';
import { generateAccessToken, generateUserInviteToken, verifyToken } from 'utils/jwt';
import hashPassword, { getEnumValue } from 'utils/misc';
import { sendEmail, templates } from 'utils/sendgrid';
import UserStatusEnumType from '../enums/user-status';
import AuthenticationError from 'utils/errors/authentication-error';
import bcrypt from 'bcrypt';
import UserRoleEnumType from '../enums/user-role';
import { prisma } from 'datasources/prisma';

const login = async (email: string, password: string) => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new UserAuthException('User not found');
  }

  if (await bcrypt.compare(password, user.password)) {
    const token = generateAccessToken(user);
    return {
      token,
      user,
    };
  } else {
    throw new UserAuthException('Invalid password');
  }
};

// WIP
// Updated signup function to match the Prisma schema
const signup = async (email: string, password: string) => {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new UserAuthException('User already exists');
  }

  // Create a new user with a linked person record
  const user = await prisma.user.create({
    data: {
      id: v4(),
      email,
      password: await bcrypt.hash(password, 10),
      role: getEnumValue(UserRoleEnumType.getValue('VIEWER')),
      status: getEnumValue(UserStatusEnumType.getValue('ACTIVE')),
    },
  });

  const token = generateAccessToken(user);
  return {
    token,
    user,
  };
};

const acceptUserInviteAndSetPassword = async (inviteToken, password) => {
  // validate invite token
  const inviteDetails = verifyToken(inviteToken);
  if (!inviteDetails) {
    throw new UserAuthException('Invalid invite token');
  }

  const updatedUserDetails = await prisma.user.update({
    where: {
      id: inviteDetails.id,
    },
    data: {
      status: getEnumValue(UserStatusEnumType.getValue('ACTIVE')),
      password: hashPassword(password),
    },
  });
  return {
    token: generateAccessToken(updatedUserDetails),
    user: updatedUserDetails,
  };
};

const forgotPassword = async (emailId: string, callBackUrl: string) => {
  const userDetails = await getUserByEmail(emailId);
  if (!userDetails) {
    throw new UserAuthException('Invalid Email address');
  }

  await sendForgotPasswordToken(userDetails, callBackUrl);
  return {
    status: true,
    message: 'Password reset email sent successfully.',
  };
};

// WIP
// Updated to match the current user schema
const sendForgotPasswordToken = async (user: User, callBackUrl: string) => {
  const passwordResetToken = generateUserInviteToken(user);

  // Get the person's name if available
  let userName = user.email;

  await sendEmail({
    receiver: user.email,
    format: templates.FORGOT_PASSWORD,
    templateData: {
      user: userName,
      value: `${callBackUrl}/${user.id}?token=${passwordResetToken}`,
    },
  });
};

const resetPassword = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    // include: { person: true },
  });

  if (!user) {
    throw new UserAuthException('User not found');
  }

  // reset password for the user
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      // password: await bcrypt.hash(generateRandomPassword(), 0),
      password: await bcrypt.hash('password', 10),
    },
  });

  //   if (!user.person) {
  //     throw new UserAuthException('Associated person not found');
  //   }

  // Uncomment after Testing
  // await sendEmail({
  //   receiver: user.email,
  //   format: templates.FORGOT_PASSWORD,
  //   templateData: {
  //     user: `${user.person.firstName} ${user.person.lastName}`,
  //     value: `${randomPassword}`,
  //   },
  // });

  return {
    status: true,
    message: 'Password reset email sent successfully.',
  };
};

const getUserByEmail = async (email: string): Promise<User | null> => {
  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: 'insensitive',
      },
    },
  });
  console.log('User found by email:', user);
  return user;
};

// WIP
// Updated upsertUser function to match the current schema
// const upsertUser = async ({
//   id,
//   email,
//   password,
//   role,
//   status,
//   personId,
// }: {
//   id?: string;
//   email: string;
//   password?: string;
//   role: number;
//   status: number;
//   personId?: string;
// }): Promise<user> => {
//   return prisma.user.upsert({
//     where: {
//       id: id ? id : '00000000-0000-0000-0000-000000000000',
//     },
//     create: {
//       id: v4(),
//       email,
//       password: password ? await bcrypt.hash(password, 10) : await bcrypt.hash(v4(), 10),
//       role,
//       status,
//       personId,
//     },
//     update: {
//       email,
//       password: password ? await bcrypt.hash(password, 10) : undefined,
//       role,
//       status,
//       personId,
//     },
//   });
// };

const getUser = (id: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id },
  });
};

const getUsers = async (
  page: number = 1,
  limit: number = 10,
  sortKey: keyof User = 'createdAt',
  sortType: Prisma.SortOrder = 'desc',
  filters: {
    text?: string;
    status?: number;
    roles?: number[];
  } = {}
) => {
  const { text = '', status, roles } = filters;
  console.log('getUsers filters:', { text, status, roles });
  const [users, pageInfo] = await prisma.user
    .paginate({
      where: {
        status,
        OR: [{ email: { contains: text } }],
        role: roles ? { in: roles } : undefined,
      },
      orderBy: {
        [sortKey]: sortType,
      },
    })
    .withPages({
      page,
      limit,
    });

  console.log(`getUsers returned ${users.length} users. totalCount: ${pageInfo.totalCount}`);
  return { users, pageInfo };
};

const authenticateUser = async (request): Promise<User | null> => {
  if (request?.headers?.authorization) {
    const [type, token] = request.headers.authorization.split(' ');
    if (type === 'Bearer') {
      try {
        const tokenPayload = verifyToken(token) as JwtPayload;
        const userId = tokenPayload.userId;
        return await prisma.user.findUnique({ where: { id: userId } });
      } catch (error) {
        console.log('Authentication failed:', error.message);
        return null;
      }
    }
  }

  return null;
};

// WIP
// Updated to match the current user schema
const sendUserInviteDetails = async (user: User, callBackUrl: string) => {
  const userInviteToken = generateUserInviteToken(user);

  // Get the person's name if available
  let userName = user.email;

  await sendEmail({
    receiver: user.email,
    format: templates.INVITE_USER_TO_REPOSITORY,
    templateData: {
      user: userName,
      value: `${callBackUrl}/${user.id}?token=${userInviteToken}`,
    },
  });
};

const getUserRole = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  return user?.role;
};

const updateUserStatus = async (userId: string, status: number) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status,
    },
  });
};

const updateBulkUserStatus = async (ids: string[], status: number) => {
  const bulkUpdate = await prisma.user.updateMany({
    where: {
      id: {
        in: ids,
      },
    },
    data: {
      status,
    },
  });

  if (bulkUpdate) {
    return true;
  }

  return false;
};

const updateUserRole = async (userId: string, role: number) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role,
    },
  });
};

const removeUser = async (id: string) => {
  return prisma.user.delete({
    where: {
      id,
    },
  });
};

const updateUserBackgroundColor = async (userId: string, backgroundColor: string) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      backgroundColor,
    },
  });
};

// Updated createUser function to match the Prisma schema
const createUser = async (email: string, password: string, role: number) => {
  const user = await getUserByEmail(email);
  if (user) {
    throw new UserAuthException('User already exists');
  }

  return prisma.user.create({
    data: {
      id: v4(),
      email,
      role,
      password: await bcrypt.hash(password, 10),
      status: getEnumValue(UserStatusEnumType.getValue('ACTIVE')),
    },
  });
};

export {
  login,
  signup,
  createUser,
  acceptUserInviteAndSetPassword,
  forgotPassword,
  resetPassword,
  getUserByEmail,
  getUser,
  getUsers,
  authenticateUser,
  sendUserInviteDetails,
  getUserRole,
  updateUserStatus,
  updateBulkUserStatus,
  updateUserRole,
  updateUserBackgroundColor,
  removeUser,
};
