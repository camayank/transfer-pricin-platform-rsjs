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
  AlertTriangle,
  Calculator,
  FileText,
  Scale,
  TrendingUp,
  Shield,
  Info,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface PenaltyResult {
  summary: {
    section: string;
    totalMinimum: number;
    totalMaximum: number;
    mostLikely: number;
    primaryAdjustment: number;
  };
  breakdown: {
    concealmentPenalty: { applicable: boolean; amount: number; section: string };
    documentationPenalty271AA: { applicable: boolean; amount: number };
    documentationPenalty271G: { applicable: boolean; amount: number };
    reportFailurePenalty: { applicable: boolean; amount: number };
    interest234A: { applicable: boolean; amount: number };
    interest234B: { applicable: boolean; amount: number };
    interest234C: { applicable: boolean; amount: number };
  };
  mitigation: {
    likelihood: string;
    reducingFactors: string[];
    recommendations: string[];
  };
}

const assessmentYears = [
  "2024-25",
  "2023-24",
  "2022-23",
  "2021-22",
  "2020-21",
];

const entityTypes = [
  { value: "domestic_company", label: "Domestic Company" },
  { value: "foreign_company", label: "Foreign Company" },
  { value: "llp", label: "LLP" },
  { value: "firm", label: "Partnership Firm" },
  { value: "individual", label: "Individual/HUF" },
];

