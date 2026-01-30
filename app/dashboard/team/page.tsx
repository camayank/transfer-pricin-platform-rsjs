"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Mail,
  Phone,
  MoreHorizontal,
  Shield,
  Edit,
  Trash2,
  UserPlus,
  Building2,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeactivateUser,
  type User,
  type CreateUserInput,
} from "@/lib/hooks";
import { LoadingState, StatCardSkeleton } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";

// Map backend roles to UI display
const roleConfig: Record<string, { label: string; variant: "info" | "warning" | "secondary" | "success" | "error" }> = {
  SUPER_ADMIN: { label: "Super Admin", variant: "error" },
  ADMIN: { label: "Admin", variant: "info" },
  PARTNER: { label: "Partner", variant: "success" },
  SENIOR_MANAGER: { label: "Senior Manager", variant: "warning" },
  MANAGER: { label: "Manager", variant: "warning" },
  ASSOCIATE: { label: "Associate", variant: "secondary" },
  TRAINEE: { label: "Trainee", variant: "secondary" },
};

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "secondary" }> = {
  ACTIVE: { label: "Active", variant: "success" },
  INVITED: { label: "Invited", variant: "warning" },
  INACTIVE: { label: "Inactive", variant: "secondary" },
  SUSPENDED: { label: "Suspended", variant: "secondary" },
};

const rolePermissions: Record<string, string[]> = {
  SUPER_ADMIN: ["Full system access", "Manage all tenants", "System configuration", "All permissions"],
  ADMIN: ["Manage firm settings", "Manage team", "Manage billing", "All client access", "All tools access"],
  PARTNER: ["View firm settings", "Invite team members", "All client access", "All tools access", "Approve work"],
  SENIOR_MANAGER: ["Manage assigned clients", "All tools access", "Generate reports", "Approve work"],
  MANAGER: ["Assigned clients only", "All tools access", "Generate reports"],
  ASSOCIATE: ["Assigned clients only", "Limited tool access", "Submit for review"],
  TRAINEE: ["View assigned work", "Limited tool access"],
};

