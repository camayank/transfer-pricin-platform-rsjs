/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Advanced RBAC Engine
 *
 * Implements permission groups, field-level security, access restrictions,
 * and session policies for enterprise-grade access control.
 * ================================================================================
 */

// Types
export interface Permission {
  resource: string;
  action: PermissionAction;
  conditions?: PermissionCondition[];
}

export enum PermissionAction {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  EXPORT = "EXPORT",
  APPROVE = "APPROVE",
  ADMIN = "ADMIN",
}

export interface PermissionCondition {
  field: string;
  operator: "EQUALS" | "NOT_EQUALS" | "IN" | "NOT_IN" | "CONTAINS";
  value: unknown;
}

export interface PermissionGroupInput {
  firmId: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface FieldSecurityRule {
  firmId: string;
  entityType: string;
  fieldName: string;
  roles: string[];
  accessType: "READ" | "WRITE" | "BOTH";
  maskingType?: "NONE" | "PARTIAL" | "FULL";
}

export interface AccessRestriction {
  firmId: string;
  userId?: string;
  restrictionType: RestrictionType;
  config: RestrictionConfig;
}

export enum RestrictionType {
  IP = "IP",
  GEO = "GEO",
  TIME = "TIME",
  DEVICE = "DEVICE",
}

export type RestrictionConfig =
  | IpRestrictionConfig
  | GeoRestrictionConfig
  | TimeRestrictionConfig
  | DeviceRestrictionConfig;

export interface IpRestrictionConfig {
  type: "IP";
  allowedIps?: string[];
  blockedIps?: string[];
  allowedCidrs?: string[];
}

export interface GeoRestrictionConfig {
  type: "GEO";
  allowedCountries?: string[];
  blockedCountries?: string[];
  allowedStates?: string[];
}

export interface TimeRestrictionConfig {
  type: "TIME";
  allowedDays: number[]; // 0-6 (Sunday-Saturday)
  allowedHours: { start: number; end: number };
  timezone: string;
}

export interface DeviceRestrictionConfig {
  type: "DEVICE";
  allowedDeviceTypes?: string[];
  requireTrustedDevice?: boolean;
}

export interface SessionPolicy {
  firmId: string;
  name: string;
  maxSessionDuration?: number; // minutes
  idleTimeout?: number; // minutes
  maxConcurrentSessions?: number;
  requireMfa?: boolean;
  mfaMethods?: MfaMethod[];
  ipWhitelist?: string[];
}

export enum MfaMethod {
  TOTP = "TOTP",
  SMS = "SMS",
  EMAIL = "EMAIL",
  HARDWARE_KEY = "HARDWARE_KEY",
}

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  missingPermissions?: string[];
  restrictionViolations?: string[];
}

// =============================================================================
// PERMISSION SERVICE
// =============================================================================

export class PermissionService {
  /**
   * Default role permissions
   */
  private rolePermissions: Record<string, Permission[]> = {
    SUPER_ADMIN: [
      { resource: "*", action: PermissionAction.ADMIN },
    ],
    ADMIN: [
      { resource: "clients", action: PermissionAction.ADMIN },
      { resource: "engagements", action: PermissionAction.ADMIN },
      { resource: "documents", action: PermissionAction.ADMIN },
      { resource: "users", action: PermissionAction.READ },
      { resource: "users", action: PermissionAction.CREATE },
      { resource: "users", action: PermissionAction.UPDATE },
      { resource: "reports", action: PermissionAction.ADMIN },
      { resource: "settings", action: PermissionAction.ADMIN },
    ],
    PARTNER: [
      { resource: "clients", action: PermissionAction.ADMIN },
      { resource: "engagements", action: PermissionAction.ADMIN },
      { resource: "documents", action: PermissionAction.ADMIN },
      { resource: "users", action: PermissionAction.READ },
      { resource: "reports", action: PermissionAction.READ },
      { resource: "reports", action: PermissionAction.EXPORT },
    ],
    SENIOR_MANAGER: [
      { resource: "clients", action: PermissionAction.READ },
      { resource: "clients", action: PermissionAction.UPDATE },
      { resource: "engagements", action: PermissionAction.ADMIN },
      { resource: "documents", action: PermissionAction.ADMIN },
      { resource: "reports", action: PermissionAction.READ },
      { resource: "reports", action: PermissionAction.CREATE },
    ],
    MANAGER: [
      { resource: "clients", action: PermissionAction.READ },
      { resource: "engagements", action: PermissionAction.READ },
      { resource: "engagements", action: PermissionAction.UPDATE },
      { resource: "documents", action: PermissionAction.READ },
      { resource: "documents", action: PermissionAction.CREATE },
      { resource: "documents", action: PermissionAction.UPDATE },
      { resource: "reports", action: PermissionAction.READ },
    ],
    ASSOCIATE: [
      { resource: "clients", action: PermissionAction.READ },
      { resource: "engagements", action: PermissionAction.READ },
      { resource: "documents", action: PermissionAction.READ },
      { resource: "documents", action: PermissionAction.CREATE },
    ],
    TRAINEE: [
      { resource: "clients", action: PermissionAction.READ },
      { resource: "engagements", action: PermissionAction.READ },
      { resource: "documents", action: PermissionAction.READ },
    ],
  };

