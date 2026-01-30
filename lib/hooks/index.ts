/**
 * DigiComply React Query Hooks
 *
 * Central export for all data fetching hooks.
 * All hooks use React Query for caching, revalidation, and optimistic updates.
 */

// Audit hooks
export {
  useAuditLogs,
  useVerifyAuditChain,
  useExportAuditLogs,
  auditKeys,
  type AuditLogEntry,
  type AuditLogFilters,
} from "./use-audit";

// Project hooks
export {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  projectKeys,
  type Project,
  type ProjectFilters,
  type CreateProjectInput,
} from "./use-projects";

// Health score hooks
export {
  useHealthScores,
  useHealthScore,
  useRecalculateHealthScores,
  healthScoreKeys,
  type CustomerHealthScore,
  type HealthScoreFilters,
} from "./use-health-scores";

// AI recommendation hooks
export {
  useRecommendations,
  useDismissRecommendation,
  useActOnRecommendation,
  recommendationKeys,
  type AiRecommendation,
} from "./use-recommendations";

// KPI hooks
export {
  useKpis,
  useKpi,
  useKpiHistory,
  useCreateKpi,
  useUpdateKpi,
  kpiKeys,
  type KpiDefinition,
  type CreateKpiInput,
} from "./use-kpis";

// User hooks
export {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeactivateUser,
  useChangePassword,
  userKeys,
  type User,
  type UserFilters,
  type CreateUserInput,
  type UpdateUserInput,
} from "./use-users";

// Permission hooks
export {
  usePermissions,
  hasPermission,
  canAccessMenu,
  isRoleAtLeast,
  getRoleLevel,
  PermissionAction,
  ROLE_HIERARCHY,
  MENU_PERMISSIONS,
  type UserRole,
  type PermissionGuardProps,
} from "./use-permissions";

// Compliance hooks
export {
  // Data Requests
  useDataRequests,
  useDataRequest,
  useCreateDataRequest,
  useUpdateDataRequest,
  dataRequestKeys,
  // Security Incidents
  useSecurityIncidents,
  useSecurityIncident,
  useCreateIncident,
  useUpdateIncident,
  incidentKeys,
  // Access Reviews
  useAccessReviews,
  useAccessReview,
  useCreateAccessReview,
  useUpdateAccessReview,
  useSubmitReviewDecision,
  accessReviewKeys,
  // Types
  type DataDeletionRequest,
  type SecurityIncident,
  type AccessReview,
  type AccessReviewItem,
  type DataRequestFilters,
  type AccessReviewFilters,
} from "./use-compliance";
