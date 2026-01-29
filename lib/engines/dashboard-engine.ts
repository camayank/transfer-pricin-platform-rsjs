/**
 * DIGICOMPLY CA FIRM DASHBOARD ENGINE
 * Multi-Client Transfer Pricing Practice Management
 *
 * Features:
 * - Compliance calendar with statutory deadlines
 * - Client engagement tracking
 * - Team workload management
 * - Deadline alerts and notifications
 * - Bulk operations support
 */

// =============================================================================
// ENUMS
// =============================================================================

export enum ComplianceStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  UNDER_REVIEW = "under_review",
  PENDING_SIGNATURE = "pending_signature",
  FILED = "filed",
  ACKNOWLEDGED = "acknowledged",
  OVERDUE = "overdue",
}

export enum FormType {
  FORM_3CEB = "3CEB",
  FORM_3CEAA = "3CEAA", // Master File
  FORM_3CEAC = "3CEAC", // CbCR Notification
  FORM_3CEAD = "3CEAD", // Country-by-Country Report
  ITR = "ITR",
  LOCAL_FILE = "LocalFile",
  FORM_3CEFA = "3CEFA", // Safe Harbour Form
}

export enum Priority {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export enum TeamRole {
  PARTNER = "partner",
  MANAGER = "manager",
  SENIOR_ASSOCIATE = "senior_associate",
  ASSOCIATE = "associate",
  TRAINEE = "trainee",
}

export enum NotificationType {
  DEADLINE_REMINDER = "deadline_reminder",
  TASK_ASSIGNED = "task_assigned",
  REVIEW_REQUESTED = "review_requested",
  SIGNATURE_REQUIRED = "signature_required",
  FILING_COMPLETED = "filing_completed",
  OVERDUE_ALERT = "overdue_alert",
}

// =============================================================================
// COMPLIANCE CALENDAR
// =============================================================================

interface ComplianceDeadline {
  dueDate: string;
  lateDueDate?: string;
  penalty: string;
  penaltyPerDay?: string;
  description: string;
  applicability: string;
  filingMethod: string;
}

export const COMPLIANCE_CALENDAR: Record<FormType, ComplianceDeadline> = {
  [FormType.FORM_3CEB]: {
    dueDate: "October 31",
    description: "Transfer Pricing Audit Report",
    penalty: "Rs. 1,00,000",
    applicability: "Persons entering into international transactions/SDT exceeding threshold",
    filingMethod: "Online on e-Filing portal",
  },
  [FormType.FORM_3CEAA]: {
    dueDate: "November 30",
    description: "Master File (Part A)",
    penalty: "Rs. 5,00,000",
    applicability: "Constituent entity of international group with consolidated revenue > Rs. 500 Cr",
    filingMethod: "Online on e-Filing portal",
  },
  [FormType.FORM_3CEAC]: {
    dueDate: "November 30",
    description: "CbCR Notification",
    penalty: "Rs. 5,00,000",
    applicability: "Constituent entity required to furnish CbCR",
    filingMethod: "Online on e-Filing portal",
  },
  [FormType.FORM_3CEAD]: {
    dueDate: "March 31",
    lateDueDate: "12 months from end of reporting period",
    description: "Country-by-Country Report",
    penalty: "Rs. 5,000 per day",
    penaltyPerDay: "Rs. 5,000",
    applicability: "Parent entity with consolidated revenue > Rs. 5,500 Cr",
    filingMethod: "Online on e-Filing portal",
  },
  [FormType.ITR]: {
    dueDate: "October 31",
    lateDueDate: "December 31 (with late fee)",
    description: "Income Tax Return (for TP cases)",
    penalty: "Rs. 10,000 (late fee under 234F)",
    applicability: "Persons required to get accounts audited",
    filingMethod: "Online on e-Filing portal",
  },
  [FormType.LOCAL_FILE]: {
    dueDate: "November 30",
    description: "Local File Documentation",
    penalty: "2% of transaction value (for non-maintenance)",
    applicability: "Persons with international transactions",
    filingMethod: "To be maintained, produced on demand",
  },
  [FormType.FORM_3CEFA]: {
    dueDate: "November 30",
    description: "Safe Harbour Form",
    penalty: "Not specified (Safe Harbour option foregone)",
    applicability: "Persons opting for Safe Harbour Rules",
    filingMethod: "Online on e-Filing portal",
  },
};

// =============================================================================
// INTERFACES
// =============================================================================

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  department: string;
  activeClients: number;
  pendingTasks: number;
  availableCapacity: number; // hours per week
}