  /**
   * Get permissions for a role
   */
  getRolePermissions(role: string): Permission[] {
    return this.rolePermissions[role] || [];
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(
    userPermissions: Permission[],
    resource: string,
    action: PermissionAction,
    context?: Record<string, unknown>
  ): boolean {
    for (const permission of userPermissions) {
      // Check wildcard admin permission
      if (permission.resource === "*" && permission.action === PermissionAction.ADMIN) {
        return true;
      }

      // Check resource match
      if (permission.resource !== resource && permission.resource !== "*") {
        continue;
      }

      // Check action match (ADMIN grants all actions)
      if (permission.action !== action && permission.action !== PermissionAction.ADMIN) {
        continue;
      }

      // Check conditions if any
      if (permission.conditions && permission.conditions.length > 0) {
        const conditionsMet = this.evaluateConditions(permission.conditions, context);
        if (!conditionsMet) continue;
      }

      return true;
    }

    return false;
  }

  private evaluateConditions(
    conditions: PermissionCondition[],
    context?: Record<string, unknown>
  ): boolean {
    if (!context) return false;

    return conditions.every((condition) => {
      const contextValue = context[condition.field];

      switch (condition.operator) {
        case "EQUALS":
          return contextValue === condition.value;
        case "NOT_EQUALS":
          return contextValue !== condition.value;
        case "IN":
          return Array.isArray(condition.value) && condition.value.includes(contextValue);
        case "NOT_IN":
          return Array.isArray(condition.value) && !condition.value.includes(contextValue);
        case "CONTAINS":
          return String(contextValue).includes(String(condition.value));
        default:
          return false;
      }
    });
  }

  /**
   * Merge permissions from multiple sources
   */
  mergePermissions(
    rolePermissions: Permission[],
    groupPermissions: Permission[],
    overrides: Array<{ permission: string; granted: boolean }>
  ): Permission[] {
    const permissionSet = new Map<string, Permission>();

    // Add role permissions
    for (const perm of rolePermissions) {
      const key = `${perm.resource}:${perm.action}`;
      permissionSet.set(key, perm);
    }

    // Add group permissions
    for (const perm of groupPermissions) {
      const key = `${perm.resource}:${perm.action}`;
      permissionSet.set(key, perm);
    }

    // Apply overrides
    for (const override of overrides) {
      const [resource, action] = override.permission.split(":");
      const key = override.permission;

      if (override.granted) {
        permissionSet.set(key, {
          resource,
          action: action as PermissionAction,
        });
      } else {
        permissionSet.delete(key);
      }
    }

    return Array.from(permissionSet.values());
  }
}

// =============================================================================
// FIELD SECURITY SERVICE
// =============================================================================

export class FieldSecurityService {
  /**
   * Check if user can access field
   */
  canAccessField(
    rule: FieldSecurityRule | undefined,
    userRole: string,
    accessType: "READ" | "WRITE"
  ): boolean {
    if (!rule) return true; // No rule means no restriction

    if (!rule.roles.includes(userRole)) {
      return false;
    }

    if (accessType === "WRITE" && rule.accessType === "READ") {
      return false;
    }

    return true;
  }

  /**
   * Apply field masking
   */
  maskField(value: unknown, maskingType: "NONE" | "PARTIAL" | "FULL"): unknown {
    if (value === null || value === undefined) return value;

    switch (maskingType) {
      case "NONE":
        return value;

      case "PARTIAL":
        const strValue = String(value);
        if (strValue.length <= 4) {
          return "****";
        }
        return strValue.substring(0, 2) + "****" + strValue.slice(-2);

      case "FULL":
        return "********";

      default:
        return value;
    }
  }

