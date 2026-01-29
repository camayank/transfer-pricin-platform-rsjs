"use client";

import { useState } from "react";
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
  SAFE_HARBOUR_RULES,
  SBI_RATES,
  checkSafeHarbourEligibility,
  type SafeHarbourType,
} from "@/lib/constants/safe-harbour-rules";
import {
  Shield,
  Calculator,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ArrowRight,
} from "lucide-react";

const transactionTypeCards = [
  {
    type: "IT_ITES" as SafeHarbourType,
    icon: "💻",
    title: "IT/ITeS Services",
    description: "Software development, BPO, call centers",
  },
  {
    type: "KPO" as SafeHarbourType,
    icon: "🧠",
    title: "KPO Services",
    description: "Research, analytics, legal services",
  },
  {
    type: "CONTRACT_RD_SOFTWARE" as SafeHarbourType,
    icon: "⚙️",
    title: "Contract R&D - Software",
    description: "Software R&D services",
  },
  {
    type: "CONTRACT_RD_PHARMA" as SafeHarbourType,
    icon: "💊",
    title: "Contract R&D - Pharma",
    description: "Pharmaceutical R&D services",
  },
  {
    type: "AUTO_ANCILLARY" as SafeHarbourType,
    icon: "🚗",
    title: "Auto Components",
    description: "Auto parts manufacturing",
  },
  {
    type: "LOAN_FC" as SafeHarbourType,
    icon: "💵",
    title: "Intra-Group Loan (FC)",
    description: "Foreign currency loans",
  },
  {
    type: "LOAN_INR" as SafeHarbourType,
    icon: "💰",
    title: "Intra-Group Loan (INR)",
    description: "Indian Rupee loans",
  },
  {
    type: "GUARANTEE" as SafeHarbourType,
    icon: "🤝",
    title: "Corporate Guarantee",
    description: "Explicit guarantees to AE",
  },
];

interface AnalysisResult {
  eligible: boolean;
  requiredMargin: number | string;
  gap?: number;
  message: string;
  recommendations: string[];
}

