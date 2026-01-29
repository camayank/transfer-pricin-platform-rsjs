"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  FolderOpen,
  Building2,
  Globe,
  FileText,
  DollarSign,
  Users,
  ChevronRight,
  CheckCircle,
  Plus,
  Download,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

// Master File sections as per Rule 10DA
const MASTER_FILE_SECTIONS = [
  {
    id: 1,
    title: "Organizational Structure",
    icon: Building2,
    description: "Group structure, ownership, and management",
    fields: [
      "Legal and ownership structure chart",
      "Geographical locations of operating entities",
      "Description of how group is managed",
      "Nature of business activities",
    ],
  },
  {
    id: 2,
    title: "Business Description",
    icon: Globe,
    description: "Important drivers of business profit",
    fields: [
      "General description of MNE business",
      "Important drivers of business profit",
      "Description of supply chain for top products/services",
      "Geographic markets for products/services",
      "Functional analysis of principal entities",
      "Description of important business restructuring",
    ],
  },
  {
    id: 3,
    title: "Intangibles",
    icon: FileText,
    description: "Strategy for development, ownership and exploitation",
    fields: [
      "Description of MNE strategy for intangibles",
      "List of intangibles important for transfer pricing",
      "List of agreements related to intangibles",
      "Group transfer pricing policies for R&D and intangibles",
      "Description of important transfers of intangibles",
    ],
  },
  {
    id: 4,
    title: "Intercompany Financial Activities",
    icon: DollarSign,
    description: "Treasury functions and financing arrangements",
    fields: [
      "Description of how MNE is financed",
      "Identification of group members providing central financing",
      "General description of transfer pricing policies for financing",
      "Description of principal agreements with unrelated lenders",
      "Country of incorporation of central financing entities",
    ],
  },
  {
    id: 5,
    title: "Financial & Tax Positions",
    icon: Users,
    description: "Consolidated financial statements and APAs/rulings",
    fields: [
      "Annual consolidated financial statement",
      "List and brief description of existing unilateral APAs",
      "List and brief description of rulings regarding allocation",
    ],
  },
];

interface SectionStatus {
  completed: boolean;
  fieldsCompleted: number;
  totalFields: number;
}