export interface ComplianceForm {
  formType: FormType;
  assessmentYear: string;
  status: ComplianceStatus;
  dueDate: string;
  assignedTo: string;
  reviewedBy?: string;
  filedOn?: string;
  acknowledgementNumber?: string;
  remarks?: string;
  lastUpdated: string;
}

export interface Client {
  id: string;
  pan: string;
  name: string;
  tradeName?: string;
  industry: string;
  segment: string;
  engagementPartner: string;
  engagementManager: string;
  internationalTransactions: number;
  domesticTransactions: number;
  status: "active" | "inactive";
  tpApplicability: {
    form3ceb: boolean;
    masterFile: boolean;
    cbcr: boolean;
    safeHarbour: boolean;
  };
  complianceForms: ComplianceForm[];
  priority: Priority;
  notes?: string;
}

export interface CAFirm {
  id: string;
  firmName: string;
  firmRegistrationNumber: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  email: string;
  phone: string;
  partnerInCharge: string;
  teamMembers: TeamMember[];
  clients: Client[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  clientId?: string;
  clientName?: string;
  formType?: FormType;
  dueDate?: string;
  priority: Priority;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  formsNotStarted: number;
  formsInProgress: number;
  formsOverdue: number;
  formsFiled: number;
  upcomingDeadlines: number;
  teamWorkload: Record<string, number>;
}

// =============================================================================
// DASHBOARD ENGINE CLASS
// =============================================================================

export class DashboardEngine {
  private clients: Client[] = [];
  private teamMembers: TeamMember[] = [];
  private notifications: Notification[] = [];
  private firmInfo: CAFirm | null = null;

  setFirmInfo(firm: CAFirm): void {
    this.firmInfo = firm;
    this.clients = firm.clients || [];
    this.teamMembers = firm.teamMembers || [];
  }

  // ==========================================================================
  // CLIENT MANAGEMENT
  // ==========================================================================

  addClient(client: Client): Client {
    client.id = client.id || this.generateId();
    this.clients.push(client);
    return client;
  }

  updateClient(clientId: string, updates: Partial<Client>): Client | null {
    const index = this.clients.findIndex((c) => c.id === clientId);
    if (index === -1) return null;

    this.clients[index] = { ...this.clients[index], ...updates };
    return this.clients[index];
  }

  deleteClient(clientId: string): boolean {
    const index = this.clients.findIndex((c) => c.id === clientId);
    if (index === -1) return false;

    this.clients.splice(index, 1);
    return true;
  }

  getClient(clientId: string): Client | null {
    return this.clients.find((c) => c.id === clientId) || null;
  }

  getClientByPAN(pan: string): Client | null {
    return this.clients.find((c) => c.pan === pan) || null;
  }

  getAllClients(): Client[] {
    return this.clients;
  }

  getClientsByStatus(status: "active" | "inactive"): Client[] {
    return this.clients.filter((c) => c.status === status);
  }

  getClientsByPriority(priority: Priority): Client[] {
    return this.clients.filter((c) => c.priority === priority);
  }

  // ==========================================================================
  // COMPLIANCE TRACKING
  // ==========================================================================

  updateFormStatus(
    clientId: string,
    formType: FormType,
    assessmentYear: string,
    status: ComplianceStatus,
    additionalInfo: Partial<ComplianceForm> = {}
  ): ComplianceForm | null {
    const client = this.getClient(clientId);
    if (!client) return null;

    const formIndex = client.complianceForms.findIndex(
      (f) => f.formType === formType && f.assessmentYear === assessmentYear
    );

    if (formIndex === -1) {
      // Create new form entry
      const newForm: ComplianceForm = {
        formType,
        assessmentYear,
        status,
        dueDate: this.getFormDueDate(formType, assessmentYear),
        assignedTo: additionalInfo.assignedTo || "",
        lastUpdated: new Date().toISOString(),
        ...additionalInfo,
      };
      client.complianceForms.push(newForm);
      return newForm;
    }

    // Update existing form
    client.complianceForms[formIndex] = {
      ...client.complianceForms[formIndex],
      status,
      lastUpdated: new Date().toISOString(),
      ...additionalInfo,
    };

    return client.complianceForms[formIndex];
  }

  getFormDueDate(formType: FormType, assessmentYear: string): string {
    const deadline = COMPLIANCE_CALENDAR[formType];
    if (!deadline) return "";

    // Parse assessment year (e.g., "2025-26" -> financial year ends March 2025)
    const [startYear] = assessmentYear.split("-").map(Number);
    const dueDate = deadline.dueDate;

    // Map month names to dates
    const monthMap: Record<string, string> = {
      October: `${startYear}-10-31`,
      November: `${startYear}-11-30`,
      December: `${startYear}-12-31`,
      March: `${startYear + 1}-03-31`,
    };

    for (const [month, date] of Object.entries(monthMap)) {
      if (dueDate.includes(month)) {
        return date;
      }
    }

    return "";
  }

