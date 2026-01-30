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

// Firm hooks
export { useFirm } from "./use-firm";

// Client hooks
export {
  useClients,
  useClient,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  useClientStats,
  clientKeys,
  type Client,
  type ClientFilters,
} from "./use-clients";

// Engagement hooks
export {
  useEngagements,
  useEngagement,
  useClientEngagements,
  useCreateEngagement,
  useUpdateEngagement,
  useUpdateEngagementStatus,
  useDeleteEngagement,
  useEngagementStats,
  engagementKeys,
  ENGAGEMENT_STATUS_ORDER,
  getStatusIndex,
  getNextStatus,
  getPreviousStatus,
  getStatusLabel,
  getPriorityColor,
  type Engagement,
  type EngagementStatus,
  type Priority,
  type EngagementFilters,
} from "./use-engagements";

// Associated Enterprise hooks
export {
  useAssociatedEnterprises,
  useClientAssociatedEnterprises,
  useAssociatedEnterprise,
  useCreateAssociatedEnterprise,
  useUpdateAssociatedEnterprise,
  useDeleteAssociatedEnterprise,
  aeKeys,
  getRelationshipLabel,
  getRelationshipShort,
  type AssociatedEnterprise,
  type RelationshipType,
  type AssociatedEnterpriseFilters,
} from "./use-associated-enterprises";

// International Transaction hooks
export {
  useTransactions,
  useEngagementTransactions,
  useTransaction,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useBulkUpdateTransactions,
  transactionKeys,
  getTransactionTypeLabel,
  getTPMethodLabel,
  getPLITypeLabel,
  formatAmount,
  type InternationalTransaction,
  type TransactionType,
  type TPMethod,
  type PLIType,
  type SafeHarbourType,
  type TransactionFilters,
} from "./use-transactions";

// Dispute hooks
export {
  useDisputes,
  useEngagementDisputes,
  useDispute,
  useCreateDispute,
  useUpdateDispute,
  useEscalateDispute,
  useResolveDispute,
  useDeleteDispute,
  useDisputeStats,
  disputeKeys,
  getStageLabel,
  getStageShort,
  getStatusLabel as getDisputeStatusLabel,
  getOutcomeLabel,
  getOutcomeColor,
  DISPUTE_STAGE_ORDER,
  getNextStage,
  canEscalate,
  getDRPDeadline,
  getITATDeadline,
  type DisputeCase,
  type DisputeStage,
  type DisputeStatus,
  type DisputeFilters,
} from "./use-disputes";

// Document hooks
export {
  useDocuments,
  useEngagementDocuments,
  useClientDocuments,
  useDocument,
  useCreateDocument,
  useUpdateDocument,
  useGenerateDocument,
  useValidateDocument,
  useFileDocument,
  useDeleteDocument,
  documentKeys,
  getDocumentTypeLabel,
  getDocStatusLabel,
  getDocStatusColor,
  DOC_STATUS_ORDER,
  getNextDocStatus,
  canTransitionTo,
  type Document,
  type DocumentType,
  type DocStatus,
  type DocumentFilters,
} from "./use-documents";