// Available roles for invite (excluding SUPER_ADMIN)
const invitableRoles = ["PARTNER", "SENIOR_MANAGER", "MANAGER", "ASSOCIATE", "TRAINEE"];

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    department: "",
    title: "",
    phone: "",
  });
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Fetch users from API
  const { data, isLoading, error, refetch } = useUsers({
    role: roleFilter !== "all" ? roleFilter : undefined,
    search: searchQuery || undefined,
  });

  // Mutations
  const createUserMutation = useCreateUser();
  const deactivateUserMutation = useDeactivateUser();

  const users = data?.users || [];
  const pagination = data?.pagination;

  // Stats calculated from live data
  const totalMembers = pagination?.total || users.length;
  const activeMembers = users.filter((u) => u.status === "ACTIVE").length;
  const pendingInvites = users.filter((u) => u.status === "INVITED").length;

  // Handle invite form submission
  const handleInvite = async () => {
    setInviteError(null);

    if (!inviteForm.name || !inviteForm.email || !inviteForm.password || !inviteForm.role) {
      setInviteError("Please fill in all required fields");
      return;
    }

    try {
      await createUserMutation.mutateAsync({
        name: inviteForm.name,
        email: inviteForm.email,
        password: inviteForm.password,
        role: inviteForm.role,
        department: inviteForm.department || undefined,
        title: inviteForm.title || undefined,
        phone: inviteForm.phone || undefined,
      });

      // Reset form and close modal
      setInviteForm({
        name: "",
        email: "",
        password: "",
        role: "",
        department: "",
        title: "",
        phone: "",
      });
      setShowInviteModal(false);
      refetch();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Failed to invite user");
    }
  };

  // Handle user deactivation
  const handleDeactivate = async (userId: string) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;

    try {
      await deactivateUserMutation.mutateAsync(userId);
      refetch();
    } catch (err) {
      console.error("Failed to deactivate user:", err);
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Team</h1>
          <p className="text-[var(--text-secondary)]">
            Manage your team members and permissions
          </p>
        </div>
        <Button onClick={() => setShowInviteModal(true)}>
          <UserPlus className="mr-1 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[var(--accent-glow)] p-2 text-[var(--accent)]">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-[var(--text-primary)]">
                      {totalMembers}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">Total Members</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[var(--success-bg)] p-2 text-[var(--success)]">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-[var(--text-primary)]">
                      {activeMembers}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[var(--warning-bg)] p-2 text-[var(--warning)]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-[var(--text-primary)]">
                      {pendingInvites}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">Pending Invites</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[var(--info-bg)] p-2 text-[var(--info)]">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-[var(--text-primary)]">
                      {Object.keys(roleConfig).length}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">Role Types</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {Object.entries(roleConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Team List */}
      <div className="space-y-4">
        {isLoading ? (
          <LoadingState message="Loading team members..." />
        ) : error ? (
          <ErrorState
            title="Failed to load team"
            message={error instanceof Error ? error.message : "An error occurred"}
            onRetry={() => refetch()}
          />
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-[var(--text-muted)]" />
              <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
                No team members found
              </p>
              <p className="text-[var(--text-secondary)]">
                {searchQuery || roleFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Invite your first team member to get started"}
              </p>
              {!searchQuery && roleFilter === "all" && (
                <Button onClick={() => setShowInviteModal(true)} className="mt-4">
                  <UserPlus className="mr-1 h-4 w-4" />
                  Invite Member
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id} className="hover:border-[var(--border-default)] transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-glow)] text-lg font-semibold text-[var(--accent)]">
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[var(--text-primary)]">
                          {user.name}
                        </h3>
                        <Badge variant={roleConfig[user.role]?.variant || "secondary"}>
                          {roleConfig[user.role]?.label || user.role}
                        </Badge>
                        <Badge variant={statusConfig[user.status]?.variant || "secondary"}>
                          {statusConfig[user.status]?.label || user.status}
                        </Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        {user.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </span>
                        )}
                        {user.department && (
                          <span className="text-[var(--text-secondary)]">
                            {user.department}
                          </span>
                        )}
                        {user.title && (
                          <span className="text-[var(--text-secondary)]">
                            • {user.title}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {user.managerName && (
                      <div className="hidden text-right md:block">
                        <p className="text-sm text-[var(--text-secondary)]">
                          Reports to
                        </p>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {user.managerName}
                        </p>
                      </div>
                    )}
                    <div className="hidden text-right md:block">
                      <p className="text-sm text-[var(--text-secondary)]">
                        Joined {formatDate(user.createdAt)}
                      </p>
                      {user.lastLoginAt && (
                        <p className="text-xs text-[var(--text-muted)]">
                          Last login: {formatDate(user.lastLoginAt)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span title="Edit user">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </span>
                      <span title="Deactivate user">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivate(user.id)}
                          disabled={deactivateUserMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </span>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination Info */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center text-sm text-[var(--text-muted)]">
          Page {pagination.page} of {pagination.totalPages} • {pagination.total} total members
        </div>
      )}

      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Overview of access levels for each role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(rolePermissions).map(([role, permissions]) => (
              <div
                key={role}
                className="rounded-lg border border-[var(--border-subtle)] p-4"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[var(--text-muted)]" />
                  <Badge variant={roleConfig[role]?.variant || "secondary"}>
                    {roleConfig[role]?.label || role}
                  </Badge>
                </div>
                <ul className="mt-4 space-y-2">
                  {permissions.map((permission, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-[var(--text-muted)]" />
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Invite Team Member</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteError(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Add a new member to your team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {inviteError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">
                  <AlertCircle className="h-4 w-4" />
                  {inviteError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="inviteName">Full Name *</Label>
                <Input
                  id="inviteName"
                  placeholder="Enter full name"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Email Address *</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="Enter email address"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invitePassword">Initial Password *</Label>
                <Input
                  id="invitePassword"
                  type="password"
                  placeholder="Set initial password"
                  value={inviteForm.password}
                  onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inviteRole">Role *</Label>
                <Select
                  value={inviteForm.role}
                  onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {invitableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {roleConfig[role]?.label || role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteDepartment">Department</Label>
                  <Input
                    id="inviteDepartment"
                    placeholder="e.g., Tax, Audit"
                    value={inviteForm.department}
                    onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteTitle">Title</Label>
                  <Input
                    id="inviteTitle"
                    placeholder="e.g., CA"
                    value={inviteForm.title}
                    onChange={(e) => setInviteForm({ ...inviteForm, title: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invitePhone">Phone Number</Label>
                <Input
                  id="invitePhone"
                  placeholder="Enter phone number"
                  value={inviteForm.phone}
                  onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInvite}
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? (
                    <>
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-1 h-4 w-4" />
                      Create User
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
