import {
  opsAdminUser,
  singleTenantWorkspace,
  superAdminUser,
  type AuthUser,
  type UserRole
} from "@ustaca/domain";

export const permissionMatrix = {
  super_admin: [
    "customers:read",
    "customers:write",
    "trials:read",
    "trials:write",
    "payments:read",
    "payments:write",
    "domains:read",
    "domains:write",
    "support:read",
    "roles:write",
    "reports:read",
    "system:write"
  ],
  ops_admin: [
    "customers:read",
    "trials:read",
    "trials:write",
    "payments:read",
    "payments:write",
    "domains:read",
    "domains:write",
    "support:read",
    "support:write",
    "reports:read"
  ],
  customer: [
    "site:read",
    "site:write",
    "services:write",
    "gallery:write",
    "forms:read",
    "appointments:read",
    "domain:read",
    "billing:read",
    "support:write"
  ]
} as const satisfies Record<UserRole, readonly string[]>;

export type Permission = (typeof permissionMatrix)[UserRole][number];

export const createSessionScope = (user: AuthUser) => ({
  businessId: user.role === "customer" ? singleTenantWorkspace.business.id : null,
  siteId: user.role === "customer" ? singleTenantWorkspace.site.id : null,
  permissions: permissionMatrix[user.role]
});

export const mockSuperAdminUser = superAdminUser;
export const mockOpsAdminUser = opsAdminUser;
export const mockCustomerUser = singleTenantWorkspace.user;

