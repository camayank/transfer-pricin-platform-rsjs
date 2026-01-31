"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  TRANSACTION_NATURE_CODES,
  TRANSACTION_CATEGORIES,
  TP_METHODS,
  RELATIONSHIP_TYPES,
  COUNTRY_LIST,
  INDIAN_STATES,
  ASSESSEE_STATUS,
} from "@/lib/constants/form-3ceb";
import { NIC_CODES } from "@/lib/constants/nic-codes";
import {
  type AssesseeDetails,
  type AssociatedEnterprise,
  type InternationalTransaction,
  type CADetails,
  type ValidationError,
  validatePAN,
  validatePinCode,
  validateEmail,
  validatePhone,
  validateUDIN,
  formatCurrency,
} from "@/types/form-3ceb";
import {
  FileText,
  Building2,
  Globe,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Download,
  ChevronRight,
  Save,
  Loader2,
  FolderOpen,
} from "lucide-react";

const WIZARD_STEPS = [
  { id: 1, title: "Assessee Details", icon: Building2 },
  { id: 2, title: "Associated Enterprises", icon: Globe },
  { id: 3, title: "International Transactions", icon: FileText },
  { id: 4, title: "CA Certification", icon: UserCheck },
  { id: 5, title: "Review & Generate", icon: CheckCircle },
];

const initialAssessee: AssesseeDetails = {
  name: "",
  pan: "",
  address: "",
  city: "",
  state: "",
  pinCode: "",
  status: "COMPANY",
  principalBusinessActivity: "",
  nicCode: "",
  previousYearFrom: "2024-04-01",
  previousYearTo: "2025-03-31",
  assessmentYear: "2025-26",
  email: "",
  phone: "",
};

const initialCADetails: CADetails = {
  caName: "",
  membershipNumber: "",
  firmName: "",
  firmRegistrationNumber: "",
  address: "",
  city: "",
  pin: "",
  udin: "",
  dateOfReport: new Date().toISOString().split("T")[0],
};

interface Engagement {
  id: string;
  financialYear: string;
  assessmentYear: string;
  client: {
    id: string;
    name: string;
    pan: string;
  };
}

