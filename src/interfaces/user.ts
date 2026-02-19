interface UserEntity {
  id: string;
  personId: string | null;
  email: string;
  password: string | null;
  role: number;
  status: number;
  createdAt: Date;
  updatedAt: Date;
}

interface UserSessionEntity {
  id: string;
  token: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UsersEntity {
  users;
  pageInfo;
}

export { UserEntity, UsersEntity, UserSessionEntity };
