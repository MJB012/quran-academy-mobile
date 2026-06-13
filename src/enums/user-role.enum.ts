export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
}

export const USER_ROLE_VALUES = [UserRole.STUDENT, UserRole.TEACHER] as const;

export function parseUserRole(value: unknown): UserRole {
  return value === UserRole.TEACHER ? UserRole.TEACHER : UserRole.STUDENT;
}