export default function Form3CEBPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [assessee, setAssessee] = useState<AssesseeDetails>(initialAssessee);
  const [associatedEnterprises, setAssociatedEnterprises] = useState<AssociatedEnterprise[]>([]);
  const [transactions, setTransactions] = useState<InternationalTransaction[]>([]);
  const [caDetails, setCADetails] = useState<CADetails>(initialCADetails);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Engagement and save state
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [selectedEngagementId, setSelectedEngagementId] = useState<string>("");
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [documentStatus, setDocumentStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load engagements on mount
  useEffect(() => {
    const loadEngagements = async () => {
      try {
        const res = await fetch("/api/engagements");
        if (res.ok) {
          const data = await res.json();
          setEngagements(data.engagements || []);
        }
      } catch (error) {
        console.error("Failed to load engagements:", error);
      }
    };
    loadEngagements();
  }, []);

  // Load Form 3CEB data when engagement is selected
  const loadFromEngagement = async (engagementId: string) => {
    if (!engagementId) return;

    setIsLoading(true);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/form-3ceb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "load", engagementId }),
      });

      if (res.ok) {
        const result = await res.json();

        if (result.exists) {
          // Load existing document
          setDocumentId(result.documentId);
          setDocumentStatus(result.status);
          const savedData = result.data;

          if (savedData.assesseeDetails) setAssessee(savedData.assesseeDetails);
          if (savedData.associatedEnterprises) setAssociatedEnterprises(savedData.associatedEnterprises);
          if (savedData.transactions) setTransactions(savedData.transactions);
          if (savedData.caDetails) setCADetails(savedData.caDetails);

          setSaveMessage({ type: "success", text: `Loaded existing Form 3CEB (${result.status})` });
        } else if (result.prefillData) {
          // Pre-fill from engagement data
          setDocumentId(null);
          setDocumentStatus(null);

          if (result.prefillData.assesseeDetails) {
            setAssessee({ ...initialAssessee, ...result.prefillData.assesseeDetails });
          }
          if (result.prefillData.associatedEnterprises?.length > 0) {
            setAssociatedEnterprises(result.prefillData.associatedEnterprises);
          }
          if (result.prefillData.transactions?.length > 0) {
            setTransactions(result.prefillData.transactions);
          }

          setSaveMessage({ type: "success", text: "Pre-filled data from engagement" });
        }
      }
    } catch (error) {
      console.error("Failed to load form data:", error);
      setSaveMessage({ type: "error", text: "Failed to load form data" });
    } finally {
      setIsLoading(false);
    }
  };

  // Save Form 3CEB to backend
  const saveToBackend = async () => {
    if (!selectedEngagementId) {
      setSaveMessage({ type: "error", text: "Please select an engagement first" });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    const formData = {
      assesseeDetails: assessee,
      associatedEnterprises,
      transactions,
      caDetails,
    };

    try {
      const res = await fetch("/api/form-3ceb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          data: formData,
          engagementId: selectedEngagementId,
          documentId: documentId,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setDocumentId(result.documentId);
        setDocumentStatus(result.status);
        setSaveMessage({ type: "success", text: result.message });
      } else {
        setSaveMessage({ type: "error", text: result.error || "Failed to save" });
      }
    } catch (error) {
      console.error("Failed to save form:", error);
      setSaveMessage({ type: "error", text: "Failed to save form" });
    } finally {
      setIsSaving(false);
    }
  };

  // Add new AE
  const addAE = () => {
    const newAE: AssociatedEnterprise = {
      id: `AE${String(associatedEnterprises.length + 1).padStart(3, "0")}`,
      name: "",
      country: "",
      countryCode: "",
      address: "",
      relationshipType: "",
      relationshipDescription: "",
      taxId: "",
    };
    setAssociatedEnterprises([...associatedEnterprises, newAE]);
  };

  // Update AE
  const updateAE = (id: string, field: keyof AssociatedEnterprise, value: string) => {
    setAssociatedEnterprises(
      associatedEnterprises.map((ae) =>
        ae.id === id ? { ...ae, [field]: value } : ae
      )
    );
  };

  // Remove AE
  const removeAE = (id: string) => {
    setAssociatedEnterprises(associatedEnterprises.filter((ae) => ae.id !== id));
    // Also remove related transactions
    setTransactions(transactions.filter((t) => t.aeId !== id));
  };

  // Add new transaction
  const addTransaction = () => {
    const newTxn: InternationalTransaction = {
      id: `TXN${String(transactions.length + 1).padStart(3, "0")}`,
      aeId: "",
      aeName: "",
      aeCountry: "",
      natureCode: "",
      description: "",
      valueAsPerBooks: 0,
      valueAsPerALP: 0,
      method: "TNMM",
      methodJustification: "",
      numberOfComparables: 0,
      safeHarbourOpted: false,
    };
    setTransactions([...transactions, newTxn]);
  };

  // Update transaction
  const updateTransaction = (
    id: string,
    field: keyof InternationalTransaction,
    value: string | number | boolean
  ) => {
    setTransactions(
      transactions.map((t) => {
        if (t.id !== id) return t;

        // If AE is selected, auto-fill AE details
        if (field === "aeId") {
          const ae = associatedEnterprises.find((a) => a.id === value);
          if (ae) {
            return {
              ...t,
              aeId: value as string,
              aeName: ae.name,
              aeCountry: ae.countryCode,
            };
          }
        }

        return { ...t, [field]: value };
      })
    );
  };

  // Remove transaction
  const removeTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  // Validate current step
  const validateStep = (step: number): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (step === 1) {
      if (!assessee.name) {
        errors.push({ field: "name", message: "Name is required", severity: "error", section: "Assessee" });
      }
      if (!validatePAN(assessee.pan)) {
        errors.push({ field: "pan", message: "Invalid PAN format", severity: "critical", section: "Assessee" });
      }
      if (!validatePinCode(assessee.pinCode)) {
        errors.push({ field: "pinCode", message: "Invalid PIN code", severity: "error", section: "Assessee" });
      }
      if (assessee.email && !validateEmail(assessee.email)) {
        errors.push({ field: "email", message: "Invalid email format", severity: "error", section: "Assessee" });
      }
    }

    if (step === 2) {
      if (associatedEnterprises.length === 0) {
        errors.push({ field: "ae", message: "At least one AE is required", severity: "warning", section: "AE" });
      }
      associatedEnterprises.forEach((ae, idx) => {
        if (!ae.name) {
          errors.push({ field: `ae[${idx}].name`, message: `AE ${idx + 1}: Name is required`, severity: "error", section: "AE" });
        }
        if (!ae.countryCode) {
          errors.push({ field: `ae[${idx}].country`, message: `AE ${idx + 1}: Country is required`, severity: "error", section: "AE" });
        }
      });
    }

    if (step === 3) {
      transactions.forEach((txn, idx) => {
        if (!txn.aeId) {
          errors.push({ field: `txn[${idx}].aeId`, message: `Transaction ${idx + 1}: AE is required`, severity: "error", section: "Transactions" });
        }
        if (!txn.natureCode) {
          errors.push({ field: `txn[${idx}].nature`, message: `Transaction ${idx + 1}: Nature is required`, severity: "error", section: "Transactions" });
        }
        if (txn.valueAsPerBooks <= 0) {
          errors.push({ field: `txn[${idx}].value`, message: `Transaction ${idx + 1}: Value must be positive`, severity: "error", section: "Transactions" });
        }
      });
    }

    if (step === 4) {
      if (!caDetails.caName) {
        errors.push({ field: "caName", message: "CA name is required", severity: "critical", section: "CA" });
      }
      if (!validateUDIN(caDetails.udin)) {
        errors.push({ field: "udin", message: "Invalid UDIN format (18 characters)", severity: "critical", section: "CA" });
      }
    }

    return errors;
  };

  // Navigate steps
  const goToStep = (step: number) => {
    const errors = validateStep(currentStep);
    setValidationErrors(errors);

    if (step > currentStep && errors.some((e) => e.severity === "critical" || e.severity === "error")) {
      return; // Don't proceed if there are critical/error level issues
    }

    setCurrentStep(step);
  };

  // Generate JSON
  const generateJSON = () => {
    const formData = {
      formDetails: {
        formName: "3CEB",
        formVersion: "1.4",
        assessmentYear: assessee.assessmentYear,
        generatedOn: new Date().toISOString(),
      },
      partA: {
        assesseeDetails: assessee,
        totalInternationalValue: transactions.reduce((sum, t) => sum + t.valueAsPerBooks, 0),
        totalAdjustments: transactions.reduce(
          (sum, t) => sum + Math.abs(t.valueAsPerBooks - t.valueAsPerALP),
          0
        ),
      },
      associatedEnterprises,
      partB: {
        internationalTransactions: transactions,
      },
      caDetails,
    };

    const blob = new Blob([JSON.stringify(formData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Form3CEB_${assessee.pan}_${assessee.assessmentYear}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate totals
  const totalValue = transactions.reduce((sum, t) => sum + t.valueAsPerBooks, 0);
  const totalAdjustment = transactions.reduce(
    (sum, t) => sum + Math.abs(t.valueAsPerBooks - t.valueAsPerALP),
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Form 3CEB Generator
          </h1>
          <p className="text-[var(--text-secondary)]">
            Transfer Pricing Audit Report under Section 92E
          </p>
        </div>

        {/* Engagement Selector and Save Controls */}
        <div className="flex items-center gap-3">
          <Select
            value={selectedEngagementId}
            onValueChange={(value) => {
              setSelectedEngagementId(value);
              loadFromEngagement(value);
            }}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select engagement to save/load" />
            </SelectTrigger>
            <SelectContent>
              {engagements.map((eng) => (
                <SelectItem key={eng.id} value={eng.id}>
                  {eng.client.name} - FY {eng.financialYear}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadFromEngagement(selectedEngagementId)}
            disabled={!selectedEngagementId || isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <FolderOpen className="mr-1 h-4 w-4" />
            )}
            Load
          </Button>

          <Button
            size="sm"
            onClick={saveToBackend}
            disabled={!selectedEngagementId || isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1 h-4 w-4" />
            )}
            Save
          </Button>

          {documentStatus && (
            <Badge variant={documentStatus === "DRAFT" ? "secondary" : "default"}>
              {documentStatus}
            </Badge>
          )}
        </div>
      </div>

      {/* Save/Load Message */}
      {saveMessage && (
        <div
          className={`rounded-lg p-3 ${
            saveMessage.type === "success"
              ? "bg-[var(--success-bg)] text-[var(--success)]"
              : "bg-[var(--error-bg)] text-[var(--error)]"
          }`}
        >
          {saveMessage.type === "success" ? (
            <CheckCircle className="mr-2 inline h-4 w-4" />
          ) : (
            <AlertTriangle className="mr-2 inline h-4 w-4" />
          )}
          {saveMessage.text}
        </div>
      )}

      {/* Step Progress */}
      <div className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
        {WIZARD_STEPS.map((step, idx) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => goToStep(step.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${
                currentStep === step.id
                  ? "bg-[var(--accent)] text-white"
                  : currentStep > step.id
                  ? "bg-[var(--success-bg)] text-[var(--success)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <step.icon className="h-5 w-5" />
              <span className="hidden font-medium md:inline">{step.title}</span>
              <span className="font-medium md:hidden">{step.id}</span>
            </button>
            {idx < WIZARD_STEPS.length - 1 && (
              <ChevronRight className="mx-2 h-5 w-5 text-[var(--text-muted)]" />
            )}
          </div>
        ))}
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="rounded-lg border border-[var(--error)]/50 bg-[var(--error-bg)] p-4">
          <div className="flex items-center gap-2 text-[var(--error)]">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Please fix the following issues:</span>
          </div>
          <ul className="mt-2 space-y-1">
            {validationErrors.map((error, idx) => (
              <li key={idx} className="text-sm text-[var(--text-secondary)]">
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 1: Assessee Details */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[var(--accent)]" />
              Assessee Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Name of Assessee *</Label>
                <Input
                  value={assessee.name}
                  onChange={(e) => setAssessee({ ...assessee, name: e.target.value })}
                  placeholder="Company name as per PAN"
                />
              </div>
              <div className="space-y-2">
                <Label>PAN *</Label>
                <Input
                  value={assessee.pan}
                  onChange={(e) => setAssessee({ ...assessee, pan: e.target.value.toUpperCase() })}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address *</Label>
              <Input
                value={assessee.address}
                onChange={(e) => setAssessee({ ...assessee, address: e.target.value })}
                placeholder="Registered office address"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>City *</Label>
                <Input
                  value={assessee.city}
                  onChange={(e) => setAssessee({ ...assessee, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Select
                  value={assessee.state}
                  onValueChange={(value) => setAssessee({ ...assessee, state: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state.code} value={state.code}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>PIN Code *</Label>
                <Input
                  value={assessee.pinCode}
                  onChange={(e) => setAssessee({ ...assessee, pinCode: e.target.value })}
                  placeholder="560001"
                  maxLength={6}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={assessee.status}
                  onValueChange={(value) => setAssessee({ ...assessee, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSESSEE_STATUS.map((s) => (
                      <SelectItem key={s.code} value={s.code}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>NIC Code</Label>
                <Select
                  value={assessee.nicCode}
                  onValueChange={(value) => setAssessee({ ...assessee, nicCode: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select NIC code" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(NIC_CODES).map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        {code} - {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Principal Business Activity</Label>
              <Input
                value={assessee.principalBusinessActivity}
                onChange={(e) =>
                  setAssessee({ ...assessee, principalBusinessActivity: e.target.value })
                }
                placeholder="e.g., Software Development Services"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Previous Year From</Label>
                <Input
                  type="date"
                  value={assessee.previousYearFrom}
                  onChange={(e) =>
                    setAssessee({ ...assessee, previousYearFrom: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Previous Year To</Label>
                <Input
                  type="date"
                  value={assessee.previousYearTo}
                  onChange={(e) =>
                    setAssessee({ ...assessee, previousYearTo: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Assessment Year</Label>
                <Input
                  value={assessee.assessmentYear}
                  onChange={(e) =>
                    setAssessee({ ...assessee, assessmentYear: e.target.value })
                  }
                  placeholder="2025-26"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={assessee.email}
                  onChange={(e) => setAssessee({ ...assessee, email: e.target.value })}
                  placeholder="tax@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={assessee.phone}
                  onChange={(e) => setAssessee({ ...assessee, phone: e.target.value })}
                  placeholder="9876543210"
                  maxLength={10}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Associated Enterprises */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-[var(--accent)]" />
                Associated Enterprises
              </CardTitle>
              <Button onClick={addAE} size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Add AE
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {associatedEnterprises.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--border-default)] p-8 text-center">
                <Globe className="mx-auto h-12 w-12 text-[var(--text-muted)]" />
                <p className="mt-2 text-[var(--text-secondary)]">
                  No Associated Enterprises added yet
                </p>
                <Button onClick={addAE} variant="outline" className="mt-4">
                  <Plus className="mr-1 h-4 w-4" />
                  Add First AE
                </Button>
              </div>
            ) : (
              associatedEnterprises.map((ae, idx) => (
                <div
                  key={ae.id}
                  className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <Badge variant="secondary">{ae.id}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAE(ae.id)}
                      className="text-[var(--error)]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Name of AE *</Label>
                      <Input
                        value={ae.name}
                        onChange={(e) => updateAE(ae.id, "name", e.target.value)}
                        placeholder="ABC Technologies Inc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Country *</Label>
                      <Select
                        value={ae.countryCode}
                        onValueChange={(value) => {
                          const country = COUNTRY_LIST.find((c) => c.code === value);
                          updateAE(ae.id, "countryCode", value);
                          updateAE(ae.id, "country", country?.name || "");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRY_LIST.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label>Address</Label>
                    <Input
                      value={ae.address}
                      onChange={(e) => updateAE(ae.id, "address", e.target.value)}
                      placeholder="Registered address of AE"
                    />
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Relationship Type *</Label>
                      <Select
                        value={ae.relationshipType}
                        onValueChange={(value) => updateAE(ae.id, "relationshipType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(RELATIONSHIP_TYPES).map(([code, name]) => (
                            <SelectItem key={code} value={code}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tax ID / TIN</Label>
                      <Input
                        value={ae.taxId || ""}
                        onChange={(e) => updateAE(ae.id, "taxId", e.target.value)}
                        placeholder="Foreign tax identification"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: International Transactions */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--accent)]" />
                International Transactions
              </CardTitle>
              <Button onClick={addTransaction} size="sm" disabled={associatedEnterprises.length === 0}>
                <Plus className="mr-1 h-4 w-4" />
                Add Transaction
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            {transactions.length > 0 && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-[var(--bg-secondary)] p-4">
                  <p className="text-sm text-[var(--text-muted)]">Total Transactions</p>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {transactions.length}
                  </p>
                </div>
                <div className="rounded-lg bg-[var(--bg-secondary)] p-4">
                  <p className="text-sm text-[var(--text-muted)]">Total Value</p>
                  <p className="text-2xl font-semibold text-[var(--accent)]">
                    {formatCurrency(totalValue)}
                  </p>
                </div>
                <div className="rounded-lg bg-[var(--bg-secondary)] p-4">
                  <p className="text-sm text-[var(--text-muted)]">Total Adjustments</p>
                  <p className={`text-2xl font-semibold ${totalAdjustment > 0 ? "text-[var(--warning)]" : "text-[var(--success)]"}`}>
                    {formatCurrency(totalAdjustment)}
                  </p>
                </div>
              </div>
            )}

            {transactions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--border-default)] p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-[var(--text-muted)]" />
                <p className="mt-2 text-[var(--text-secondary)]">
                  {associatedEnterprises.length === 0
                    ? "Add Associated Enterprises first"
                    : "No transactions added yet"}
                </p>
                {associatedEnterprises.length > 0 && (
                  <Button onClick={addTransaction} variant="outline" className="mt-4">
                    <Plus className="mr-1 h-4 w-4" />
                    Add First Transaction
                  </Button>
                )}
              </div>
            ) : (
              transactions.map((txn, idx) => (
                <div
                  key={txn.id}
                  className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <Badge variant="secondary">Transaction {idx + 1}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTransaction(txn.id)}
                      className="text-[var(--error)]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Associated Enterprise *</Label>
                      <Select
                        value={txn.aeId}
                        onValueChange={(value) => updateTransaction(txn.id, "aeId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select AE" />
                        </SelectTrigger>
                        <SelectContent>
                          {associatedEnterprises.map((ae) => (
                            <SelectItem key={ae.id} value={ae.id}>
                              {ae.name} ({ae.countryCode})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Nature of Transaction *</Label>
                      <Select
                        value={txn.natureCode}
                        onValueChange={(value) => updateTransaction(txn.id, "natureCode", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select nature" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(TRANSACTION_CATEGORIES).map(([cat, data]) => (
                            <div key={cat}>
                              <div className="px-2 py-1.5 text-xs font-semibold text-[var(--text-muted)]">
                                {data.label}
                              </div>
                              {data.codes.map((code) => (
                                <SelectItem key={code} value={code}>
                                  {code} - {TRANSACTION_NATURE_CODES[code as keyof typeof TRANSACTION_NATURE_CODES]}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={txn.description}
                      onChange={(e) => updateTransaction(txn.id, "description", e.target.value)}
                      placeholder="Brief description of transaction"
                    />
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Value as per Books (Rs.) *</Label>
                      <Input
                        type="number"
                        value={txn.valueAsPerBooks || ""}
                        onChange={(e) =>
                          updateTransaction(txn.id, "valueAsPerBooks", parseFloat(e.target.value) || 0)
                        }
                        placeholder="Enter value"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Value as per ALP (Rs.) *</Label>
                      <Input
                        type="number"
                        value={txn.valueAsPerALP || ""}
                        onChange={(e) =>
                          updateTransaction(txn.id, "valueAsPerALP", parseFloat(e.target.value) || 0)
                        }
                        placeholder="Arm's length price"
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>TP Method *</Label>
                      <Select
                        value={txn.method}
                        onValueChange={(value) => updateTransaction(txn.id, "method", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(TP_METHODS).map((method) => (
                            <SelectItem key={method.code} value={method.code}>
                              {method.code} - {method.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>No. of Comparables</Label>
                      <Input
                        type="number"
                        value={txn.numberOfComparables || ""}
                        onChange={(e) =>
                          updateTransaction(txn.id, "numberOfComparables", parseInt(e.target.value) || 0)
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label>Method Justification</Label>
                    <Input
                      value={txn.methodJustification}
                      onChange={(e) =>
                        updateTransaction(txn.id, "methodJustification", e.target.value)
                      }
                      placeholder="Reason for selecting this method"
                    />
                  </div>

                  {/* Adjustment indicator */}
                  {txn.valueAsPerBooks !== txn.valueAsPerALP && txn.valueAsPerBooks > 0 && (
                    <div className="mt-4 rounded-lg bg-[var(--warning-bg)] p-3">
                      <div className="flex items-center gap-2 text-[var(--warning)]">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">
                          Adjustment: {formatCurrency(Math.abs(txn.valueAsPerBooks - txn.valueAsPerALP))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: CA Certification */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-[var(--accent)]" />
              CA Certification Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>CA Name *</Label>
                <Input
                  value={caDetails.caName}
                  onChange={(e) => setCADetails({ ...caDetails, caName: e.target.value })}
                  placeholder="Full name of CA"
                />
              </div>
              <div className="space-y-2">
                <Label>Membership Number *</Label>
                <Input
                  value={caDetails.membershipNumber}
                  onChange={(e) => setCADetails({ ...caDetails, membershipNumber: e.target.value })}
                  placeholder="ICAI membership no."
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Firm Name</Label>
                <Input
                  value={caDetails.firmName}
                  onChange={(e) => setCADetails({ ...caDetails, firmName: e.target.value })}
                  placeholder="CA firm name"
                />
              </div>
              <div className="space-y-2">
                <Label>Firm Registration Number</Label>
                <Input
                  value={caDetails.firmRegistrationNumber}
                  onChange={(e) =>
                    setCADetails({ ...caDetails, firmRegistrationNumber: e.target.value })
                  }
                  placeholder="e.g., 123456W"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>UDIN (Unique Document Identification Number) *</Label>
              <Input
                value={caDetails.udin}
                onChange={(e) => setCADetails({ ...caDetails, udin: e.target.value.toUpperCase() })}
                placeholder="18-character UDIN from ICAI portal"
                maxLength={18}
              />
              <p className="text-xs text-[var(--text-muted)]">
                Generate UDIN from udin.icai.org before filing
              </p>
            </div>

            <div className="space-y-2">
              <Label>Date of Report *</Label>
              <Input
                type="date"
                value={caDetails.dateOfReport}
                onChange={(e) => setCADetails({ ...caDetails, dateOfReport: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>CA Address</Label>
              <Input
                value={caDetails.address}
                onChange={(e) => setCADetails({ ...caDetails, address: e.target.value })}
                placeholder="Office address"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={caDetails.city}
                  onChange={(e) => setCADetails({ ...caDetails, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label>PIN</Label>
                <Input
                  value={caDetails.pin}
                  onChange={(e) => setCADetails({ ...caDetails, pin: e.target.value })}
                  placeholder="PIN code"
                  maxLength={6}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Review & Generate */}
      {currentStep === 5 && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-[var(--text-muted)]">Assessee</p>
                <p className="font-medium text-[var(--text-primary)]">{assessee.name || "Not set"}</p>
                <p className="text-sm text-[var(--text-secondary)]">{assessee.pan}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-[var(--text-muted)]">Associated Enterprises</p>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {associatedEnterprises.length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-[var(--text-muted)]">Transactions</p>
                <p className="text-2xl font-semibold text-[var(--accent)]">
                  {formatCurrency(totalValue)}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{transactions.length} transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-[var(--text-muted)]">Adjustments</p>
                <p className={`text-2xl font-semibold ${totalAdjustment > 0 ? "text-[var(--warning)]" : "text-[var(--success)]"}`}>
                  {formatCurrency(totalAdjustment)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Review */}
          <Card>
            <CardHeader>
              <CardTitle>Review Form 3CEB</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AE Summary */}
              <div>
                <h4 className="mb-2 font-medium text-[var(--text-primary)]">Associated Enterprises</h4>
                <div className="space-y-2">
                  {associatedEnterprises.map((ae) => (
                    <div
                      key={ae.id}
                      className="flex items-center justify-between rounded-lg bg-[var(--bg-secondary)] p-3"
                    >
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{ae.name}</p>
                        <p className="text-sm text-[var(--text-muted)]">
                          {ae.country} | {RELATIONSHIP_TYPES[ae.relationshipType as keyof typeof RELATIONSHIP_TYPES]}
                        </p>
                      </div>
                      <Badge variant="secondary">{ae.id}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction Summary */}
              <div>
                <h4 className="mb-2 font-medium text-[var(--text-primary)]">Transaction Summary</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)]">
                        <th className="py-2 text-left text-[var(--text-muted)]">AE</th>
                        <th className="py-2 text-left text-[var(--text-muted)]">Nature</th>
                        <th className="py-2 text-right text-[var(--text-muted)]">Value</th>
                        <th className="py-2 text-left text-[var(--text-muted)]">Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((txn) => (
                        <tr key={txn.id} className="border-b border-[var(--border-subtle)]">
                          <td className="py-2 text-[var(--text-primary)]">{txn.aeName}</td>
                          <td className="py-2 text-[var(--text-secondary)]">
                            {TRANSACTION_NATURE_CODES[txn.natureCode as keyof typeof TRANSACTION_NATURE_CODES]}
                          </td>
                          <td className="py-2 text-right font-medium text-[var(--text-primary)]">
                            {formatCurrency(txn.valueAsPerBooks)}
                          </td>
                          <td className="py-2 text-[var(--text-secondary)]">{txn.method}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CA Details */}
              <div>
                <h4 className="mb-2 font-medium text-[var(--text-primary)]">CA Certification</h4>
                <div className="rounded-lg bg-[var(--bg-secondary)] p-4">
                  <p className="text-[var(--text-primary)]">{caDetails.caName}</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    M.No: {caDetails.membershipNumber} | UDIN: {caDetails.udin}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {caDetails.firmName} ({caDetails.firmRegistrationNumber})
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => goToStep(currentStep - 1)}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>

        {currentStep < 5 ? (
          <Button onClick={() => goToStep(currentStep + 1)}>
            Next
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={generateJSON}>
            <Download className="mr-1 h-4 w-4" />
            Generate JSON
          </Button>
        )}
      </div>
    </div>
  );
}
