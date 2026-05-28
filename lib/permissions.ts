export type UserType = 'employee' | 'manager' | 'admin' | 'super_admin';

/**
 * Path-prefix permissions. Per-transcript hierarchy:
 *   employee  : day-to-day ops (orders, manifests, runsheets, ewaybill, dashboard)
 *   manager   : the above + masters + analytics
 *   admin     : the above + EMS (users/permissions) + organization
 *   super_admin: everything (root)
 *
 * A prefix matches if the requested path equals it or starts with `prefix + '/'`.
 * Most-specific (longest) matching prefix wins.
 */
const RULES: { prefix: string; allow: UserType[] }[] = [
  { prefix: '/dashboard',    allow: ['employee', 'manager', 'admin', 'super_admin'] },
  { prefix: '/booking',      allow: ['employee', 'manager', 'admin', 'super_admin'] },
  { prefix: '/manifest',     allow: ['employee', 'manager', 'admin', 'super_admin'] },
  { prefix: '/runsheet',     allow: ['employee', 'manager', 'admin', 'super_admin'] },
  { prefix: '/ewaybill',     allow: ['employee', 'manager', 'admin', 'super_admin'] },

  { prefix: '/master',       allow: ['manager', 'admin', 'super_admin'] },
  { prefix: '/analytics',    allow: ['manager', 'admin', 'super_admin'] },

  { prefix: '/ems',          allow: ['admin', 'super_admin'] },
  { prefix: '/organization', allow: ['admin', 'super_admin'] },
];

export function canAccessPath(userType: UserType | null | undefined, path: string): boolean {
  if (!userType) return false;
  if (userType === 'super_admin') return true;

  let bestRule: { prefix: string; allow: UserType[] } | null = null;
  for (const r of RULES) {
    if (path === r.prefix || path.startsWith(r.prefix + '/')) {
      if (!bestRule || r.prefix.length > bestRule.prefix.length) bestRule = r;
    }
  }
  if (!bestRule) return true;
  return bestRule.allow.includes(userType);
}

export type NavGroupKey = 'dashboard' | 'organization' | 'ewaybill' | 'booking' | 'runsheet' | 'manifest' | 'ems' | 'master';

export const NAV_GROUP_PATH: Record<NavGroupKey, string> = {
  dashboard:    '/dashboard',
  organization: '/organization',
  ewaybill:     '/ewaybill',
  booking:      '/booking',
  runsheet:     '/runsheet',
  manifest:     '/manifest',
  ems:          '/ems',
  master:       '/master',
};

export function visibleNavGroups(userType: UserType | null | undefined): Set<NavGroupKey> {
  const out = new Set<NavGroupKey>();
  for (const key of Object.keys(NAV_GROUP_PATH) as NavGroupKey[]) {
    if (canAccessPath(userType, NAV_GROUP_PATH[key])) out.add(key);
  }
  return out;
}
