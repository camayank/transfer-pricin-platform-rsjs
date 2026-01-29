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
  Plus,
  Search,
  Mail,
  Phone,
  MoreHorizontal,
  Shield,
  Edit,
  Trash2,
  UserPlus,
  Building2,
  Calendar,
  FileText,
  X,
} from "lucide-react";

// Sample team data
const teamMembers = [
  {
    id: "1",
    name: "Priya Sharma",
    email: "priya@kumarassociates.com",
    phone: "9876543210",
    role: "partner",
    membershipNo: "123456",
    status: "active",
    joinedAt: "2020-04-15",
    clientsAssigned: 12,
    engagementsActive: 8,
  },
  {
    id: "2",
    name: "Rahul Mehta",
    email: "rahul@kumarassociates.com",
    phone: "9876543211",
    role: "manager",
    membershipNo: "234567",
    status: "active",
    joinedAt: "2021-06-01",
    clientsAssigned: 8,
    engagementsActive: 5,
  },
  {
    id: "3",
    name: "Amit Kumar",
    email: "amit@kumarassociates.com",
    phone: "9876543212",
    role: "staff",
    membershipNo: "345678",
    status: "active",
    joinedAt: "2022-01-10",
    clientsAssigned: 5,
    engagementsActive: 4,
  },
  {
    id: "4",
    name: "Sneha Reddy",
    email: "sneha@kumarassociates.com",
    phone: "9876543213",
    role: "staff",
    membershipNo: "456789",
    status: "active",
    joinedAt: "2023-03-20",
    clientsAssigned: 4,
    engagementsActive: 3,
  },
  {
    id: "5",
    name: "Vikram Patel",
    email: "vikram@kumarassociates.com",
    phone: "9876543214",
    role: "manager",
    membershipNo: "567890",
    status: "invited",
    joinedAt: "2024-01-05",
    clientsAssigned: 0,
    engagementsActive: 0,
  },
];

const roleConfig: Record<string, { label: string; variant: "info" | "warning" | "secondary" | "success" }> = {
  admin: { label: "Admin", variant: "info" },
  partner: { label: "Partner", variant: "success" },
  manager: { label: "Manager", variant: "warning" },
  staff: { label: "Staff", variant: "secondary" },
};

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "secondary" }> = {
  active: { label: "Active", variant: "success" },
  invited: { label: "Invited", variant: "warning" },
  inactive: { label: "Inactive", variant: "secondary" },
};

const rolePermissions = {
  admin: ["Manage firm settings", "Manage team", "Manage billing", "All client access", "All tools access"],
  partner: ["View firm settings", "Invite team members", "All client access", "All tools access"],
  manager: ["Assigned clients only", "All tools access", "Generate reports"],
  staff: ["Assigned clients only", "Limited tool access"],
};

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Filter team members
  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Stats
  const totalMembers = teamMembers.length;
  const activeMembers = teamMembers.filter((m) => m.status === "active").length;
  const pendingInvites = teamMembers.filter((m) => m.status === "invited").length;

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
                  {teamMembers.reduce((sum, m) => sum + m.clientsAssigned, 0)}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Total Assignments</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
        {filteredMembers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-[var(--text-muted)]" />
              <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
                No team members found
              </p>
              <p className="text-[var(--text-secondary)]">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredMembers.map((member) => (
            <Card key={member.id} className="hover:border-[var(--border-default)] transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-glow)] text-lg font-semibold text-[var(--accent)]">
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[var(--text-primary)]">
                          {member.name}
                        </h3>
                        <Badge variant={roleConfig[member.role].variant}>
                          {roleConfig[member.role].label}
                        </Badge>
                        <Badge variant={statusConfig[member.status].variant}>
                          {statusConfig[member.status].label}
                        </Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {member.phone}
                        </span>
                        {member.membershipNo && (
                          <span>ICAI: {member.membershipNo}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden text-center md:block">
                      <p className="text-lg font-semibold text-[var(--text-primary)]">
                        {member.clientsAssigned}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">Clients</p>
                    </div>
                    <div className="hidden text-center md:block">
                      <p className="text-lg font-semibold text-[var(--text-primary)]">
                        {member.engagementsActive}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">Active</p>
                    </div>
                    <div className="hidden text-right md:block">
                      <p className="text-sm text-[var(--text-secondary)]">
                        Joined {new Date(member.joinedAt).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
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
                  onClick={() => setShowInviteModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Send an invitation to join your firm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteName">Full Name</Label>
                <Input id="inviteName" placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Email Address</Label>
                <Input id="inviteEmail" type="email" placeholder="Enter email address" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inviteRole">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="inviteMembership">ICAI Membership No (Optional)</Label>
                <Input id="inviteMembership" placeholder="Enter membership number" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowInviteModal(false)}>
                  <Mail className="mr-1 h-4 w-4" />
                  Send Invitation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
