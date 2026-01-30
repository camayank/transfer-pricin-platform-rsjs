"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  BookOpen,
  Scale,
  FileText,
  ExternalLink,
  Star,
  Calendar,
  Building2,
  Tag,
  Filter,
  ChevronRight,
  Globe,
  Gavel,
  Download,
  Bookmark,
  Clock,
} from "lucide-react";

// Sample Case Law Data
const caseLawData = [
  {
    id: "1",
    name: "Capgemini India Pvt Ltd vs DCIT",
    citation: "[2023] 156 taxmann.com 225 (Delhi Trib.)",
    court: "ITAT Delhi",
    date: "2023-08-15",
    topics: ["AMP Expenses", "Bright Line Test", "Brand Building"],
    summary: "Tribunal held that AMP expenses incurred for building brand of foreign AE cannot be treated as international transaction unless there is an explicit arrangement.",
    verdict: "In favor of Assessee",
    relevance: 95,
    bookmarked: true,
  },
  {
    id: "2",
    name: "Sony India Pvt Ltd vs DCIT",
    citation: "[2023] 155 taxmann.com 412 (Mum Trib.)",
    court: "ITAT Mumbai",
    date: "2023-07-20",
    topics: ["Comparable Selection", "RPT Filter", "Functional Analysis"],
    summary: "Tribunal emphasized importance of proper functional analysis and directed exclusion of companies with significant RPT from comparables set.",
    verdict: "Partial Relief",
    relevance: 88,
    bookmarked: false,
  },
  {
    id: "3",
    name: "GE India Technology Centre vs CIT",
    citation: "[2022] 141 taxmann.com 358 (SC)",
    court: "Supreme Court",
    date: "2022-11-28",
    topics: ["Software Services", "Cost Plus Method", "Development Services"],
    summary: "Supreme Court upheld that software development services can be benchmarked using Cost Plus Method with appropriate markup.",
    verdict: "In favor of Revenue",
    relevance: 92,
    bookmarked: true,
  },
  {
    id: "4",
    name: "Maruti Suzuki India Ltd vs CIT",
    citation: "[2023] 154 taxmann.com 289 (Delhi HC)",
    court: "Delhi High Court",
    date: "2023-05-10",
    topics: ["Royalty Payment", "ALP Determination", "TNMM"],
    summary: "High Court confirmed that royalty payments for use of technology and trademark should be aggregated and benchmarked together.",
    verdict: "In favor of Assessee",
    relevance: 85,
    bookmarked: false,
  },
  {
    id: "5",
    name: "Hyundai Motor India vs ACIT",
    citation: "[2023] 153 taxmann.com 156 (Chennai Trib.)",
    court: "ITAT Chennai",
    date: "2023-04-22",
    topics: ["Inter-company Guarantee", "Corporate Guarantee Fee", "Safe Harbour"],
    summary: "Tribunal held that corporate guarantee fee should be benchmarked at arm's length considering the benefit derived by the Indian entity.",
    verdict: "In favor of Assessee",
    relevance: 90,
    bookmarked: true,
  },
];

// Sample OECD Guidelines Data
const oecdGuidelines = [
  {
    id: "1",
    chapter: "Chapter I",
    title: "The Arm's Length Principle",
    sections: ["Paras 1.1-1.14: Introduction", "Paras 1.33-1.76: Comparability Analysis", "Paras 1.77-1.122: Losses & Government Policies"],
    lastUpdated: "2022-01-20",
    relevantFor: ["General TP", "All Transactions"],
    summary: "Establishes the fundamental principle that transactions between associated enterprises should be priced as if they were between independent parties.",
  },
  {
    id: "2",
    chapter: "Chapter II",
    title: "Transfer Pricing Methods",
    sections: ["Paras 2.1-2.12: Selection of Method", "Paras 2.13-2.38: Traditional Methods", "Paras 2.39-2.145: Transactional Profit Methods"],
    lastUpdated: "2022-01-20",
    relevantFor: ["Benchmarking", "Method Selection"],
    summary: "Provides guidance on selection and application of the most appropriate transfer pricing method including CUP, RPM, CPM, TNMM, and Profit Split.",
  },
  {
    id: "3",
    chapter: "Chapter VI",
    title: "Special Considerations for Intangibles",
    sections: ["Paras 6.1-6.31: Identifying Intangibles", "Paras 6.32-6.85: DEMPE Functions", "Paras 6.86-6.229: Valuation"],
    lastUpdated: "2022-01-20",
    relevantFor: ["Intangibles", "Royalty", "IP Transfer"],
    summary: "Addresses transfer pricing aspects of intangibles including identification, DEMPE analysis, and valuation approaches.",
  },
  {
    id: "4",
    chapter: "Chapter VII",
    title: "Intra-Group Services",
    sections: ["Paras 7.1-7.13: Main Issues", "Paras 7.14-7.54: Benefit Test", "Paras 7.55-7.65: Low Value-Adding Services"],
    lastUpdated: "2022-01-20",
    relevantFor: ["Management Services", "Shared Services", "IGS"],
    summary: "Provides guidance on intra-group services including benefit test, allocation methods, and simplified approach for low value-adding services.",
  },
  {
    id: "5",
    chapter: "Chapter VIII",
    title: "Cost Contribution Arrangements",
    sections: ["Paras 8.1-8.30: Definition & Types", "Paras 8.31-8.51: Contributions & Benefits", "Paras 8.52-8.65: Entry/Exit Adjustments"],
    lastUpdated: "2022-01-20",
    relevantFor: ["CCA", "R&D Sharing", "Joint Development"],
    summary: "Addresses cost contribution arrangements including participant determination, contribution valuation, and buy-in/buy-out provisions.",
  },
  {
    id: "6",
    chapter: "Chapter IX",
    title: "Business Restructurings",
    sections: ["Paras 9.1-9.67: Scope & Analysis", "Paras 9.68-9.112: Exit Charges", "Paras 9.113-9.150: Indemnification"],
    lastUpdated: "2022-01-20",
    relevantFor: ["Restructuring", "Exit Charges", "Conversion"],
    summary: "Provides guidance on transfer pricing aspects of business restructurings including compensation for transfers and location savings.",
  },
  {
    id: "7",
    chapter: "Chapter X",
    title: "Financial Transactions",
    sections: ["Paras 10.1-10.58: Intra-Group Loans", "Paras 10.59-10.118: Cash Pooling", "Paras 10.119-10.180: Guarantees & Captive Insurance"],
    lastUpdated: "2022-02-11",
    relevantFor: ["Loans", "Guarantees", "Treasury"],
    summary: "Addresses transfer pricing aspects of financial transactions including loans, cash pooling, financial guarantees, and captive insurance.",
  },
];