  /**
   * Apply field security to an object
   */
  applyFieldSecurity(
    data: Record<string, unknown>,
    entityType: string,
    rules: FieldSecurityRule[],
    userRole: string
  ): Record<string, unknown> {
    const result: Record<string, unknown> = { ...data };

    for (const rule of rules) {
      if (rule.entityType !== entityType) continue;

      const fieldName = rule.fieldName;
      if (!(fieldName in result)) continue;

      if (!this.canAccessField(rule, userRole, "READ")) {
        delete result[fieldName];
      } else if (rule.maskingType && rule.maskingType !== "NONE") {
        result[fieldName] = this.maskField(result[fieldName], rule.maskingType);
      }
    }

    return result;
  }

  /**
   * Get writable fields for role
   */
  getWritableFields(
    entityType: string,
    rules: FieldSecurityRule[],
    userRole: string,
    allFields: string[]
  ): string[] {
    const restrictedFields = new Set<string>();

    for (const rule of rules) {
      if (rule.entityType !== entityType) continue;

      if (!this.canAccessField(rule, userRole, "WRITE")) {
        restrictedFields.add(rule.fieldName);
      }
    }

    return allFields.filter((f) => !restrictedFields.has(f));
  }
}

// =============================================================================
// ACCESS RESTRICTION SERVICE
// =============================================================================

export class AccessRestrictionService {
  /**
   * Check IP restriction
   */
  checkIpRestriction(
    config: IpRestrictionConfig,
    clientIp: string
  ): { allowed: boolean; reason?: string } {
    // Check blocked IPs first
    if (config.blockedIps && config.blockedIps.includes(clientIp)) {
      return { allowed: false, reason: "IP address is blocked" };
    }

    // Check allowed IPs
    if (config.allowedIps && config.allowedIps.length > 0) {
      if (!config.allowedIps.includes(clientIp)) {
        return { allowed: false, reason: "IP address not in allowed list" };
      }
    }

    // Check CIDR ranges
    if (config.allowedCidrs && config.allowedCidrs.length > 0) {
      const isInRange = config.allowedCidrs.some((cidr) =>
        this.isIpInCidr(clientIp, cidr)
      );
      if (!isInRange) {
        return { allowed: false, reason: "IP address not in allowed range" };
      }
    }

    return { allowed: true };
  }

  private isIpInCidr(ip: string, cidr: string): boolean {
    const [range, bits] = cidr.split("/");
    const mask = ~(2 ** (32 - parseInt(bits)) - 1);
    const ipNum = this.ipToNumber(ip);
    const rangeNum = this.ipToNumber(range);
    return (ipNum & mask) === (rangeNum & mask);
  }

  private ipToNumber(ip: string): number {
    return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  }

  /**
   * Check geo restriction
   */
  checkGeoRestriction(
    config: GeoRestrictionConfig,
    country: string,
    state?: string
  ): { allowed: boolean; reason?: string } {
    // Check blocked countries
    if (config.blockedCountries && config.blockedCountries.includes(country)) {
      return { allowed: false, reason: "Access from this country is blocked" };
    }

    // Check allowed countries
    if (config.allowedCountries && config.allowedCountries.length > 0) {
      if (!config.allowedCountries.includes(country)) {
        return { allowed: false, reason: "Access not allowed from this country" };
      }
    }

    // Check allowed states
    if (state && config.allowedStates && config.allowedStates.length > 0) {
      if (!config.allowedStates.includes(state)) {
        return { allowed: false, reason: "Access not allowed from this state" };
      }
    }

    return { allowed: true };
  }

  /**
   * Check time restriction
   */
  checkTimeRestriction(
    config: TimeRestrictionConfig,
    currentTime: Date = new Date()
  ): { allowed: boolean; reason?: string } {
    // Get time in the configured timezone
    const options = { timeZone: config.timezone };
    const formatter = new Intl.DateTimeFormat("en-US", {
      ...options,
      weekday: "short",
      hour: "numeric",
      hour12: false,
    });

    const parts = formatter.formatToParts(currentTime);
    const dayPart = parts.find((p) => p.type === "weekday");
    const hourPart = parts.find((p) => p.type === "hour");

    const dayMap: Record<string, number> = {
      Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
    };
    const day = dayMap[dayPart?.value || ""] ?? currentTime.getDay();
    const hour = parseInt(hourPart?.value || "0");

    // Check day
    if (!config.allowedDays.includes(day)) {
      return { allowed: false, reason: "Access not allowed on this day" };
    }

    // Check hour
    if (hour < config.allowedHours.start || hour >= config.allowedHours.end) {
      return {
        allowed: false,
        reason: `Access only allowed between ${config.allowedHours.start}:00 and ${config.allowedHours.end}:00`,
      };
    }

    return { allowed: true };
  }

