"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  Filter,
  Calendar,
  User,
  Eye,
  Download,
  Sparkles,
} from "lucide-react";

// Sample search results
const sampleSearchResults = [
  {
    id: "1",
    name: "Transfer Pricing Policy 2025.pdf",
    snippet: "...the arm's length principle shall be applied to all international transactions between associated enterprises...",
    type: "PDF",
    category: "Policy",
    clientName: "TechCorp India Pvt Ltd",
    uploadedBy: "Priya Sharma",
    uploadedAt: "2025-01-28",
    relevanceScore: 95,
    highlights: ["arm's length", "international transactions", "associated enterprises"],
  },
  {
    id: "2",
    name: "Benchmarking Analysis Q3.xlsx",
    snippet: "...comparable companies operating at arm's length were selected based on functional and risk analysis...",
    type: "EXCEL",
    category: "Analysis",
    clientName: "Pharma Solutions Ltd",
    uploadedBy: "Rahul Mehta",
    uploadedAt: "2025-01-25",
    relevanceScore: 88,
    highlights: ["arm's length", "comparable companies", "functional and risk analysis"],
  },
  {
    id: "3",
    name: "Form 3CEB Draft.pdf",
    snippet: "...details of international transactions undertaken during the previous year as per arm's length pricing...",
    type: "PDF",
    category: "Compliance",
    clientName: "Auto Parts Manufacturing",
    uploadedBy: "Amit Kumar",
    uploadedAt: "2025-01-20",
    relevanceScore: 82,
    highlights: ["international transactions", "arm's length pricing"],
  },
];

export default function DocumentSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(sampleSearchResults);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    // Simulate search
    setTimeout(() => {
      setSearchResults(sampleSearchResults);
      setIsSearching(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Document Search</h1>
        <p className="text-[var(--text-secondary)]">
          Full-text search across all your documents
        </p>
      </div>

      {/* Search Box */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                placeholder="Search documents by content, name, or metadata..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-12 py-6 text-lg"
              />
            </div>
            <Button size="lg" onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <>
                  <Search className="mr-2 h-5 w-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* AI Suggestions */}
          <div className="mt-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            <span className="text-sm text-[var(--text-muted)]">Try:</span>
            {["arm's length pricing", "Form 3CEB", "benchmarking analysis", "comparables"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setSearchQuery(suggestion)}
                className="rounded-full bg-[var(--bg-secondary)] px-3 py-1 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-muted)]">
              Found {searchResults.length} results
            </p>
            <Button variant="outline" size="sm">
              <Filter className="mr-1 h-4 w-4" />
              Filters
            </Button>
          </div>

          {searchResults.map((result) => (
            <Card key={result.id} className="hover:border-[var(--border-default)] transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-[var(--bg-secondary)] p-2">
                      <FileText className="h-6 w-6 text-[var(--accent)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[var(--text-primary)]">{result.name}</h3>
                        <Badge variant="secondary">{result.type}</Badge>
                        <Badge variant="info">{result.category}</Badge>
                      </div>

                      {/* Snippet with highlights */}
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        {result.snippet}
                      </p>

                      {/* Highlights */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {result.highlights.map((highlight, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-600"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>

                      {/* Metadata */}
                      <div className="mt-3 flex items-center gap-4 text-sm text-[var(--text-muted)]">
                        <span>{result.clientName}</span>
                        <span className="text-[var(--border-default)]">|</span>
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {result.uploadedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {result.uploadedAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {/* Relevance Score */}
                    <div className="text-right">
                      <p className="text-lg font-semibold text-[var(--accent)]">{result.relevanceScore}%</p>
                      <p className="text-xs text-[var(--text-muted)]">relevance</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
