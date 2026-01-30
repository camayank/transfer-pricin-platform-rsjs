"use client";

import * as React from "react";
import { Search, BookOpen, X, ChevronRight, Tag } from "lucide-react";
import { Input } from "./input";
import {
  TP_GLOSSARY,
  searchGlossary,
  getTermsByCategory,
  type GlossaryTerm,
} from "@/lib/constants/glossary";

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTerm?: string;
}

export function GlossaryModal({ isOpen, onClose, initialTerm }: GlossaryModalProps) {
  const [searchQuery, setSearchQuery] = React.useState(initialTerm || "");
  const [selectedTerm, setSelectedTerm] = React.useState<GlossaryTerm | null>(null);
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  const filteredTerms = searchQuery
    ? searchGlossary(searchQuery)
    : activeCategory
    ? getTermsByCategory(activeCategory as GlossaryTerm["category"])
    : TP_GLOSSARY;

  const categories = [
    { id: "concept", label: "Concepts", color: "var(--accent)" },
    { id: "method", label: "Methods", color: "var(--success)" },
    { id: "form", label: "Forms", color: "var(--info)" },
    { id: "regulation", label: "Regulations", color: "var(--warning)" },
    { id: "calculation", label: "Calculations", color: "var(--error)" },
    { id: "entity", label: "Entities", color: "var(--text-secondary)" },
  ];

  React.useEffect(() => {
    if (initialTerm) {
      const term = TP_GLOSSARY.find(
        (t) =>
          t.term.toLowerCase() === initialTerm.toLowerCase() ||
          t.abbreviation?.toLowerCase() === initialTerm.toLowerCase()
      );
      if (term) setSelectedTerm(term);
    }
  }, [initialTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[80vh] bg-[var(--background)] rounded-xl border border-[var(--border-subtle)] shadow-xl overflow-hidden flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-glow)]">
              <BookOpen className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">
                Transfer Pricing Glossary
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {TP_GLOSSARY.length} terms and definitions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="border-b border-[var(--border-subtle)] px-6 py-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input
              type="search"
              placeholder="Search terms, abbreviations, or definitions..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedTerm(null);
                setActiveCategory(null);
              }}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(activeCategory === cat.id ? null : cat.id);
                  setSearchQuery("");
                  setSelectedTerm(null);
                }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeCategory === cat.id
                    ? "bg-[var(--accent)] text-white"
                    : "border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent)]"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Terms List */}
          <div className="w-1/2 border-r border-[var(--border-subtle)] overflow-y-auto p-4">
            <div className="space-y-2">
              {filteredTerms.map((term) => (
                <button
                  key={term.term}
                  onClick={() => setSelectedTerm(term)}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    selectedTerm?.term === term.term
                      ? "border-[var(--accent)] bg-[var(--accent-glow)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent)]/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-[var(--text-primary)]">
                        {term.term}
                      </span>
                      {term.abbreviation && (
                        <span className="ml-2 rounded bg-[var(--bg-secondary)] px-1.5 py-0.5 text-xs text-[var(--text-muted)]">
                          {term.abbreviation}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-muted)] line-clamp-2">
                    {term.definition}
                  </p>
                </button>
              ))}
              {filteredTerms.length === 0 && (
                <p className="text-center text-sm text-[var(--text-muted)] py-8">
                  No terms found matching &quot;{searchQuery}&quot;
                </p>
              )}
            </div>
          </div>

          {/* Term Details */}
          <div className="w-1/2 overflow-y-auto p-6">
            {selectedTerm ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                      {selectedTerm.term}
                    </h3>
                    {selectedTerm.abbreviation && (
                      <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs font-medium text-white">
                        {selectedTerm.abbreviation}
                      </span>
                    )}
                  </div>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                    style={{
                      backgroundColor:
                        categories.find((c) => c.id === selectedTerm.category)?.color + "20",
                      color: categories.find((c) => c.id === selectedTerm.category)?.color,
                    }}
                  >
                    <Tag className="h-3 w-3" />
                    {categories.find((c) => c.id === selectedTerm.category)?.label}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">
                    Definition
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {selectedTerm.definition}
                  </p>
                </div>

                {selectedTerm.example && (
                  <div>
                    <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">
                      Example
                    </h4>
                    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
                      <p className="text-sm text-[var(--text-secondary)]">
                        {selectedTerm.example}
                      </p>
                    </div>
                  </div>
                )}

                {selectedTerm.relatedTerms && selectedTerm.relatedTerms.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">
                      Related Terms
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTerm.relatedTerms.map((related) => (
                        <button
                          key={related}
                          onClick={() => {
                            const term = TP_GLOSSARY.find(
                              (t) =>
                                t.term === related ||
                                t.abbreviation === related
                            );
                            if (term) setSelectedTerm(term);
                          }}
                          className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                        >
                          {related}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <BookOpen className="h-12 w-12 text-[var(--text-muted)] mb-4" />
                <p className="text-[var(--text-secondary)]">
                  Select a term to view its definition
                </p>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Or search for a specific term above
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline term link that opens glossary
interface GlossaryTermLinkProps {
  term: string;
  children?: React.ReactNode;
}

export function GlossaryTermLink({ term, children }: GlossaryTermLinkProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-[var(--accent)] underline decoration-dotted underline-offset-2 hover:decoration-solid"
      >
        {children || term}
      </button>
      <GlossaryModal isOpen={isOpen} onClose={() => setIsOpen(false)} initialTerm={term} />
    </>
  );
}
