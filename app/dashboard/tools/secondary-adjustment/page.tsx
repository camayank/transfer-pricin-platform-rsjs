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
  Calculator,
  AlertTriangle,
  CheckCircle,
  Clock,
  IndianRupee,
  Calendar,
  FileText,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Download,
  Info,
} from "lucide-react";

interface SecondaryAdjustmentResult {
  applicable: boolean;
  primaryAdjustment: number;
  repatriationDeadline: string;
  daysRemaining: number;
  options: {
    option: string;
    description: string;
    consequences: string[];
    recommended: boolean;
  }[];
  deemedDividend?: {
    applicable: boolean;
    amount: number;
    taxRate: number;
    taxLiability: number;
  };
  deemedLoan?: {
    applicable: boolean;
    principal: number;
    interestRate: number;
    interestPerYear: number;
    accruedInterest: number;
  };
  timeline: {
    event: string;
    date: string;
    status: "completed" | "pending" | "overdue";
  }[];
}

export default function SecondaryAdjustmentPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SecondaryAdjustmentResult | null>(null);

  const [formData, setFormData] = useState({
    primaryAdjustment: "",
    adjustmentDate: "",
    taxpayerType: "domestic_company",
    hasRepatriated: "no",
    repatriationAmount: "",
    repatriationDate: "",
    financialYear: "2024-25",
  });

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/secondary-adjustment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "calculate",
          primaryAdjustment: parseFloat(formData.primaryAdjustment) || 0,
          adjustmentDate: formData.adjustmentDate,
          taxpayerType: formData.taxpayerType,
          hasRepatriated: formData.hasRepatriated === "yes",
          repatriationAmount: parseFloat(formData.repatriationAmount) || 0,
          repatriationDate: formData.repatriationDate,
          assessmentYear: formData.financialYear,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.result);
      }
    } catch (error) {
      console.error("Error calculating secondary adjustment:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Secondary Adjustment Tracker
          </h1>
          <p className="text-[var(--text-secondary)]">
            Section 92CE - Repatriation & Deemed Dividend/Loan Analysis
          </p>
        </div>
        <Badge variant="info" className="flex items-center gap-1">
          <Info className="h-3 w-3" />
          Effective from AY 2018-19
        </Badge>
      </div>

      {/* Info Banner */}
      <Card className="border-[var(--info)]/30 bg-[var(--info-bg)]">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[var(--info)] mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-[var(--info)]">Section 92CE Requirements</p>
              <ul className="mt-1 space-y-1 text-[var(--text-secondary)]">
                <li>• Applicable when primary adjustment exceeds ₹1 Crore</li>
                <li>• Excess money must be repatriated within 90 days of TPO order</li>
                <li>• Non-repatriation triggers deemed dividend (Sec 2(22)(e)) or deemed loan with interest</li>
                <li>• Interest rate: SBI base rate + 1% (currently ~9.25% p.a.)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Adjustment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primaryAdjustment">Primary Adjustment (₹)</Label>
                <Input
                  id="primaryAdjustment"
                  type="number"
                  placeholder="e.g., 50000000"
                  value={formData.primaryAdjustment}
                  onChange={(e) =>
                    setFormData({ ...formData, primaryAdjustment: e.target.value })
                  }
                />
                <p className="text-xs text-[var(--text-muted)]">
                  TP adjustment amount from TPO order
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adjustmentDate">TPO Order Date</Label>
                <Input
                  id="adjustmentDate"
                  type="date"
                  value={formData.adjustmentDate}
                  onChange={(e) =>
                    setFormData({ ...formData, adjustmentDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="taxpayerType">Taxpayer Type</Label>
                <Select
                  value={formData.taxpayerType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, taxpayerType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="domestic_company">Domestic Company</SelectItem>
                    <SelectItem value="foreign_company">Foreign Company</SelectItem>
                    <SelectItem value="resident_non_corporate">Resident Non-Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="financialYear">Assessment Year</Label>
                <Select
                  value={formData.financialYear}
                  onValueChange={(value) =>
                    setFormData({ ...formData, financialYear: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-25">AY 2024-25</SelectItem>
                    <SelectItem value="2023-24">AY 2023-24</SelectItem>
                    <SelectItem value="2022-23">AY 2022-23</SelectItem>
                    <SelectItem value="2021-22">AY 2021-22</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Has Repatriation Occurred?</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasRepatriated"
                    value="no"
                    checked={formData.hasRepatriated === "no"}
                    onChange={(e) =>
                      setFormData({ ...formData, hasRepatriated: e.target.value })
                    }
                    className="text-[var(--accent)]"
                  />
                  <span className="text-sm">No</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasRepatriated"
                    value="partial"
                    checked={formData.hasRepatriated === "partial"}
                    onChange={(e) =>
                      setFormData({ ...formData, hasRepatriated: e.target.value })
                    }
                    className="text-[var(--accent)]"
                  />
                  <span className="text-sm">Partial</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasRepatriated"
                    value="yes"
                    checked={formData.hasRepatriated === "yes"}
                    onChange={(e) =>
                      setFormData({ ...formData, hasRepatriated: e.target.value })
                    }
                    className="text-[var(--accent)]"
                  />
                  <span className="text-sm">Yes (Full)</span>
                </label>
              </div>
            </div>

            {(formData.hasRepatriated === "yes" || formData.hasRepatriated === "partial") && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="repatriationAmount">Repatriation Amount (₹)</Label>
                  <Input
                    id="repatriationAmount"
                    type="number"
                    placeholder="Amount repatriated"
                    value={formData.repatriationAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, repatriationAmount: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repatriationDate">Repatriation Date</Label>
                  <Input
                    id="repatriationDate"
                    type="date"
                    value={formData.repatriationDate}
                    onChange={(e) =>
                      setFormData({ ...formData, repatriationDate: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleCalculate}
              disabled={loading || !formData.primaryAdjustment || !formData.adjustmentDate}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculate Secondary Adjustment
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Section 92CE Quick Reference
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-secondary)]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]/10">
                  <span className="text-sm font-bold text-[var(--accent)]">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Threshold</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Primary adjustment must exceed ₹1 Crore
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-secondary)]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]/10">
                  <span className="text-sm font-bold text-[var(--accent)]">2</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Repatriation Period</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    90 days from TPO order date to repatriate excess money
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-secondary)]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--warning)]/10">
                  <span className="text-sm font-bold text-[var(--warning)]">3</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Deemed Dividend</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Unrepatriated amount taxed as dividend under Section 2(22)(e)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-secondary)]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--error)]/10">
                  <span className="text-sm font-bold text-[var(--error)]">4</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Deemed Loan Interest</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    SBI base rate + 1% (currently ~9.25%) on unrepatriated amount
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-[var(--border-subtle)]">
              <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">
                Key Dates Reference
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Effective Date:</span>
                  <span className="font-medium">1st April 2017</span>
                </div>
                <div className="flex justify-between">
                  <span>Current SBI Base Rate:</span>
                  <span className="font-medium">8.25%</span>
                </div>
                <div className="flex justify-between">
                  <span>Applicable Interest:</span>
                  <span className="font-medium">9.25% p.a.</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                    <IndianRupee className="h-5 w-5 text-[var(--accent)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">Primary Adjustment</p>
                    <p className="text-lg font-bold">{formatCurrency(result.primaryAdjustment)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--warning)]/10">
                    <Calendar className="h-5 w-5 text-[var(--warning)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">Repatriation Deadline</p>
                    <p className="text-lg font-bold">{result.repatriationDeadline}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    result.daysRemaining > 30 ? "bg-[var(--success)]/10" :
                    result.daysRemaining > 0 ? "bg-[var(--warning)]/10" : "bg-[var(--error)]/10"
                  }`}>
                    <Clock className={`h-5 w-5 ${
                      result.daysRemaining > 30 ? "text-[var(--success)]" :
                      result.daysRemaining > 0 ? "text-[var(--warning)]" : "text-[var(--error)]"
                    }`} />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">Days Remaining</p>
                    <p className="text-lg font-bold">
                      {result.daysRemaining > 0 ? result.daysRemaining : "Overdue"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    result.applicable ? "bg-[var(--error)]/10" : "bg-[var(--success)]/10"
                  }`}>
                    {result.applicable ? (
                      <AlertTriangle className="h-5 w-5 text-[var(--error)]" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-[var(--success)]" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">Status</p>
                    <p className="text-lg font-bold">
                      {result.applicable ? "Action Required" : "Compliant"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deemed Dividend & Loan Analysis */}
          <div className="grid gap-6 lg:grid-cols-2">
            {result.deemedDividend && result.deemedDividend.applicable && (
              <Card className="border-[var(--warning)]/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[var(--warning)]">
                    <AlertTriangle className="h-5 w-5" />
                    Deemed Dividend (Sec 2(22)(e))
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-[var(--bg-secondary)]">
                      <p className="text-xs text-[var(--text-secondary)]">Deemed Dividend Amount</p>
                      <p className="text-xl font-bold">{formatCurrency(result.deemedDividend.amount)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--bg-secondary)]">
                      <p className="text-xs text-[var(--text-secondary)]">Tax Rate</p>
                      <p className="text-xl font-bold">{result.deemedDividend.taxRate}%</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-[var(--error-bg)] border border-[var(--error)]/30">
                    <p className="text-sm text-[var(--text-secondary)]">Tax Liability</p>
                    <p className="text-2xl font-bold text-[var(--error)]">
                      {formatCurrency(result.deemedDividend.taxLiability)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {result.deemedLoan && result.deemedLoan.applicable && (
              <Card className="border-[var(--error)]/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[var(--error)]">
                    <TrendingUp className="h-5 w-5" />
                    Deemed Loan Interest
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-[var(--bg-secondary)]">
                      <p className="text-xs text-[var(--text-secondary)]">Principal (Unrepatriated)</p>
                      <p className="text-xl font-bold">{formatCurrency(result.deemedLoan.principal)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--bg-secondary)]">
                      <p className="text-xs text-[var(--text-secondary)]">Interest Rate</p>
                      <p className="text-xl font-bold">{result.deemedLoan.interestRate}%</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-[var(--bg-secondary)]">
                      <p className="text-xs text-[var(--text-secondary)]">Interest Per Year</p>
                      <p className="text-lg font-bold">{formatCurrency(result.deemedLoan.interestPerYear)}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-[var(--error-bg)] border border-[var(--error)]/30">
                      <p className="text-xs text-[var(--text-secondary)]">Accrued Interest</p>
                      <p className="text-lg font-bold text-[var(--error)]">
                        {formatCurrency(result.deemedLoan.accruedInterest)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Options & Timeline */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Available Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5" />
                  Available Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      option.recommended
                        ? "border-[var(--success)] bg-[var(--success-bg)]"
                        : "border-[var(--border-subtle)]"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">{option.option}</p>
                      {option.recommended && (
                        <Badge variant="success">Recommended</Badge>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mb-2">
                      {option.description}
                    </p>
                    <div className="space-y-1">
                      {option.consequences.map((consequence, i) => (
                        <p key={i} className="text-xs text-[var(--text-muted)]">
                          • {consequence}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Compliance Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.timeline.map((event, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        event.status === "completed" ? "bg-[var(--success)]/10" :
                        event.status === "overdue" ? "bg-[var(--error)]/10" : "bg-[var(--warning)]/10"
                      }`}>
                        {event.status === "completed" ? (
                          <CheckCircle className="h-4 w-4 text-[var(--success)]" />
                        ) : event.status === "overdue" ? (
                          <AlertTriangle className="h-4 w-4 text-[var(--error)]" />
                        ) : (
                          <Clock className="h-4 w-4 text-[var(--warning)]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.event}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{event.date}</p>
                      </div>
                      <Badge
                        variant={
                          event.status === "completed" ? "success" :
                          event.status === "overdue" ? "error" : "warning"
                        }
                      >
                        {event.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button variant="outline" className="flex-1">
              <FileText className="mr-2 h-4 w-4" />
              Generate Documentation
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