  getOverdueForms(): Array<{ client: Client; form: ComplianceForm }> {
    const today = new Date();
    const overdueList: Array<{ client: Client; form: ComplianceForm }> = [];

    for (const client of this.clients) {
      for (const form of client.complianceForms) {
        if (
          form.status !== ComplianceStatus.FILED &&
          form.status !== ComplianceStatus.ACKNOWLEDGED
        ) {
          const dueDate = new Date(form.dueDate);
          if (dueDate < today) {
            overdueList.push({ client, form });
          }
        }
      }
    }

    return overdueList;
  }

  getUpcomingDeadlines(daysAhead: number = 30): Array<{
    client: Client;
    form: ComplianceForm;
    daysRemaining: number;
  }> {
    const today = new Date();
    const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    const upcomingList: Array<{
      client: Client;
      form: ComplianceForm;
      daysRemaining: number;
    }> = [];

    for (const client of this.clients) {
      for (const form of client.complianceForms) {
        if (
          form.status !== ComplianceStatus.FILED &&
          form.status !== ComplianceStatus.ACKNOWLEDGED
        ) {
          const dueDate = new Date(form.dueDate);
          if (dueDate >= today && dueDate <= futureDate) {
            const daysRemaining = Math.ceil(
              (dueDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
            );
            upcomingList.push({ client, form, daysRemaining });
          }
        }
      }
    }

    // Sort by days remaining
    return upcomingList.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  // ==========================================================================
  // TEAM MANAGEMENT
  // ==========================================================================

  addTeamMember(member: TeamMember): TeamMember {
    member.id = member.id || this.generateId();
    this.teamMembers.push(member);
    return member;
  }

  getTeamMember(memberId: string): TeamMember | null {
    return this.teamMembers.find((m) => m.id === memberId) || null;
  }

  getAllTeamMembers(): TeamMember[] {
    return this.teamMembers;
  }

  getTeamWorkload(): Record<string, { member: TeamMember; clients: Client[] }> {
    const workload: Record<string, { member: TeamMember; clients: Client[] }> = {};

    for (const member of this.teamMembers) {
      const assignedClients = this.clients.filter(
        (c) =>
          c.engagementPartner === member.name ||
          c.engagementManager === member.name
      );
      workload[member.id] = { member, clients: assignedClients };
    }

    return workload;
  }

  // ==========================================================================
  // DASHBOARD STATISTICS
  // ==========================================================================

  getDashboardStats(): DashboardStats {
    const activeClients = this.clients.filter((c) => c.status === "active");
    let formsNotStarted = 0;
    let formsInProgress = 0;
    let formsOverdue = 0;
    let formsFiled = 0;

    const today = new Date();

    for (const client of this.clients) {
      for (const form of client.complianceForms) {
        switch (form.status) {
          case ComplianceStatus.NOT_STARTED:
            formsNotStarted++;
            break;
          case ComplianceStatus.IN_PROGRESS:
          case ComplianceStatus.UNDER_REVIEW:
          case ComplianceStatus.PENDING_SIGNATURE:
            formsInProgress++;
            break;
          case ComplianceStatus.FILED:
          case ComplianceStatus.ACKNOWLEDGED:
            formsFiled++;
            break;
          case ComplianceStatus.OVERDUE:
            formsOverdue++;
            break;
        }

        // Check if overdue
        if (
          form.status !== ComplianceStatus.FILED &&
          form.status !== ComplianceStatus.ACKNOWLEDGED &&
          new Date(form.dueDate) < today
        ) {
          formsOverdue++;
        }
      }
    }

    const teamWorkload: Record<string, number> = {};
    for (const member of this.teamMembers) {
      teamWorkload[member.name] = this.clients.filter(
        (c) =>
          c.engagementPartner === member.name ||
          c.engagementManager === member.name
      ).length;
    }

    return {
      totalClients: this.clients.length,
      activeClients: activeClients.length,
      formsNotStarted,
      formsInProgress,
      formsOverdue,
      formsFiled,
      upcomingDeadlines: this.getUpcomingDeadlines(30).length,
      teamWorkload,
    };
  }

  // ==========================================================================
  // NOTIFICATIONS
  // ==========================================================================

  createNotification(notification: Omit<Notification, "id" | "createdAt">): Notification {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    this.notifications.push(newNotification);
    return newNotification;
  }

  getNotifications(unreadOnly: boolean = false): Notification[] {
    if (unreadOnly) {
      return this.notifications.filter((n) => !n.isRead);
    }
    return this.notifications;
  }

  markNotificationAsRead(notificationId: string): boolean {
    const notification = this.notifications.find((n) => n.id === notificationId);
    if (!notification) return false;
    notification.isRead = true;
    return true;
  }

  generateDeadlineAlerts(): Notification[] {
    const alerts: Notification[] = [];
    const upcomingDeadlines = this.getUpcomingDeadlines(7);

    for (const { client, form, daysRemaining } of upcomingDeadlines) {
      let priority: Priority;
      let title: string;

      if (daysRemaining <= 1) {
        priority = Priority.CRITICAL;
        title = `URGENT: ${form.formType} due tomorrow`;
      } else if (daysRemaining <= 3) {
        priority = Priority.HIGH;
        title = `${form.formType} due in ${daysRemaining} days`;
      } else {
        priority = Priority.MEDIUM;
        title = `Reminder: ${form.formType} due in ${daysRemaining} days`;
      }

      const notification = this.createNotification({
        type: NotificationType.DEADLINE_REMINDER,
        title,
        message: `${form.formType} for ${client.name} (${client.pan}) is due on ${form.dueDate}`,
        clientId: client.id,
        clientName: client.name,
        formType: form.formType,
        dueDate: form.dueDate,
        priority,
        isRead: false,
      });

      alerts.push(notification);
    }

    // Check for overdue
    const overdueItems = this.getOverdueForms();
    for (const { client, form } of overdueItems) {
      const notification = this.createNotification({
        type: NotificationType.OVERDUE_ALERT,
        title: `OVERDUE: ${form.formType} for ${client.name}`,
        message: `${form.formType} was due on ${form.dueDate}. Immediate action required.`,
        clientId: client.id,
        clientName: client.name,
        formType: form.formType,
        dueDate: form.dueDate,
        priority: Priority.CRITICAL,
        isRead: false,
      });

      alerts.push(notification);
    }

    return alerts;
  }

  // ==========================================================================
  // BULK OPERATIONS
  // ==========================================================================

  bulkUpdateFormStatus(
    clientIds: string[],
    formType: FormType,
    assessmentYear: string,
    status: ComplianceStatus
  ): Array<{ clientId: string; success: boolean; form?: ComplianceForm }> {
    const results: Array<{ clientId: string; success: boolean; form?: ComplianceForm }> = [];

    for (const clientId of clientIds) {
      const form = this.updateFormStatus(clientId, formType, assessmentYear, status);
      results.push({
        clientId,
        success: form !== null,
        form: form || undefined,
      });
    }

    return results;
  }

  bulkAssignTeamMember(
    clientIds: string[],
    teamMemberId: string,
    role: "partner" | "manager"
  ): Array<{ clientId: string; success: boolean }> {
    const results: Array<{ clientId: string; success: boolean }> = [];
    const member = this.getTeamMember(teamMemberId);

    if (!member) {
      return clientIds.map((clientId) => ({ clientId, success: false }));
    }

    for (const clientId of clientIds) {
      const updates =
        role === "partner"
          ? { engagementPartner: member.name }
          : { engagementManager: member.name };

      const updated = this.updateClient(clientId, updates);
      results.push({ clientId, success: updated !== null });
    }

    return results;
  }

  // ==========================================================================
  // REPORTING
  // ==========================================================================

  generateComplianceReport(assessmentYear: string): Record<string, unknown> {
    const clientsByForm: Record<FormType, Record<ComplianceStatus, number>> = {} as Record<
      FormType,
      Record<ComplianceStatus, number>
    >;

    // Initialize
    for (const formType of Object.values(FormType)) {
      clientsByForm[formType] = {} as Record<ComplianceStatus, number>;
      for (const status of Object.values(ComplianceStatus)) {
        clientsByForm[formType][status] = 0;
      }
    }

    // Count
    for (const client of this.clients) {
      for (const form of client.complianceForms) {
        if (form.assessmentYear === assessmentYear) {
          clientsByForm[form.formType][form.status]++;
        }
      }
    }

    return {
      assessmentYear,
      generatedOn: new Date().toISOString(),
      totalClients: this.clients.length,
      complianceByForm: clientsByForm,
      overdueCount: this.getOverdueForms().filter(
        (o) => o.form.assessmentYear === assessmentYear
      ).length,
      filedCount: this.clients.reduce(
        (count, client) =>
          count +
          client.complianceForms.filter(
            (f) =>
              f.assessmentYear === assessmentYear &&
              (f.status === ComplianceStatus.FILED ||
                f.status === ComplianceStatus.ACKNOWLEDGED)
          ).length,
        0
      ),
    };
  }

  // ==========================================================================
  // UTILITY
  // ==========================================================================

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const createDashboardEngine = () => new DashboardEngine();
