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
  BarChart3,
  Calculator,
  TrendingUp,
  Database,
  CheckCircle,
  XCircle,
  Info,
  Download,
  RefreshCw,
} from "lucide-react";

// PLI Types
const PLI_TYPES = {
  OP_OC: { code: "OP/OC", name: "Operating Profit / Operating Cost", description: "Most common for service providers" },
  OP_OR: { code: "OP/OR", name: "Operating Profit / Operating Revenue", description: "Net margin method" },
  OP_TA: { code: "OP/TA", name: "Operating Profit / Total Assets", description: "Asset-intensive businesses" },
  BERRY: { code: "Berry", name: "Gross Profit / Operating Expenses", description: "Distribution activities" },
};

// Sample comparable data
const sampleComparables = [
  { id: 1, name: "InfoTech Solutions Ltd", nicCode: "6201", revenue: 1250, opOc: 18.5, opOr: 15.6, included: true },
  { id: 2, name: "Digital Services Pvt Ltd", nicCode: "6201", revenue: 890, opOc: 22.3, opOr: 18.2, included: true },
  { id: 3, name: "Tech Consulting India", nicCode: "6202", revenue: 560, opOc: 16.8, opOr: 14.4, included: true },
  { id: 4, name: "Software Labs Ltd", nicCode: "6201", revenue: 2100, opOc: 19.7, opOr: 16.5, included: true },
  { id: 5, name: "Code Masters Pvt Ltd", nicCode: "6201", revenue: 780, opOc: 21.1, opOr: 17.4, included: true },
  { id: 6, name: "IT Enablers Ltd", nicCode: "6209", revenue: 420, opOc: 14.2, opOr: 12.4, included: false, reason: "Persistent losses" },
  { id: 7, name: "Cloud Solutions India", nicCode: "6201", revenue: 1680, opOc: 20.4, opOr: 17.0, included: true },
  { id: 8, name: "Data Analytics Corp", nicCode: "6311", revenue: 340, opOc: 25.8, opOr: 20.5, included: false, reason: "Different functional profile" },
];

interface BenchmarkResult {
  comparables: typeof sampleComparables;
  statistics: {
    count: number;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    mean: number;
  };
  testedPartyMargin: number;
  isWithinRange: boolean;
  adjustment?: number;
}

function calculateStatistics(values: number[]): BenchmarkResult["statistics"] {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  const q1Index = Math.floor(n * 0.25);
  const medianIndex = Math.floor(n * 0.5);
  const q3Index = Math.floor(n * 0.75);

  return {
    count: n,
    min: sorted[0],
    q1: sorted[q1Index],
    median: sorted[medianIndex],
    q3: sorted[q3Index],
    max: sorted[n - 1],
    mean: values.reduce((a, b) => a + b, 0) / n,
  };
}