  /**
   * Check all restrictions for a user
   */
  checkAllRestrictions(
    restrictions: AccessRestriction[],
    context: {
      ip?: string;
      country?: string;
      state?: string;
      deviceType?: string;
      currentTime?: Date;
    }
  ): AccessCheckResult {
    const violations: string[] = [];

    for (const restriction of restrictions) {
      if (!restriction.config) continue;

      let result: { allowed: boolean; reason?: string } = { allowed: true };

      switch (restriction.restrictionType) {
        case RestrictionType.IP:
          if (context.ip) {
            result = this.checkIpRestriction(
              restriction.config as IpRestrictionConfig,
              context.ip
            );
          }
          break;

        case RestrictionType.GEO:
          if (context.country) {
            result = this.checkGeoRestriction(
              restriction.config as GeoRestrictionConfig,
              context.country,
              context.state
            );
          }
          break;

        case RestrictionType.TIME:
          result = this.checkTimeRestriction(
            restriction.config as TimeRestrictionConfig,
            context.currentTime
          );
          break;

        case RestrictionType.DEVICE:
          // Device restriction implementation would go here
          break;
      }

      if (!result.allowed && result.reason) {
        violations.push(result.reason);
      }
    }

    return {
      allowed: violations.length === 0,
      restrictionViolations: violations.length > 0 ? violations : undefined,
    };
  }
}

// =============================================================================
// SESSION POLICY SERVICE
// =============================================================================

export class SessionPolicyService {
  /**
   * Validate session against policy
   */
  validateSession(
    policy: SessionPolicy,
    session: {
      createdAt: Date;
      lastActivityAt: Date;
      ipAddress?: string;
    }
  ): { valid: boolean; reason?: string; shouldRefresh?: boolean } {
    const now = new Date();

    // Check session duration
    if (policy.maxSessionDuration) {
      const sessionAge = (now.getTime() - new Date(session.createdAt).getTime()) / 60000;
      if (sessionAge > policy.maxSessionDuration) {
        return { valid: false, reason: "Session has exceeded maximum duration" };
      }
    }

    // Check idle timeout
    if (policy.idleTimeout) {
      const idleTime = (now.getTime() - new Date(session.lastActivityAt).getTime()) / 60000;
      if (idleTime > policy.idleTimeout) {
        return { valid: false, reason: "Session has timed out due to inactivity" };
      }

      // Warn if approaching timeout
      if (idleTime > policy.idleTimeout * 0.8) {
        return { valid: true, shouldRefresh: true };
      }
    }

    // Check IP whitelist
    if (policy.ipWhitelist && policy.ipWhitelist.length > 0 && session.ipAddress) {
      if (!policy.ipWhitelist.includes(session.ipAddress)) {
        return { valid: false, reason: "Session IP not in whitelist" };
      }
    }

    return { valid: true };
  }

  /**
   * Check if MFA is required
   */
  isMfaRequired(policy: SessionPolicy): boolean {
    return policy.requireMfa === true;
  }

  /**
   * Get allowed MFA methods
   */
  getAllowedMfaMethods(policy: SessionPolicy): MfaMethod[] {
    if (!policy.mfaMethods || policy.mfaMethods.length === 0) {
      return [MfaMethod.EMAIL]; // Default to email
    }
    return policy.mfaMethods;
  }

  /**
   * Check concurrent session limit
   */
  checkConcurrentSessions(
    policy: SessionPolicy,
    activeSessions: number
  ): { allowed: boolean; reason?: string } {
    if (!policy.maxConcurrentSessions) {
      return { allowed: true };
    }

    if (activeSessions >= policy.maxConcurrentSessions) {
      return {
        allowed: false,
        reason: `Maximum concurrent sessions (${policy.maxConcurrentSessions}) exceeded`,
      };
    }

    return { allowed: true };
  }
}

// Export instances for convenience
export const permissionService = new PermissionService();
export const fieldSecurityService = new FieldSecurityService();
export const accessRestrictionService = new AccessRestrictionService();
export const sessionPolicyService = new SessionPolicyService();