export default function SafeHarbourPage() {
  const [selectedType, setSelectedType] = useState<SafeHarbourType | null>(null);
  const [transactionValue, setTransactionValue] = useState<string>("");
  const [operatingProfit, setOperatingProfit] = useState<string>("");
  const [operatingCost, setOperatingCost] = useState<string>("");
  const [employeeCost, setEmployeeCost] = useState<string>("");
  const [creditRating, setCreditRating] = useState<string>("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const rule = selectedType ? SAFE_HARBOUR_RULES[selectedType] : null;

  const isServiceType = selectedType && !selectedType.includes("LOAN") && selectedType !== "GUARANTEE";
  const isLoanType = selectedType?.includes("LOAN");
  const isKPO = selectedType === "KPO";

  const calculateMargin = () => {
    const op = parseFloat(operatingProfit);
    const oc = parseFloat(operatingCost);
    if (!isNaN(op) && !isNaN(oc) && oc > 0) {
      return (op / oc) * 100;
    }
    return null;
  };

  const handleAnalyze = () => {
    if (!selectedType) return;

    const value = parseFloat(transactionValue) || 0;
    const margin = calculateMargin();
    const empCostRatio = isKPO
      ? (parseFloat(employeeCost) / parseFloat(operatingCost)) * 100
      : undefined;

    const eligibilityResult = checkSafeHarbourEligibility(
      selectedType,
      value * 10000000, // Convert to absolute value (crore to actual)
      margin ?? undefined,
      empCostRatio
    );

    const recommendations: string[] = [];

    if (!eligibilityResult.eligible) {
      if (margin !== null && typeof eligibilityResult.requiredMargin === "number") {
        const diff = eligibilityResult.requiredMargin - margin;
        recommendations.push(
          `Increase operating margin by ${diff.toFixed(2)}% to qualify`
        );
        recommendations.push(
          "Review cost allocation to optimize OP/OC ratio"
        );
        recommendations.push(
          "Consider Safe Harbour Form 3CEFA for documentation"
        );
      }
      recommendations.push(
        "Proceed with full benchmarking analysis as backup"
      );
    } else {
      recommendations.push(
        "File Form 3CEFA to opt for Safe Harbour provisions"
      );
      recommendations.push(
        "Maintain documentation of margin calculation"
      );
      recommendations.push(
        "No transfer pricing adjustment required"
      );
    }

    setResult({
      ...eligibilityResult,
      recommendations,
    });
  };

  const resetForm = () => {
    setSelectedType(null);
    setTransactionValue("");
    setOperatingProfit("");
    setOperatingCost("");
    setEmployeeCost("");
    setCreditRating("");
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Safe Harbour Calculator
        </h1>
        <p className="text-[var(--text-secondary)]">
          Check eligibility under Rule 10TD/10TE/10TF of Income Tax Rules
        </p>
      </div>

      {/* Transaction Type Selection */}
      {!selectedType && (
        <div>
          <h2 className="mb-4 text-lg font-medium text-[var(--text-primary)]">
            Select Transaction Type
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {transactionTypeCards.map((card) => (
              <button
                key={card.type}
                onClick={() => setSelectedType(card.type)}
                className="flex flex-col items-start rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 text-left transition-all hover:border-[var(--accent)]/50 hover:shadow-lg hover:shadow-[var(--accent-glow)]"
              >
                <span className="mb-3 text-3xl">{card.icon}</span>
                <h3 className="font-medium text-[var(--text-primary)]">
                  {card.title}
                </h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  {card.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Calculator Form */}
      {selectedType && !result && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-[var(--accent)]" />
                    {rule?.name}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    Change Type
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Transaction Value */}
                <div className="space-y-2">
                  <Label>Transaction Value (in Crores)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 150"
                    value={transactionValue}
                    onChange={(e) => setTransactionValue(e.target.value)}
                  />
                  <p className="text-xs text-[var(--text-muted)]">
                    Maximum threshold:{" "}
                    {isLoanType || selectedType === "GUARANTEE"
                      ? "Rs. 100 Crore"
                      : "Rs. 200 Crore"}
                  </p>
                </div>

                {/* Service Type Fields */}
                {isServiceType && (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Operating Profit (Rs.)</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 50000000"
                          value={operatingProfit}
                          onChange={(e) => setOperatingProfit(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Operating Cost (Rs.)</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 250000000"
                          value={operatingCost}
                          onChange={(e) => setOperatingCost(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Employee Cost for KPO */}
                    {isKPO && (
                      <div className="space-y-2">
                        <Label>Employee Cost (Rs.)</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 100000000"
                          value={employeeCost}
                          onChange={(e) => setEmployeeCost(e.target.value)}
                        />
                        <p className="text-xs text-[var(--text-muted)]">
                          Required for KPO - determines margin threshold (18%/21%/24%)
                        </p>
                      </div>
                    )}

                    {/* Calculated Margin Display */}
                    {calculateMargin() !== null && (
                      <div className="rounded-lg bg-[var(--bg-secondary)] p-4">
                        <p className="text-sm text-[var(--text-secondary)]">
                          Calculated OP/OC Margin
                        </p>
                        <p className="text-2xl font-bold text-[var(--accent)]">
                          {calculateMargin()?.toFixed(2)}%
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Loan Type Fields */}
                {isLoanType && (
                  <div className="space-y-2">
                    <Label>Credit Rating</Label>
                    <Select value={creditRating} onValueChange={setCreditRating}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select credit rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AAA/AA">AAA / AA</SelectItem>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="BBB">BBB</SelectItem>
                        <SelectItem value="BB">BB</SelectItem>
                        <SelectItem value="B/C/D">B / C / D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button onClick={handleAnalyze} className="w-full">
                  Analyze Eligibility
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Rule Info Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Info className="h-4 w-4 text-[var(--accent)]" />
                  Safe Harbour Thresholds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {rule?.thresholds.map((threshold, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-[var(--bg-secondary)] p-3"
                  >
                    <p className="text-sm text-[var(--text-secondary)]">
                      {threshold.condition}
                    </p>
                    <p className="font-semibold text-[var(--text-primary)]">
                      {typeof threshold.margin === "number"
                        ? `${threshold.margin}% OP/OC`
                        : threshold.margin}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Eligibility Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {rule?.eligibilityConditions.map((condition, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                    >
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
                      {condition}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* SBI Rates Info for Loans */}
            {isLoanType && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Current SBI Rates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">
                      Base Rate
                    </span>
                    <span className="font-medium text-[var(--text-primary)]">
                      {SBI_RATES.baseRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">
                      1Y MCLR
                    </span>
                    <span className="font-medium text-[var(--text-primary)]">
                      {SBI_RATES.mclr1Year}%
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Last updated: {SBI_RATES.lastUpdated}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Result Card */}
          <Card
            className={`border-2 ${
              result.eligible
                ? "border-[var(--success)]/50 bg-[var(--success-bg)]"
                : "border-[var(--error)]/50 bg-[var(--error-bg)]"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`rounded-full p-3 ${
                    result.eligible
                      ? "bg-[var(--success)]/20 text-[var(--success)]"
                      : "bg-[var(--error)]/20 text-[var(--error)]"
                  }`}
                >
                  {result.eligible ? (
                    <CheckCircle className="h-8 w-8" />
                  ) : (
                    <XCircle className="h-8 w-8" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                      {result.eligible ? "Eligible for Safe Harbour" : "Not Eligible"}
                    </h2>
                    <Badge variant={result.eligible ? "success" : "error"}>
                      {result.eligible ? "PASS" : "FAIL"}
                    </Badge>
                  </div>
                  <p className="text-[var(--text-secondary)]">{result.message}</p>

                  {/* Gap Analysis */}
                  {!result.eligible && result.gap && (
                    <div className="mt-4 rounded-lg bg-[var(--bg-card)] p-4">
                      <div className="flex items-center gap-2 text-[var(--warning)]">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">Gap Analysis</span>
                      </div>
                      <p className="mt-2 text-[var(--text-secondary)]">
                        Your margin is{" "}
                        <span className="font-semibold text-[var(--error)]">
                          {result.gap.toFixed(2)}%
                        </span>{" "}
                        below the required threshold of{" "}
                        <span className="font-semibold text-[var(--text-primary)]">
                          {result.requiredMargin}%
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-lg bg-[var(--bg-secondary)] p-3"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-medium text-white">
                      {i + 1}
                    </div>
                    <span className="text-[var(--text-secondary)]">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={resetForm} variant="outline">
              New Analysis
            </Button>
            <Button>
              Generate Form 3CEFA
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