export default function BenchmarkingPage() {
  const [pliType, setPliType] = useState<string>("OP_OC");
  const [testedPartyMargin, setTestedPartyMargin] = useState<string>("");
  const [comparables, setComparables] = useState(sampleComparables);
  const [result, setResult] = useState<BenchmarkResult | null>(null);

  const runBenchmarking = () => {
    const includedComparables = comparables.filter((c) => c.included);
    const margins = includedComparables.map((c) =>
      pliType === "OP_OC" ? c.opOc : c.opOr
    );

    const stats = calculateStatistics(margins);
    const margin = parseFloat(testedPartyMargin);
    const isWithinRange = margin >= stats.q1 && margin <= stats.q3;

    setResult({
      comparables: includedComparables,
      statistics: stats,
      testedPartyMargin: margin,
      isWithinRange,
      adjustment: isWithinRange ? 0 : (stats.median - margin),
    });
  };

  const toggleComparable = (id: number) => {
    setComparables(
      comparables.map((c) =>
        c.id === id ? { ...c, included: !c.included } : c
      )
    );
  };

  const includedCount = comparables.filter((c) => c.included).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Benchmarking Analysis
        </h1>
        <p className="text-[var(--text-secondary)]">
          TNMM analysis with Indian comparable database
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calculator className="h-4 w-4 text-[var(--accent)]" />
                Analysis Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Profit Level Indicator (PLI)</Label>
                <Select value={pliType} onValueChange={setPliType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PLI_TYPES).map(([key, pli]) => (
                      <SelectItem key={key} value={key}>
                        {pli.code} - {pli.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-[var(--text-muted)]">
                  {PLI_TYPES[pliType as keyof typeof PLI_TYPES].description}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Tested Party Margin (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={testedPartyMargin}
                  onChange={(e) => setTestedPartyMargin(e.target.value)}
                  placeholder="e.g., 17.5"
                />
              </div>

              <Button onClick={runBenchmarking} className="w-full" disabled={!testedPartyMargin}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Run Benchmarking
              </Button>
            </CardContent>
          </Card>

          {/* Comparable Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4 text-[var(--accent)]" />
                Comparable Set
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-[var(--bg-secondary)] p-3 text-center">
                  <p className="text-2xl font-semibold text-[var(--accent)]">
                    {includedCount}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">Included</p>
                </div>
                <div className="rounded-lg bg-[var(--bg-secondary)] p-3 text-center">
                  <p className="text-2xl font-semibold text-[var(--text-secondary)]">
                    {comparables.length - includedCount}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparables List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Comparable Companies</CardTitle>
                <Button variant="outline" size="sm">
                  <RefreshCw className="mr-1 h-4 w-4" />
                  Refresh Data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <th className="py-3 text-left font-medium text-[var(--text-muted)]">
                        Include
                      </th>
                      <th className="py-3 text-left font-medium text-[var(--text-muted)]">
                        Company
                      </th>
                      <th className="py-3 text-left font-medium text-[var(--text-muted)]">
                        NIC
                      </th>
                      <th className="py-3 text-right font-medium text-[var(--text-muted)]">
                        Revenue (Cr)
                      </th>
                      <th className="py-3 text-right font-medium text-[var(--text-muted)]">
                        OP/OC %
                      </th>
                      <th className="py-3 text-right font-medium text-[var(--text-muted)]">
                        OP/OR %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparables.map((comp) => (
                      <tr
                        key={comp.id}
                        className={`border-b border-[var(--border-subtle)] ${
                          !comp.included ? "opacity-50" : ""
                        }`}
                      >
                        <td className="py-3">
                          <button
                            onClick={() => toggleComparable(comp.id)}
                            className={`flex h-6 w-6 items-center justify-center rounded ${
                              comp.included
                                ? "bg-[var(--success)] text-white"
                                : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                            }`}
                          >
                            {comp.included ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                        <td className="py-3">
                          <p className="font-medium text-[var(--text-primary)]">
                            {comp.name}
                          </p>
                          {comp.reason && (
                            <p className="text-xs text-[var(--error)]">{comp.reason}</p>
                          )}
                        </td>
                        <td className="py-3 text-[var(--text-secondary)]">
                          {comp.nicCode}
                        </td>
                        <td className="py-3 text-right text-[var(--text-primary)]">
                          {comp.revenue}
                        </td>
                        <td className="py-3 text-right font-medium text-[var(--accent)]">
                          {comp.opOc.toFixed(1)}%
                        </td>
                        <td className="py-3 text-right text-[var(--text-secondary)]">
                          {comp.opOr.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Result Summary */}
          <Card
            className={`border-2 ${
              result.isWithinRange
                ? "border-[var(--success)]/50 bg-[var(--success-bg)]"
                : "border-[var(--warning)]/50 bg-[var(--warning-bg)]"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`rounded-full p-3 ${
                    result.isWithinRange
                      ? "bg-[var(--success)]/20 text-[var(--success)]"
                      : "bg-[var(--warning)]/20 text-[var(--warning)]"
                  }`}
                >
                  {result.isWithinRange ? (
                    <CheckCircle className="h-8 w-8" />
                  ) : (
                    <TrendingUp className="h-8 w-8" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                      {result.isWithinRange
                        ? "Within Arm's Length Range"
                        : "Adjustment May Be Required"}
                    </h2>
                    <Badge variant={result.isWithinRange ? "success" : "warning"}>
                      {result.isWithinRange ? "PASS" : "REVIEW"}
                    </Badge>
                  </div>
                  <p className="text-[var(--text-secondary)]">
                    Tested party margin of {result.testedPartyMargin.toFixed(1)}% is{" "}
                    {result.isWithinRange
                      ? `within the interquartile range (${result.statistics.q1.toFixed(1)}% - ${result.statistics.q3.toFixed(1)}%)`
                      : `outside the interquartile range. Median adjustment: ${result.adjustment?.toFixed(1)}%`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistical Range */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[var(--accent)]" />
                Arm's Length Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Range Bar Visualization */}
              <div className="mb-6">
                <div className="relative h-12 rounded-lg bg-[var(--bg-secondary)]">
                  {/* Full range */}
                  <div
                    className="absolute top-0 h-full bg-[var(--border-default)] rounded-lg"
                    style={{
                      left: `${((result.statistics.min - result.statistics.min) / (result.statistics.max - result.statistics.min)) * 100}%`,
                      width: "100%",
                    }}
                  />
                  {/* IQR range */}
                  <div
                    className="absolute top-0 h-full bg-[var(--accent)]/30 rounded"
                    style={{
                      left: `${((result.statistics.q1 - result.statistics.min) / (result.statistics.max - result.statistics.min)) * 100}%`,
                      width: `${((result.statistics.q3 - result.statistics.q1) / (result.statistics.max - result.statistics.min)) * 100}%`,
                    }}
                  />
                  {/* Median line */}
                  <div
                    className="absolute top-0 h-full w-1 bg-[var(--accent)]"
                    style={{
                      left: `${((result.statistics.median - result.statistics.min) / (result.statistics.max - result.statistics.min)) * 100}%`,
                    }}
                  />
                  {/* Tested party marker */}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border-2 border-white ${
                      result.isWithinRange ? "bg-[var(--success)]" : "bg-[var(--warning)]"
                    }`}
                    style={{
                      left: `${Math.max(0, Math.min(100, ((result.testedPartyMargin - result.statistics.min) / (result.statistics.max - result.statistics.min)) * 100))}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </div>
                {/* Labels */}
                <div className="mt-2 flex justify-between text-xs text-[var(--text-muted)]">
                  <span>{result.statistics.min.toFixed(1)}%</span>
                  <span>Q1: {result.statistics.q1.toFixed(1)}%</span>
                  <span className="font-medium text-[var(--accent)]">
                    Median: {result.statistics.median.toFixed(1)}%
                  </span>
                  <span>Q3: {result.statistics.q3.toFixed(1)}%</span>
                  <span>{result.statistics.max.toFixed(1)}%</span>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-[var(--bg-secondary)] p-4 text-center">
                  <p className="text-sm text-[var(--text-muted)]">Comparables</p>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {result.statistics.count}
                  </p>
                </div>
                <div className="rounded-lg bg-[var(--bg-secondary)] p-4 text-center">
                  <p className="text-sm text-[var(--text-muted)]">Mean</p>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {result.statistics.mean.toFixed(1)}%
                  </p>
                </div>
                <div className="rounded-lg bg-[var(--accent-glow)] p-4 text-center">
                  <p className="text-sm text-[var(--text-muted)]">Median</p>
                  <p className="text-2xl font-semibold text-[var(--accent)]">
                    {result.statistics.median.toFixed(1)}%
                  </p>
                </div>
                <div className="rounded-lg bg-[var(--bg-secondary)] p-4 text-center">
                  <p className="text-sm text-[var(--text-muted)]">IQR</p>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {result.statistics.q1.toFixed(1)}% - {result.statistics.q3.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button>
              Save to Engagement
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
