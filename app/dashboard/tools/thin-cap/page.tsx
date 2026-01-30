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
  Banknote,
  Calculator,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  Plus,
  Trash2,
  Loader2,
  ArrowRight,
} from "lucide-react";

interface ThinCapResult {
  exempt: boolean;
  exemptionCategory?: string;
  ebitda?: {
    totalEBITDA: number;
    components: {
      profitBeforeTax: number;
      interestExpense: number;
      depreciation: number;
      amortization: number;
    };
  };
  calculation?: {
    allowableInterest: number;
    disallowedInterest: number;
    interestToNonResidentAE: number;
  };
  carryforward?: {
    available: boolean;
    amount: number;
    yearsRemaining: number;
  };
  summary: {
    section: string;
    status: string;
    limitPercentage: string;
  };
}

interface InterestExpense {
  id: string;
  lenderName: string;
  lenderCountry: string;
  principalAmount: string;
  interestRate: string;
  interestAmount: string;
  isAE: boolean;
}

const entityTypes = [
  { value: "indian_company", label: "Indian Company" },
  { value: "pe_foreign_company", label: "PE of Foreign Company" },
  { value: "llp", label: "LLP" },
];

const assessmentYears = ["2024-25", "2023-24", "2022-23", "2021-22"];

export default function ThinCapCalculatorPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ThinCapResult | null>(null);
  const [formData, setFormData] = useState({
    assessmentYear: "2024-25",
    entityType: "indian_company",
    profitBeforeTax: "",
    totalInterestExpense: "",
    depreciation: "",
    amortization: "",
    interestIncome: "",
  });

  const [interestExpenses, setInterestExpenses] = useState<InterestExpense[]>([
    {
      id: "1",
      lenderName: "",
      lenderCountry: "",
      principalAmount: "",
      interestRate: "",
      interestAmount: "",
      isAE: true,
    },
  ]);

  const addInterestExpense = () => {
    setInterestExpenses([
      ...interestExpenses,
      {
        id: Date.now().toString(),
        lenderName: "",
        lenderCountry: "",
        principalAmount: "",
        interestRate: "",
        interestAmount: "",
        isAE: true,
      },
    ]);
  };

  const removeInterestExpense = (id: string) => {
    setInterestExpenses(interestExpenses.filter((e) => e.id !== id));
  };

  const updateInterestExpense = (id: string, field: string, value: string | boolean) => {
    setInterestExpenses(
      interestExpenses.map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      )
    );
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/thin-cap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentYear: formData.assessmentYear,
          entityType: formData.entityType,
          financials: {
            profitBeforeTax: parseFloat(formData.profitBeforeTax) || 0,
            totalInterestExpense: parseFloat(formData.totalInterestExpense) || 0,
            depreciation: parseFloat(formData.depreciation) || 0,
            amortization: parseFloat(formData.amortization) || 0,
            interestIncome: parseFloat(formData.interestIncome) || 0,
          },
          interestExpenses: interestExpenses
            .filter((e) => e.lenderName && e.interestAmount)
            .map((e) => ({
              lenderName: e.lenderName,
              lenderCountry: e.lenderCountry || "Unknown",
              principalAmount: parseFloat(e.principalAmount) || 0,
              interestRate: parseFloat(e.interestRate) || 0,
              interestAmount: parseFloat(e.interestAmount) || 0,
              isAE: e.isAE,
            })),
          useAIAnalysis: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (error) {
      console.error("Error calculating thin cap:", error);
    }
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalAEInterest = interestExpenses
    .filter((e) => e.isAE && e.interestAmount)
    .reduce((sum, e) => sum + (parseFloat(e.interestAmount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Thin Capitalization Calculator
          </h1>
          <p className="text-[var(--text-secondary)]">
            Section 94B - Interest Limitation (30% of EBITDA) for Non-Resident AE Loans
          </p>
        </div>
        <Badge variant="outline">
          <Banknote className="mr-1 h-3 w-3" />
          Section 94B
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Assessment Year</Label>
                  <Select
                    value={formData.assessmentYear}
                    onValueChange={(v) => setFormData({ ...formData, assessmentYear: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {assessmentYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Entity Type</Label>
                  <Select
                    value={formData.entityType}
                    onValueChange={(v) => setFormData({ ...formData, entityType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {entityTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Financial Data (For EBITDA Calculation)</CardTitle>
              <CardDescription>All amounts in INR</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Profit Before Tax</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 100000000"
                    value={formData.profitBeforeTax}
                    onChange={(e) =>
                      setFormData({ ...formData, profitBeforeTax: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Interest Expense</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 50000000"
                    value={formData.totalInterestExpense}
                    onChange={(e) =>
                      setFormData({ ...formData, totalInterestExpense: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Depreciation</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 20000000"
                    value={formData.depreciation}
                    onChange={(e) =>
                      setFormData({ ...formData, depreciation: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amortization</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 5000000"
                    value={formData.amortization}
                    onChange={(e) =>
                      setFormData({ ...formData, amortization: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Interest Income from AE (for netting)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 1000000"
                    value={formData.interestIncome}
                    onChange={(e) =>
                      setFormData({ ...formData, interestIncome: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interest Expenses to Non-Resident AE */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>Interest Paid to Non-Resident AE</span>
                <Button variant="outline" size="sm" onClick={addInterestExpense}>
                  <Plus className="mr-1 h-3 w-3" />
                  Add Lender
                </Button>
              </CardTitle>
              <CardDescription>
                Only interest paid to non-resident associated enterprises is subject to limitation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {interestExpenses.map((expense, index) => (
                <div
                  key={expense.id}
                  className="rounded-lg border p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Lender {index + 1}</span>
                    {interestExpenses.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInterestExpense(expense.id)}
                      >
                        <Trash2 className="h-4 w-4 text-[var(--error)]" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Lender Name</Label>
                      <Input
                        placeholder="Parent Corp Ltd"
                        value={expense.lenderName}
                        onChange={(e) =>
                          updateInterestExpense(expense.id, "lenderName", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Lender Country</Label>
                      <Input
                        placeholder="USA"
                        value={expense.lenderCountry}
                        onChange={(e) =>
                          updateInterestExpense(expense.id, "lenderCountry", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Is AE?</Label>
                      <Select
                        value={expense.isAE ? "yes" : "no"}
                        onValueChange={(v) =>
                          updateInterestExpense(expense.id, "isAE", v === "yes")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes - Associated Enterprise</SelectItem>
                          <SelectItem value="no">No - Third Party</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Principal Amount</Label>
                      <Input
                        type="number"
                        placeholder="100000000"
                        value={expense.principalAmount}
                        onChange={(e) =>
                          updateInterestExpense(expense.id, "principalAmount", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Interest Rate (%)</Label>
                      <Input
                        type="number"
                        placeholder="8.5"
                        value={expense.interestRate}
                        onChange={(e) =>
                          updateInterestExpense(expense.id, "interestRate", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Interest Amount (INR)</Label>
                      <Input
                        type="number"
                        placeholder="8500000"
                        value={expense.interestAmount}
                        onChange={(e) =>
                          updateInterestExpense(expense.id, "interestAmount", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between rounded-lg bg-[var(--bg-secondary)] p-3">
                <span className="text-sm font-medium">Total Interest to Non-Resident AE:</span>
                <span className="text-lg font-bold text-[var(--accent)]">
                  {formatCurrency(totalAEInterest)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleCalculate} className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Interest Limitation
              </>
            )}
          </Button>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {result ? (
            <>
              {/* Status Card */}
              <Card
                className={`border-l-4 ${
                  result.exempt
                    ? "border-l-[var(--success)]"
                    : result.calculation?.disallowedInterest
                    ? "border-l-[var(--warning)]"
                    : "border-l-[var(--success)]"
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    {result.exempt ? (
                      <CheckCircle className="h-8 w-8 text-[var(--success)]" />
                    ) : result.calculation?.disallowedInterest ? (
                      <AlertCircle className="h-8 w-8 text-[var(--warning)]" />
                    ) : (
                      <CheckCircle className="h-8 w-8 text-[var(--success)]" />
                    )}
                    <div>
                      <p className="font-semibold text-lg">
                        {result.exempt
                          ? "Exempt from Section 94B"
                          : result.summary.status}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {result.exempt
                          ? result.exemptionCategory
                          : `Interest limit: ${result.summary.limitPercentage} of EBITDA`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!result.exempt && result.ebitda && (
                <>
                  {/* EBITDA Calculation */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        EBITDA Calculation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-muted)]">Profit Before Tax</span>
                        <span>{formatCurrency(result.ebitda.components.profitBeforeTax)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-muted)]">+ Interest Expense</span>
                        <span>{formatCurrency(result.ebitda.components.interestExpense)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-muted)]">+ Depreciation</span>
                        <span>{formatCurrency(result.ebitda.components.depreciation)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-muted)]">+ Amortization</span>
                        <span>{formatCurrency(result.ebitda.components.amortization)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total EBITDA</span>
                        <span className="text-[var(--accent)]">
                          {formatCurrency(result.ebitda.totalEBITDA)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Interest Limitation */}
                  {result.calculation && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Interest Limitation</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[var(--text-muted)]">
                            Interest to NR AE
                          </span>
                          <span>
                            {formatCurrency(result.calculation.interestToNonResidentAE)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[var(--text-muted)]">
                            Allowable (30% of EBITDA)
                          </span>
                          <span className="text-[var(--success)]">
                            {formatCurrency(result.calculation.allowableInterest)}
                          </span>
                        </div>
                        <div className="border-t pt-2 flex justify-between items-center">
                          <span className="font-medium">Disallowed Interest</span>
                          <span
                            className={`text-lg font-bold ${
                              result.calculation.disallowedInterest > 0
                                ? "text-[var(--error)]"
                                : "text-[var(--success)]"
                            }`}
                          >
                            {formatCurrency(result.calculation.disallowedInterest)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Carryforward */}
                  {result.carryforward?.available && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          Carryforward
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-[var(--text-muted)] mb-2">
                          Disallowed interest can be carried forward for 8 years
                        </p>
                        <div className="flex justify-between">
                          <span>Amount</span>
                          <span className="font-semibold">
                            {formatCurrency(result.carryforward.amount)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </>
          ) : (
            <Card className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <Banknote className="mx-auto h-12 w-12 text-[var(--text-muted)]" />
                <p className="mt-4 text-[var(--text-secondary)]">
                  Enter financial data to calculate
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  Section 94B interest limitation
                </p>
              </div>
            </Card>
          )}

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4" />
                Key Points
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[var(--text-muted)]">
              <p>
                <strong>Applicability:</strong> Interest paid to non-resident AE
              </p>
              <p>
                <strong>Limit:</strong> 30% of EBITDA
              </p>
              <p>
                <strong>Threshold:</strong> Rs. 1 Cr minimum
              </p>
              <p>
                <strong>Carryforward:</strong> 8 years
              </p>
              <p>
                <strong>Exemptions:</strong> Banks, Insurance companies
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