export default function ReferencePage() {
  const [activeTab, setActiveTab] = useState<"caselaw" | "oecd">("caselaw");
  const [searchQuery, setSearchQuery] = useState("");
  const [courtFilter, setCourtFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");

  const filteredCaseLaw = caseLawData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCourt = courtFilter === "all" || item.court === courtFilter;
    const matchesTopic = topicFilter === "all" || item.topics.includes(topicFilter);
    return matchesSearch && matchesCourt && matchesTopic;
  });

  const filteredOECD = oecdGuidelines.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.relevantFor.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const uniqueTopics = [...new Set(caseLawData.flatMap((c) => c.topics))];
  const uniqueCourts = [...new Set(caseLawData.map((c) => c.court))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Reference Library
          </h1>
          <p className="text-[var(--text-secondary)]">
            Case Laws, OECD Guidelines & Transfer Pricing Resources
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bookmark className="mr-2 h-4 w-4" />
            My Bookmarks
          </Button>
          <Button variant="outline" size="sm">
            <Clock className="mr-2 h-4 w-4" />
            Recent
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-[var(--border-subtle)]">
        <button
          onClick={() => setActiveTab("caselaw")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "caselaw"
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Gavel className="h-4 w-4" />
          Case Laws
          <Badge variant="secondary">{caseLawData.length}</Badge>
        </button>
        <button
          onClick={() => setActiveTab("oecd")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "oecd"
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Globe className="h-4 w-4" />
          OECD Guidelines
          <Badge variant="secondary">{oecdGuidelines.length}</Badge>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            placeholder={activeTab === "caselaw" ? "Search case laws, topics, citations..." : "Search OECD guidelines, chapters..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {activeTab === "caselaw" && (
          <>
            <Select value={courtFilter} onValueChange={setCourtFilter}>
              <SelectTrigger className="w-[180px]">
                <Scale className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Court" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courts</SelectItem>
                {uniqueCourts.map((court) => (
                  <SelectItem key={court} value={court}>{court}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={topicFilter} onValueChange={setTopicFilter}>
              <SelectTrigger className="w-[180px]">
                <Tag className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {uniqueTopics.map((topic) => (
                  <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      {/* Content */}
      {activeTab === "caselaw" ? (
        <div className="space-y-4">
          {filteredCaseLaw.map((caseItem) => (
            <Card key={caseItem.id} className="hover:border-[var(--accent)]/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-[var(--text-primary)]">
                        {caseItem.name}
                      </h3>
                      {caseItem.bookmarked && (
                        <Star className="h-4 w-4 fill-[var(--warning)] text-[var(--warning)]" />
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mb-3">
                      {caseItem.citation}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                      {caseItem.summary}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {caseItem.topics.map((topic) => (
                        <Badge key={topic} variant="secondary">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {caseItem.court}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(caseItem.date).toLocaleDateString()}
                      </span>
                      <Badge
                        variant={
                          caseItem.verdict === "In favor of Assessee" ? "success" :
                          caseItem.verdict === "In favor of Revenue" ? "error" : "warning"
                        }
                      >
                        {caseItem.verdict}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <div className="text-right">
                      <p className="text-xs text-[var(--text-muted)]">Relevance</p>
                      <p className="text-2xl font-bold text-[var(--accent)]">{caseItem.relevance}%</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="mr-2 h-3 w-3" />
                      View Full
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredOECD.map((item) => (
            <Card key={item.id} className="hover:border-[var(--accent)]/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="info" className="mb-2">{item.chapter}</Badge>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-[var(--text-secondary)]">
                  {item.summary}
                </p>
                <div>
                  <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Key Sections:</p>
                  <ul className="space-y-1">
                    {item.sections.map((section, idx) => (
                      <li key={idx} className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                        <ChevronRight className="h-3 w-3" />
                        {section}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.relevantFor.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-muted)]">
                    Last Updated: {new Date(item.lastUpdated).toLocaleDateString()}
                  </span>
                  <Button size="sm" variant="outline">
                    <BookOpen className="mr-2 h-3 w-3" />
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10">
              <Gavel className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{caseLawData.length}</p>
              <p className="text-xs text-[var(--text-secondary)]">Case Laws</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--info)]/10">
              <Globe className="h-5 w-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{oecdGuidelines.length}</p>
              <p className="text-xs text-[var(--text-secondary)]">OECD Chapters</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--warning)]/10">
              <Star className="h-5 w-5 text-[var(--warning)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{caseLawData.filter(c => c.bookmarked).length}</p>
              <p className="text-xs text-[var(--text-secondary)]">Bookmarked</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
              <Tag className="h-5 w-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{uniqueTopics.length}</p>
              <p className="text-xs text-[var(--text-secondary)]">Topics Covered</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
