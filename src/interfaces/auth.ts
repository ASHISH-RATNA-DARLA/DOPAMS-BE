interface PasswordResetEntity {
  id: string;
  userId: string;
  resetToken: string;
  requestedAt: Date;
}

export { PasswordResetEntity };
