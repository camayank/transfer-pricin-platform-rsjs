"use client";

import { useState, useRef } from "react";
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
  Upload,
  X,
  File,
  StickyNote,
  Save,
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

interface FieldData {
  text: string;
  notes: string[];
  documents: { name: string; size: string; type: string }[];
}

type FieldDataMap = Record<string, FieldData>;

// Helper to create field key
const getFieldKey = (sectionId: number, fieldIdx: number) => `${sectionId}-${fieldIdx}`;

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

  // Field data state
  const [fieldData, setFieldData] = useState<FieldDataMap>({});
  const [activeNoteField, setActiveNoteField] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Get field data helper
  const getFieldData = (sectionId: number, fieldIdx: number): FieldData => {
    const key = getFieldKey(sectionId, fieldIdx);
    return fieldData[key] || { text: "", notes: [], documents: [] };
  };

  // Update field text
  const handleTextChange = (sectionId: number, fieldIdx: number, value: string) => {
    const key = getFieldKey(sectionId, fieldIdx);
    setFieldData((prev) => ({
      ...prev,
      [key]: {
        ...getFieldData(sectionId, fieldIdx),
        text: value,
      },
    }));
    updateSectionProgress(sectionId);
  };

  // Handle file upload
  const handleFileUpload = (sectionId: number, fieldIdx: number, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const key = getFieldKey(sectionId, fieldIdx);
    const currentData = getFieldData(sectionId, fieldIdx);

    const newDocs = Array.from(files).map((file) => ({
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type || "application/octet-stream",
    }));

    setFieldData((prev) => ({
      ...prev,
      [key]: {
        ...currentData,
        documents: [...currentData.documents, ...newDocs],
      },
    }));
    updateSectionProgress(sectionId);
  };

  // Remove document
  const handleRemoveDocument = (sectionId: number, fieldIdx: number, docIdx: number) => {
    const key = getFieldKey(sectionId, fieldIdx);
    const currentData = getFieldData(sectionId, fieldIdx);

    setFieldData((prev) => ({
      ...prev,
      [key]: {
        ...currentData,
        documents: currentData.documents.filter((_, i) => i !== docIdx),
      },
    }));
    updateSectionProgress(sectionId);
  };

  // Add note
  const handleAddNote = (sectionId: number, fieldIdx: number) => {
    if (!noteText.trim()) return;

    const key = getFieldKey(sectionId, fieldIdx);
    const currentData = getFieldData(sectionId, fieldIdx);

    setFieldData((prev) => ({
      ...prev,
      [key]: {
        ...currentData,
        notes: [...currentData.notes, noteText.trim()],
      },
    }));
    setNoteText("");
    setActiveNoteField(null);
    updateSectionProgress(sectionId);
  };

  // Remove note
  const handleRemoveNote = (sectionId: number, fieldIdx: number, noteIdx: number) => {
    const key = getFieldKey(sectionId, fieldIdx);
    const currentData = getFieldData(sectionId, fieldIdx);

    setFieldData((prev) => ({
      ...prev,
      [key]: {
        ...currentData,
        notes: currentData.notes.filter((_, i) => i !== noteIdx),
      },
    }));
    updateSectionProgress(sectionId);
  };

  // Update section progress based on filled fields
  const updateSectionProgress = (sectionId: number) => {
    const section = MASTER_FILE_SECTIONS.find((s) => s.id === sectionId);
    if (!section) return;

    let completed = 0;
    section.fields.forEach((_, idx) => {
      const data = getFieldData(sectionId, idx);
      if (data.text.trim() || data.notes.length > 0 || data.documents.length > 0) {
        completed++;
      }
    });

    setSectionStatus((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        fieldsCompleted: completed,
        completed: completed === section.fields.length,
      },
    }));
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Trigger file input click
  const triggerFileUpload = (sectionId: number, fieldIdx: number) => {
    const key = getFieldKey(sectionId, fieldIdx);
    fileInputRefs.current[key]?.click();
  };

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
                    {currentSectionData.fields.map((field, idx) => {
                      const data = getFieldData(currentSectionData.id, idx);
                      const fieldKey = getFieldKey(currentSectionData.id, idx);
                      const isNoteActive = activeNoteField === fieldKey;
                      const hasContent = data.text.trim() || data.notes.length > 0 || data.documents.length > 0;

                      return (
                        <div
                          key={idx}
                          className={`rounded-lg border p-4 ${
                            hasContent
                              ? "border-[var(--success)]/30 bg-[var(--success-bg)]"
                              : "border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                              hasContent
                                ? "bg-[var(--success)] text-white"
                                : "bg-[var(--bg-card)] text-[var(--text-muted)]"
                            }`}>
                              {hasContent ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-[var(--text-primary)]">{field}</p>

                              {/* Text Input */}
                              <div className="mt-3">
                                <Input
                                  placeholder="Enter information or attach document..."
                                  value={data.text}
                                  onChange={(e) => handleTextChange(currentSectionData.id, idx, e.target.value)}
                                />
                              </div>

                              {/* Uploaded Documents */}
                              {data.documents.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  <p className="text-xs font-medium text-[var(--text-muted)]">Uploaded Documents:</p>
                                  {data.documents.map((doc, docIdx) => (
                                    <div
                                      key={docIdx}
                                      className="flex items-center gap-2 rounded-md bg-[var(--bg-card)] px-3 py-2"
                                    >
                                      <File className="h-4 w-4 text-[var(--accent)]" />
                                      <span className="flex-1 text-sm text-[var(--text-primary)] truncate">{doc.name}</span>
                                      <span className="text-xs text-[var(--text-muted)]">{doc.size}</span>
                                      <button
                                        onClick={() => handleRemoveDocument(currentSectionData.id, idx, docIdx)}
                                        className="p-1 hover:bg-[var(--error-bg)] rounded text-[var(--text-muted)] hover:text-[var(--error)]"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Notes */}
                              {data.notes.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  <p className="text-xs font-medium text-[var(--text-muted)]">Notes:</p>
                                  {data.notes.map((note, noteIdx) => (
                                    <div
                                      key={noteIdx}
                                      className="flex items-start gap-2 rounded-md bg-[var(--warning-bg)] px-3 py-2"
                                    >
                                      <StickyNote className="h-4 w-4 mt-0.5 text-[var(--warning)]" />
                                      <span className="flex-1 text-sm text-[var(--text-primary)]">{note}</span>
                                      <button
                                        onClick={() => handleRemoveNote(currentSectionData.id, idx, noteIdx)}
                                        className="p-1 hover:bg-[var(--error-bg)] rounded text-[var(--text-muted)] hover:text-[var(--error)]"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Add Note Form */}
                              {isNoteActive && (
                                <div className="mt-3 space-y-2">
                                  <textarea
                                    className="w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                                    placeholder="Enter your note..."
                                    rows={3}
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    autoFocus
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddNote(currentSectionData.id, idx)}
                                      disabled={!noteText.trim()}
                                    >
                                      <Save className="mr-1 h-3 w-3" />
                                      Save Note
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setActiveNoteField(null);
                                        setNoteText("");
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="mt-2 flex gap-2">
                                <input
                                  type="file"
                                  multiple
                                  className="hidden"
                                  ref={(el) => { fileInputRefs.current[fieldKey] = el; }}
                                  onChange={(e) => handleFileUpload(currentSectionData.id, idx, e.target.files)}
                                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => triggerFileUpload(currentSectionData.id, idx)}
                                >
                                  <Upload className="mr-1 h-3 w-3" />
                                  Upload Document
                                </Button>
                                {!isNoteActive && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setActiveNoteField(fieldKey);
                                      setNoteText("");
                                    }}
                                  >
                                    <StickyNote className="mr-1 h-3 w-3" />
                                    Add Note
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