export default function PenaltyCalculatorPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PenaltyResult | null>(null);
  const [formData, setFormData] = useState({
    assessmentYear: "2024-25",
    entityType: "domestic_company",
    primaryAdjustment: "",
    totalIncome: "",
    taxPayable: "",
    transactionValue: "",
    hasDocumentation: "yes",
    filedForm3CEB: "yes",
    advanceTaxPaid: "",
    returnFiledOnTime: "yes",
  });

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/penalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentYear: formData.assessmentYear,
          entityType: formData.entityType,
          primaryAdjustment: parseFloat(formData.primaryAdjustment) || 0,
          totalIncome: parseFloat(formData.totalIncome) || 0,
          taxPayable: parseFloat(formData.taxPayable) || 0,
          transactionValue: parseFloat(formData.transactionValue) || 0,
          documentationStatus: {
            hasTPDocumentation: formData.hasDocumentation === "yes",
            form3CEBFiled: formData.filedForm3CEB === "yes",
            returnFiledOnTime: formData.returnFiledOnTime === "yes",
          },
          advanceTaxDetails: {
            totalAdvanceTaxPaid: parseFloat(formData.advanceTaxPaid) || 0,
          },
          useAIAnalysis: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (error) {
      console.error("Error calculating penalty:", error);
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Penalty Exposure Calculator
          </h1>
          <p className="text-[var(--text-secondary)]">
            Calculate potential penalties under Sections 271(1)(c), 271AA, 271BA, 271G & Interest 234A-D
          </p>
        </div>
        <Badge variant="outline" className="text-[var(--warning)]">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Advisory Tool
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Form */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calculator className="h-4 w-4" />
                Input Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="space-y-2">
                <Label>TP Adjustment Amount (INR)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 10000000"
                  value={formData.primaryAdjustment}
                  onChange={(e) =>
                    setFormData({ ...formData, primaryAdjustment: e.target.value })
                  }
                />
                <p className="text-xs text-[var(--text-muted)]">
                  Primary adjustment proposed by TPO/AO
                </p>
              </div>

              <div className="space-y-2">
                <Label>Total Income (INR)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 50000000"
                  value={formData.totalIncome}
                  onChange={(e) =>
                    setFormData({ ...formData, totalIncome: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Total Transaction Value (INR)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 100000000"
                  value={formData.transactionValue}
                  onChange={(e) =>
                    setFormData({ ...formData, transactionValue: e.target.value })
                  }
                />
                <p className="text-xs text-[var(--text-muted)]">
                  Value of international transactions
                </p>
              </div>

              <div className="space-y-2">
                <Label>Tax Payable on Adjustment (INR)</Label>
                <Input
                  type="number"
                  placeholder="Auto-calculated or enter"
                  value={formData.taxPayable}
                  onChange={(e) =>
                    setFormData({ ...formData, taxPayable: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>TP Documentation Maintained?</Label>
                <Select
                  value={formData.hasDocumentation}
                  onValueChange={(v) => setFormData({ ...formData, hasDocumentation: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes - Complete</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Form 3CEB Filed?</Label>
                <Select
                  value={formData.filedForm3CEB}
                  onValueChange={(v) => setFormData({ ...formData, filedForm3CEB: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes - On Time</SelectItem>
                    <SelectItem value="late">Yes - Late</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleCalculate} className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculate Penalty Exposure
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4" />
                Penalty Sections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">271(1)(c)</span>
                <span>100-300% of tax evaded</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">271AA</span>
                <span>2% of transaction value</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">271BA</span>
                <span>Rs. 1,00,000 per form</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">271G</span>
                <span>2% of transaction value</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">234A/B/C</span>
                <span>1% per month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              {/* Summary Card */}
              <Card className="border-l-4 border-l-[var(--warning)]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Scale className="h-5 w-5" />
                      Penalty Exposure Summary
                    </span>
                    <Badge
                      variant={
                        result.summary.mostLikely > 10000000
                          ? "error"
                          : result.summary.mostLikely > 1000000
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {result.summary.mostLikely > 10000000
                        ? "High Risk"
                        : result.summary.mostLikely > 1000000
                        ? "Medium Risk"
                        : "Low Risk"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-[var(--bg-secondary)] p-4 text-center">
                      <p className="text-sm text-[var(--text-muted)]">Minimum Exposure</p>
                      <p className="text-2xl font-bold text-[var(--text-primary)]">
                        {formatCurrency(result.summary.totalMinimum)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[var(--warning-bg)] p-4 text-center">
                      <p className="text-sm text-[var(--text-muted)]">Most Likely</p>
                      <p className="text-2xl font-bold text-[var(--warning)]">
                        {formatCurrency(result.summary.mostLikely)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[var(--error-bg)] p-4 text-center">
                      <p className="text-sm text-[var(--text-muted)]">Maximum Exposure</p>
                      <p className="text-2xl font-bold text-[var(--error)]">
                        {formatCurrency(result.summary.totalMaximum)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    Detailed Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.breakdown.concealmentPenalty.applicable && (
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">Concealment Penalty</p>
                          <p className="text-sm text-[var(--text-muted)]">
                            Section {result.breakdown.concealmentPenalty.section}
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-[var(--error)]">
                          {formatCurrency(result.breakdown.concealmentPenalty.amount)}
                        </p>
                      </div>
                    )}
                    {result.breakdown.documentationPenalty271AA.applicable && (
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">Documentation Penalty</p>
                          <p className="text-sm text-[var(--text-muted)]">Section 271AA</p>
                        </div>
                        <p className="text-lg font-semibold text-[var(--warning)]">
                          {formatCurrency(result.breakdown.documentationPenalty271AA.amount)}
                        </p>
                      </div>
                    )}
                    {result.breakdown.documentationPenalty271G.applicable && (
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">Information Penalty</p>
                          <p className="text-sm text-[var(--text-muted)]">Section 271G</p>
                        </div>
                        <p className="text-lg font-semibold text-[var(--warning)]">
                          {formatCurrency(result.breakdown.documentationPenalty271G.amount)}
                        </p>
                      </div>
                    )}
                    {result.breakdown.reportFailurePenalty.applicable && (
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">Report Failure Penalty</p>
                          <p className="text-sm text-[var(--text-muted)]">Section 271BA</p>
                        </div>
                        <p className="text-lg font-semibold text-[var(--warning)]">
                          {formatCurrency(result.breakdown.reportFailurePenalty.amount)}
                        </p>
                      </div>
                    )}
                    {(result.breakdown.interest234A.applicable ||
                      result.breakdown.interest234B.applicable ||
                      result.breakdown.interest234C.applicable) && (
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">Interest (234A/B/C)</p>
                          <p className="text-sm text-[var(--text-muted)]">
                            On delayed payment
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-[var(--info)]">
                          {formatCurrency(
                            (result.breakdown.interest234A.amount || 0) +
                              (result.breakdown.interest234B.amount || 0) +
                              (result.breakdown.interest234C.amount || 0)
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Mitigation Strategies */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="h-4 w-4" />
                    Defense & Mitigation
                  </CardTitle>
                  <CardDescription>
                    Penalty likelihood:{" "}
                    <Badge variant="outline">{result.mitigation.likelihood}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-sm font-medium text-[var(--text-secondary)]">
                        Reducing Factors Present:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.mitigation.reducingFactors.map((factor, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-[var(--success-bg)] text-[var(--success)]">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium text-[var(--text-secondary)]">
                        Recommended Actions:
                      </p>
                      <ul className="space-y-2">
                        {result.mitigation.recommendations.map((rec, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-[var(--text-muted)]"
                          >
                            <ChevronRight className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="flex h-[400px] items-center justify-center">
              <div className="text-center">
                <TrendingUp className="mx-auto h-12 w-12 text-[var(--text-muted)]" />
                <p className="mt-4 text-[var(--text-secondary)]">
                  Enter parameters and calculate to see penalty exposure
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  Results will appear here with detailed breakdown
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
