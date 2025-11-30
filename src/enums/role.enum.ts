export enum Role {
  ADMIN = 'ADMIN',
  DRIVER = 'DRIVER',
  CHARGE_POINT = 'CHARGE_POINT', // charge_point for driver to start charge
  STAFF = 'STAFF',
}

/**
 * Convert Role enum to text
 * @param role - Role enum value
 * @returns Text representation of the role
 */
export function roleToText(role: Role): string {
  switch (role) {
    case Role.ADMIN:
      return 'admin';
    case Role.DRIVER:
      return 'driver';
    case Role.CHARGE_POINT:
      return 'charge_point';
    case Role.STAFF:
      return 'staff';
    default:
      return 'unknown';
  }
}

/**
 * Convert text to Role enum
 * @param text - Text representation (case-insensitive)
 * @returns Role enum value or null if not found
 */
export function textToRole(text: string): Role | null {
  const normalized = text.toLowerCase().replace(/[-_\s]/g, '');

  switch (normalized) {
    case 'admin':
      return Role.ADMIN;
    case 'driver':
      return Role.DRIVER;
    case 'charge_point':
      return Role.CHARGE_POINT;
    case 'staff':
      return Role.STAFF;
    default:
      return null;
  }
}
