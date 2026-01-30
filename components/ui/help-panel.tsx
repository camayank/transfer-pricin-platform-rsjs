"use client";

import * as React from "react";
import { X, HelpCircle, Lightbulb, BookOpen, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./button";

export interface HelpContent {
  title: string;
  description: string;
  steps?: {
    title: string;
    description: string;
  }[];
  tips?: string[];
  glossaryTerms?: string[];
  links?: {
    text: string;
    href: string;
  }[];
}

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
  content: HelpContent;
}

export function HelpPanel({ isOpen, onClose, content }: HelpPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="relative h-full w-full max-w-md bg-[var(--background)] shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--background)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-glow)]">
              <HelpCircle className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <h2 className="font-semibold text-[var(--text-primary)]">
              {content.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <p className="text-[var(--text-secondary)]">{content.description}</p>

          {/* Steps */}
          {content.steps && content.steps.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 font-medium text-[var(--text-primary)] mb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-xs text-white">
                  1
                </span>
                How to Use
              </h3>
              <div className="space-y-3">
                {content.steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-glow)] text-xs font-medium text-[var(--accent)]">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {step.title}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {content.tips && content.tips.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 font-medium text-[var(--text-primary)] mb-3">
                <Lightbulb className="h-5 w-5 text-[var(--warning)]" />
                Pro Tips
              </h3>
              <ul className="space-y-2">
                {content.tips.map((tip, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--warning)]" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Glossary Terms */}
          {content.glossaryTerms && content.glossaryTerms.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 font-medium text-[var(--text-primary)] mb-3">
                <BookOpen className="h-5 w-5 text-[var(--info)]" />
                Key Terms
              </h3>
              <div className="flex flex-wrap gap-2">
                {content.glossaryTerms.map((term) => (
                  <span
                    key={term}
                    className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1 text-sm text-[var(--text-secondary)]"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Links */}
          {content.links && content.links.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 font-medium text-[var(--text-primary)] mb-3">
                <ExternalLink className="h-5 w-5 text-[var(--accent)]" />
                Related Resources
              </h3>
              <div className="space-y-2">
                {content.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 text-sm text-[var(--accent)] hover:border-[var(--accent)]/50"
                  >
                    {link.text}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline help component for expandable sections
interface InlineHelpProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function InlineHelp({ title, children, defaultOpen = false }: InlineHelpProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-[var(--accent)]" />
          <span className="font-medium text-[var(--text-primary)]">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-[var(--text-muted)]" />
        ) : (
          <ChevronDown className="h-5 w-5 text-[var(--text-muted)]" />
        )}
      </button>
      {isOpen && (
        <div className="border-t border-[var(--border-subtle)] p-4">
          {children}
        </div>
      )}
    </div>
  );
}
