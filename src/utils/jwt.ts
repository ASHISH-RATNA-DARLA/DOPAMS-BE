import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { user } from '@prisma/client';

const APP_SECRET = process.env.APP_SECRET || '12345';

export const generateAccessToken = (user: user): string => {
  return sign({ userId: user.id }, APP_SECRET, {
    expiresIn: '30d',
  });
};

export const generateUserInviteToken = (user: user): string => {
  return sign(user, APP_SECRET, {
    expiresIn: '15d',
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return verify(token, APP_SECRET) as JwtPayload;
};