export default function MasterFilePage() {
  const [currentSection, setCurrentSection] = useState(1);
  const [sectionStatus, setSectionStatus] = useState<Record<number, SectionStatus>>(
    MASTER_FILE_SECTIONS.reduce((acc, section) => ({
      ...acc,
      [section.id]: {
        completed: false,
        fieldsCompleted: 0,
        totalFields: section.fields.length,
      },
    }), {})
  );

  const totalFieldsCompleted = Object.values(sectionStatus).reduce(
    (sum, s) => sum + s.fieldsCompleted,
    0
  );
  const totalFields = Object.values(sectionStatus).reduce(
    (sum, s) => sum + s.totalFields,
    0
  );
  const overallProgress = (totalFieldsCompleted / totalFields) * 100;

  const currentSectionData = MASTER_FILE_SECTIONS.find((s) => s.id === currentSection);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Master File Generator (Form 3CEAA)
        </h1>
        <p className="text-[var(--text-secondary)]">
          OECD BEPS-compliant Master File as per Rule 10DA
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-[var(--text-primary)]">
                Master File Progress
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                {totalFieldsCompleted} of {totalFields} fields completed
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[var(--accent)]">
                {overallProgress.toFixed(0)}%
              </p>
            </div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
            <div
              className="h-full bg-[var(--accent)] transition-all"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Section Navigation */}
        <div className="space-y-2">
          {MASTER_FILE_SECTIONS.map((section) => {
            const status = sectionStatus[section.id];
            const isActive = currentSection === section.id;
            const progress = (status.fieldsCompleted / status.totalFields) * 100;

            return (
              <button
                key={section.id}
                onClick={() => setCurrentSection(section.id)}
                className={`w-full rounded-lg p-4 text-left transition-all ${
                  isActive
                    ? "bg-[var(--accent-glow)] border border-[var(--accent)]/50"
                    : "bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-default)]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`rounded-lg p-2 ${
                      isActive
                        ? "bg-[var(--accent)] text-white"
                        : status.completed
                        ? "bg-[var(--success-bg)] text-[var(--success)]"
                        : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                    }`}
                  >
                    <section.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className={`font-medium ${
                          isActive ? "text-[var(--accent)]" : "text-[var(--text-primary)]"
                        }`}
                      >
                        Part {section.id}
                      </p>
                      {status.completed && (
                        <CheckCircle className="h-4 w-4 text-[var(--success)]" />
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-muted)] truncate">
                      {section.title}
                    </p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
                      <div
                        className={`h-full ${
                          status.completed ? "bg-[var(--success)]" : "bg-[var(--accent)]"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Section Content */}
        <div className="lg:col-span-3">
          {currentSectionData && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[var(--accent-glow)] p-2 text-[var(--accent)]">
                    <currentSectionData.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>
                      Part {currentSectionData.id}: {currentSectionData.title}
                    </CardTitle>
                    <p className="text-sm text-[var(--text-muted)]">
                      {currentSectionData.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Required Fields */}
                <div>
                  <h4 className="mb-4 font-medium text-[var(--text-primary)]">
                    Required Information
                  </h4>
                  <div className="space-y-4">
                    {currentSectionData.fields.map((field, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--bg-card)] text-xs font-medium text-[var(--text-muted)]">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-[var(--text-primary)]">{field}</p>
                            <div className="mt-3">
                              <Input placeholder="Enter information or attach document..." />
                            </div>
                            <div className="mt-2 flex gap-2">
                              <Button variant="outline" size="sm">
                                <Plus className="mr-1 h-3 w-3" />
                                Upload Document
                              </Button>
                              <Button variant="ghost" size="sm">
                                Add Note
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guidance */}
                <div className="rounded-lg border border-[var(--info)]/30 bg-[var(--info-bg)] p-4">
                  <h4 className="mb-2 font-medium text-[var(--info)]">OECD Guidelines</h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {currentSectionData.id === 1 &&
                      "The organizational structure should include a chart showing the MNE group's legal and ownership structure, and geographical location of operating entities."}
                    {currentSectionData.id === 2 &&
                      "Include general description of the MNE group's business, important drivers of profit, and a description of supply chain for the group's five largest products/services."}
                    {currentSectionData.id === 3 &&
                      "Describe the MNE group's overall strategy for development, ownership and exploitation of intangibles, including location of principal R&D facilities."}
                    {currentSectionData.id === 4 &&
                      "Include a general description of how the group is financed, including important financing arrangements with unrelated lenders."}
                    {currentSectionData.id === 5 &&
                      "Include the MNE group's annual consolidated financial statement and a list of existing unilateral APAs and other tax rulings."}
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentSection(Math.max(1, currentSection - 1))}
                    disabled={currentSection === 1}
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setSectionStatus({
                          ...sectionStatus,
                          [currentSection]: {
                            ...sectionStatus[currentSection],
                            completed: true,
                            fieldsCompleted: sectionStatus[currentSection].totalFields,
                          },
                        })
                      }
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Mark Complete
                    </Button>
                    {currentSection < 5 ? (
                      <Button onClick={() => setCurrentSection(currentSection + 1)}>
                        Next Section
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button>
                        <Download className="mr-1 h-4 w-4" />
                        Generate Master File
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Applicability Criteria */}
      <Card>
        <CardHeader>
          <CardTitle>Master File Applicability (Rule 10DA)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-[var(--bg-secondary)] p-4">
              <h4 className="font-medium text-[var(--text-primary)]">Consolidated Revenue</h4>
              <p className="mt-1 text-2xl font-semibold text-[var(--accent)]">&gt; Rs. 500 Cr</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Of the international group in preceding year
              </p>
            </div>
            <div className="rounded-lg bg-[var(--bg-secondary)] p-4">
              <h4 className="font-medium text-[var(--text-primary)]">International Transactions</h4>
              <p className="mt-1 text-2xl font-semibold text-[var(--accent)]">&gt; Rs. 50 Cr</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Aggregate value in the year
              </p>
            </div>
            <div className="rounded-lg bg-[var(--bg-secondary)] p-4">
              <h4 className="font-medium text-[var(--text-primary)]">OR Intangible Transactions</h4>
              <p className="mt-1 text-2xl font-semibold text-[var(--accent)]">&gt; Rs. 10 Cr</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Aggregate value in the year
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Master File (Form 3CEAA) is due by November 30 following the end of the relevant
            financial year. Penalty for non-compliance: Rs. 5,00,000.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
