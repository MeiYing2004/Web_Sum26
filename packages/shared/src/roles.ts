/** Canonical user roles — single `users` table, field `role`. */
export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  CUSTOMER: 'customer',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

const LEGACY_ROLE_MAP: Record<string, UserRole> = {
  ADMIN: USER_ROLES.ADMIN,
  STAFF: USER_ROLES.EMPLOYEE,
  CUSTOMER: USER_ROLES.CUSTOMER,
  admin: USER_ROLES.ADMIN,
  employee: USER_ROLES.EMPLOYEE,
  customer: USER_ROLES.CUSTOMER,
};

export function normalizeRole(role: string | null | undefined): UserRole {
  if (!role) return USER_ROLES.CUSTOMER;
  return LEGACY_ROLE_MAP[role] ?? USER_ROLES.CUSTOMER;
}

export function hasAnyRole(userRole: string | null | undefined, allowed: string[]): boolean {
  const normalized = normalizeRole(userRole);
  return allowed.map(normalizeRole).includes(normalized);
}

export function isAdmin(role: string | null | undefined): boolean {
  return normalizeRole(role) === USER_ROLES.ADMIN;
}

export function isEmployee(role: string | null | undefined): boolean {
  return normalizeRole(role) === USER_ROLES.EMPLOYEE;
}

export function isStaffRole(role: string | null | undefined): boolean {
  return isAdmin(role) || isEmployee(role);
}
