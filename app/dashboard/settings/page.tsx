"use client";

import { useState, useMemo } from "react";
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
  Building2,
  User,
  Bell,
  Shield,
  CreditCard,
  Save,
  Upload,
  Check,
  Clock,
  FileText,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { usePermissions, PermissionAction } from "@/lib/hooks/use-permissions";
import { LoadingState } from "@/components/ui/loading";
import { useSession } from "next-auth/react";

// Sample firm data
const firmData = {
  name: "Kumar & Associates",
  firmRegNo: "123456N",
  pan: "AABFK1234E",
  gstin: "29AABFK1234E1ZQ",
  address: "456, CA Street, MG Road",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400001",
  phone: "022-12345678",
  email: "contact@kumarassociates.com",
  website: "www.kumarassociates.com",
};

const planFeatures = {
  professional: [
    "Unlimited clients",
    "Form 3CEB generation",
    "Safe Harbour calculator",
    "Benchmarking tool",
    "Master File generator",
    "Email support",
  ],
  enterprise: [
    "Everything in Professional",
    "API access",
    "Custom integrations",
    "Dedicated account manager",
    "Priority support",
    "Custom training",
  ],
};

interface TabConfig {
  id: string;
  label: string;
  icon: typeof Building2;
  requiresAdmin: boolean;
}

const allTabs: TabConfig[] = [
  { id: "firm", label: "Firm Profile", icon: Building2, requiresAdmin: true },
  { id: "profile", label: "My Profile", icon: User, requiresAdmin: false },
  { id: "notifications", label: "Notifications", icon: Bell, requiresAdmin: false },
  { id: "security", label: "Security", icon: Shield, requiresAdmin: false },
  { id: "billing", label: "Billing", icon: CreditCard, requiresAdmin: true },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const { can, isAdmin, isLoading, role } = usePermissions();
  const [firmForm, setFirmForm] = useState(firmData);

  // Filter tabs based on permissions
  const availableTabs = useMemo(() => {
    return allTabs.filter((tab) => {
      if (tab.requiresAdmin) {
        return can("settings", PermissionAction.ADMIN);
      }
      return true;
    });
  }, [can]);

  // Default to first available tab
  const [activeTab, setActiveTab] = useState<string>("profile");

  // Check if user can access current tab
  const currentTabConfig = allTabs.find((t) => t.id === activeTab);
  const canAccessCurrentTab = currentTabConfig
    ? !currentTabConfig.requiresAdmin || can("settings", PermissionAction.ADMIN)
    : false;

  if (isLoading) {
    return <LoadingState message="Loading settings..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Settings</h1>
        <p className="text-[var(--text-secondary)]">
          Manage your profile and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar Navigation */}
        <div className="space-y-2">
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                  isActive
                    ? "bg-[var(--accent-glow)] text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
                {tab.requiresAdmin && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Admin
                  </Badge>
                )}
              </button>
            );
          })}

          {/* Show locked tabs for non-admins */}
          {!isAdmin && (
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
              <p className="px-4 text-xs text-[var(--text-muted)] mb-2">Restricted</p>
              {allTabs
                .filter((tab) => tab.requiresAdmin)
                .map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <div
                      key={tab.id}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-[var(--text-muted)] opacity-50 cursor-not-allowed"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                      <Lock className="h-4 w-4 ml-auto" />
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === "firm" && canAccessCurrentTab && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Firm Information</CardTitle>
                  <CardDescription>
                    Basic details about your CA firm
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firmName">Firm Name</Label>
                      <Input
                        id="firmName"
                        value={firmForm.name}
                        onChange={(e) => setFirmForm({ ...firmForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firmRegNo">ICAI Registration No</Label>
                      <Input
                        id="firmRegNo"
                        value={firmForm.firmRegNo}
                        onChange={(e) => setFirmForm({ ...firmForm, firmRegNo: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firmPan">PAN</Label>
                      <Input
                        id="firmPan"
                        value={firmForm.pan}
                        onChange={(e) => setFirmForm({ ...firmForm, pan: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firmGstin">GSTIN</Label>
                      <Input
                        id="firmGstin"
                        value={firmForm.gstin}
                        onChange={(e) => setFirmForm({ ...firmForm, gstin: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="firmAddress">Address</Label>
                    <Input
                      id="firmAddress"
                      value={firmForm.address}
                      onChange={(e) => setFirmForm({ ...firmForm, address: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="firmCity">City</Label>
                      <Input
                        id="firmCity"
                        value={firmForm.city}
                        onChange={(e) => setFirmForm({ ...firmForm, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firmState">State</Label>
                      <Input
                        id="firmState"
                        value={firmForm.state}
                        onChange={(e) => setFirmForm({ ...firmForm, state: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firmPincode">Pincode</Label>
                      <Input
                        id="firmPincode"
                        value={firmForm.pincode}
                        onChange={(e) => setFirmForm({ ...firmForm, pincode: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firmPhone">Phone</Label>
                      <Input
                        id="firmPhone"
                        value={firmForm.phone}
                        onChange={(e) => setFirmForm({ ...firmForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firmEmail">Email</Label>
                      <Input
                        id="firmEmail"
                        type="email"
                        value={firmForm.email}
                        onChange={(e) => setFirmForm({ ...firmForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button>
                      <Save className="mr-1 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Firm Logo</CardTitle>
                  <CardDescription>
                    Upload your firm logo for reports and documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-[var(--accent-glow)] text-[var(--accent)]">
                      <Building2 className="h-10 w-10" />
                    </div>
                    <div>
                      <Button variant="outline">
                        <Upload className="mr-1 h-4 w-4" />
                        Upload Logo
                      </Button>
                      <p className="mt-2 text-sm text-[var(--text-muted)]">
                        PNG, JPG or SVG. Max size 2MB.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Your personal details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-glow)] text-2xl font-semibold text-[var(--accent)]">
                      {session?.user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "U"}
                    </div>
                    <div>
                      <Button variant="outline">
                        <Upload className="mr-1 h-4 w-4" />
                        Upload Photo
                      </Button>
                      <p className="mt-2 text-sm text-[var(--text-muted)]">
                        PNG or JPG. Max size 1MB.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" defaultValue={session?.user?.name || ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={session?.user?.email || ""}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" placeholder="Enter phone number" />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input value={role} disabled />
                      <p className="text-xs text-[var(--text-muted)]">
                        Contact an administrator to change your role
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button>
                      <Save className="mr-1 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Customize your experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Default Financial Year</Label>
                      <Select defaultValue="2025-26">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2025-26">2025-26</SelectItem>
                          <SelectItem value="2024-25">2024-25</SelectItem>
                          <SelectItem value="2023-24">2023-24</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date Format</Label>
                      <Select defaultValue="dd-mm-yyyy">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                          <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                          <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Currency Display</Label>
                      <Select defaultValue="inr-cr">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inr-cr">Rs. (Crores/Lakhs)</SelectItem>
                          <SelectItem value="inr">Rs. (Standard)</SelectItem>
                          <SelectItem value="inr-mn">Rs. (Millions)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select defaultValue="ist">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ist">IST (UTC+5:30)</SelectItem>
                          <SelectItem value="utc">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-[var(--text-primary)]">Email Notifications</h4>
                  {[
                    { id: "deadlines", label: "Compliance Deadlines", description: "Get reminded before due dates", icon: Clock },
                    { id: "updates", label: "Client Updates", description: "When client data is modified", icon: User },
                    { id: "filings", label: "Filing Status", description: "When forms are filed or rejected", icon: FileText },
                    { id: "team", label: "Team Activity", description: "When team members make changes", icon: Bell },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-[var(--bg-secondary)] p-2 text-[var(--text-muted)]">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{item.label}</p>
                          <p className="text-sm text-[var(--text-muted)]">{item.description}</p>
                        </div>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[var(--accent)]">
                        <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-[var(--text-primary)]">Deadline Reminders</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-[var(--border-subtle)] p-4">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded border-[var(--border-default)]" />
                        <span className="text-[var(--text-primary)]">30 days before</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-[var(--border-subtle)] p-4">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded border-[var(--border-default)]" />
                        <span className="text-[var(--text-primary)]">7 days before</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-[var(--border-subtle)] p-4">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded border-[var(--border-default)]" />
                        <span className="text-[var(--text-primary)]">1 day before</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password regularly for security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button>Update Password</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-[var(--success-bg)] p-2 text-[var(--success)]">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          Two-Factor Authentication
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">
                          Currently enabled via authenticator app
                        </p>
                      </div>
                    </div>
                    <Badge variant="success">Enabled</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>
                    Manage your active login sessions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { device: "Chrome on MacOS", location: "Mumbai, India", current: true },
                    { device: "Safari on iPhone", location: "Mumbai, India", current: false },
                  ].map((session, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] p-4"
                    >
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{session.device}</p>
                        <p className="text-sm text-[var(--text-muted)]">{session.location}</p>
                      </div>
                      {session.current ? (
                        <Badge variant="success">Current</Badge>
                      ) : (
                        <Button variant="outline" size="sm">
                          Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "billing" && canAccessCurrentTab && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>
                    Your subscription details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between rounded-lg border-2 border-[var(--accent)] bg-[var(--accent-glow)] p-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                          Professional Plan
                        </h3>
                        <Badge variant="info">Active</Badge>
                      </div>
                      <p className="mt-1 text-[var(--text-muted)]">
                        Billed annually - Rs. 29,999/year
                      </p>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        Next billing date: April 1, 2026
                      </p>
                    </div>
                    <Button variant="outline">Upgrade Plan</Button>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-[var(--border-subtle)] p-4">
                      <h4 className="font-medium text-[var(--text-primary)]">Professional</h4>
                      <p className="text-2xl font-semibold text-[var(--accent)]">
                        Rs. 29,999<span className="text-sm font-normal text-[var(--text-muted)]">/year</span>
                      </p>
                      <ul className="mt-4 space-y-2">
                        {planFeatures.professional.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                            <Check className="h-4 w-4 text-[var(--success)]" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-[var(--border-subtle)] p-4">
                      <h4 className="font-medium text-[var(--text-primary)]">Enterprise</h4>
                      <p className="text-2xl font-semibold text-[var(--accent)]">
                        Custom<span className="text-sm font-normal text-[var(--text-muted)]">/year</span>
                      </p>
                      <ul className="mt-4 space-y-2">
                        {planFeatures.enterprise.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                            <Check className="h-4 w-4 text-[var(--success)]" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>
                    Your recent invoices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { date: "Apr 1, 2025", amount: "Rs. 29,999", status: "Paid", invoice: "INV-2025-001" },
                      { date: "Apr 1, 2024", amount: "Rs. 24,999", status: "Paid", invoice: "INV-2024-001" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] p-4"
                      >
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{item.invoice}</p>
                          <p className="text-sm text-[var(--text-muted)]">{item.date}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-medium text-[var(--text-primary)]">{item.amount}</p>
                          <Badge variant="success">{item.status}</Badge>
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Access Denied for Admin-only tabs */}
          {!canAccessCurrentTab && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-[var(--warning-bg)] p-4 mb-4">
                  <AlertTriangle className="h-8 w-8 text-[var(--warning)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Access Restricted
                </h3>
                <p className="mt-2 text-center text-[var(--text-secondary)] max-w-md">
                  You don't have permission to access this section. Please contact your administrator
                  if you believe you should have access.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setActiveTab("profile")}
                >
                  Go to My Profile
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
