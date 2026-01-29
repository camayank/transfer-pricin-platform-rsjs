/**
 * Indian Transfer Pricing Case Law Database
 * Landmark cases from ITAT, High Courts, and Supreme Court
 */

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export type CourtType = "ITAT" | "High Court" | "Supreme Court";
export type RulingOutcome = "taxpayer" | "revenue" | "mixed";
export type TPMethod = "CUP" | "RPM" | "CPM" | "TNMM" | "PSM" | "OTHER";

export interface TPCaseLaw {
  id: string;
  citation: string;
  court: CourtType;
  bench: string;
  assessmentYear: string;
  decisionDate: string;
  appellant: string;
  respondent: string;
  issues: string[];
  methods: TPMethod[];
  natureCodes: string[];
  ruling: string;
  ratio: string;
  keywords: string[];
  favorableFor: RulingOutcome;
  sections: string[];
  precedentValue: "binding" | "persuasive" | "landmark";
}

export interface CaseLawSearchResult {
  case: TPCaseLaw;
  relevanceScore: number;
  matchedCriteria: string[];
}

// =============================================================================
// CASE LAW DATABASE
// =============================================================================

export const TP_CASE_LAW: TPCaseLaw[] = [
  // ========== LANDMARK SUPREME COURT CASES ==========
  {
    id: "SC001",
    citation: "Engineering Analysis Centre of Excellence Pvt Ltd vs CIT (2021) 432 ITR 471 (SC)",
    court: "Supreme Court",
    bench: "Delhi",
    assessmentYear: "Multiple",
    decisionDate: "2021-03-02",
    appellant: "Engineering Analysis Centre of Excellence Pvt Ltd",
    respondent: "CIT",
    issues: [
      "Whether payment for software is royalty under Section 9(1)(vi)",
      "Applicability of tax treaties on software payments"
    ],
    methods: ["OTHER"],
    natureCodes: ["09"],
    ruling: "Software payments are not royalty as end-user only gets a right to use, not copyright. Tax treaty provisions prevail.",
    ratio: "Payment for use of copyrighted software is not royalty under India-US/UK DTAA as there is no transfer of copyright rights.",
    keywords: ["royalty", "software", "copyright", "Section 9(1)(vi)", "tax treaty", "DTAA", "end-user license"],
    favorableFor: "taxpayer",
    sections: ["9(1)(vi)", "90", "195"],
    precedentValue: "binding"
  },
  {
    id: "SC002",
    citation: "CIT vs Nestle India Ltd (2012) 337 ITR 103 (SC)",
    court: "Supreme Court",
    bench: "Delhi",
    assessmentYear: "1997-98",
    decisionDate: "2011-08-05",
    appellant: "CIT",
    respondent: "Nestle India Ltd",
    issues: [
      "Applicability of arm's length principle to domestic transactions",
      "Whether TPO has jurisdiction over domestic cases"
    ],
    methods: ["OTHER"],
    natureCodes: [],
    ruling: "Transfer pricing provisions under Section 92 apply only to international transactions.",
    ratio: "Section 92 provisions are limited to international transactions with associated enterprises.",
    keywords: ["domestic transactions", "jurisdiction", "Section 92", "associated enterprise", "international transaction"],
    favorableFor: "taxpayer",
    sections: ["92", "92B", "92C"],
    precedentValue: "binding"
  },

  // ========== HIGH COURT LANDMARK CASES ==========
  {
    id: "HC001",
    citation: "CIT vs EKL Appliances Ltd (2012) 345 ITR 241 (Delhi HC)",
    court: "High Court",
    bench: "Delhi",
    assessmentYear: "2002-03",
    decisionDate: "2012-04-12",
    appellant: "CIT",
    respondent: "EKL Appliances Ltd",
    issues: [
      "Whether TPO can reject comparable without cogent reasons",
      "Role of functional comparability in selection of comparables"
    ],
    methods: ["TNMM"],
    natureCodes: ["01", "02"],
    ruling: "Comparables cannot be rejected without providing cogent reasons. Functional similarity is paramount.",
    ratio: "TPO must provide specific reasons for rejecting comparables proposed by taxpayer. Mere dissimilarity in nomenclature is insufficient.",
    keywords: ["comparables", "functional analysis", "rejection", "cogent reasons", "TNMM", "benchmarking"],
    favorableFor: "taxpayer",
    sections: ["92C", "92CA"],
    precedentValue: "binding"
  },
  {
    id: "HC002",
    citation: "Maruti Suzuki India Ltd vs CIT (2016) 381 ITR 117 (Delhi HC)",
    court: "High Court",
    bench: "Delhi",
    assessmentYear: "2005-06",
    decisionDate: "2015-12-11",
    appellant: "Maruti Suzuki India Ltd",
    respondent: "CIT",
    issues: [
      "AMP expenses adjustment by TPO",
      "Whether AMP is a separate international transaction",
      "Bright line test validity"
    ],
    methods: ["OTHER"],
    natureCodes: ["07"],
    ruling: "AMP expenses cannot be treated as separate international transaction without evidence of arrangement.",
    ratio: "Existence of international transaction for AMP must be established first. Bright line test is not recognized under Indian law.",
    keywords: ["AMP", "advertising", "marketing", "promotion", "bright line test", "brand building", "international transaction"],
    favorableFor: "taxpayer",
    sections: ["92B", "92C"],
    precedentValue: "landmark"
  },
  {
    id: "HC003",
    citation: "CIT vs Cushman & Wakefield (India) Pvt Ltd (2014) 367 ITR 730 (Delhi HC)",
    court: "High Court",
    bench: "Delhi",
    assessmentYear: "2007-08",
    decisionDate: "2014-04-23",
    appellant: "CIT",
    respondent: "Cushman & Wakefield (India) Pvt Ltd",
    issues: [
      "Exclusion of companies with extraordinary events",
      "Use of multiple year data for comparables"
    ],
    methods: ["TNMM"],
    natureCodes: ["04"],
    ruling: "Companies with extraordinary events should be excluded. Multiple year data provides better comparability.",
    ratio: "Companies undergoing mergers, acquisitions or restructuring should be excluded from comparable set.",
    keywords: ["extraordinary events", "merger", "acquisition", "multiple year data", "comparability adjustment"],
    favorableFor: "taxpayer",
    sections: ["92C"],
    precedentValue: "binding"
  },
  {
    id: "HC004",
    citation: "Sony India Pvt Ltd vs DCIT (2017) 395 ITR 437 (Delhi HC)",
    court: "High Court",
    bench: "Delhi",
    assessmentYear: "2008-09",
    decisionDate: "2017-01-05",
    appellant: "Sony India Pvt Ltd",
    respondent: "DCIT",
    issues: [
      "Advertisement, Marketing and Promotion (AMP) expenses",
      "Brand building for foreign AE",
      "Economic ownership vs legal ownership"
    ],
    methods: ["OTHER"],
    natureCodes: ["07"],
    ruling: "No adjustment for AMP expenses where no agreement exists and taxpayer is the legal owner of brand in India.",
    ratio: "When taxpayer is the owner of brand/trademark in India, AMP expenditure cannot be treated as benefiting foreign AE.",
    keywords: ["AMP", "brand ownership", "legal owner", "marketing intangibles", "trademark"],
    favorableFor: "taxpayer",
    sections: ["92B", "92C"],
    precedentValue: "binding"
  },
  {
    id: "HC005",
    citation: "CIT vs Ameriprise India Pvt Ltd (2016) 381 ITR 391 (Delhi HC)",
    court: "High Court",
    bench: "Delhi",
    assessmentYear: "2006-07",
    decisionDate: "2015-11-19",
    appellant: "CIT",
    respondent: "Ameriprise India Pvt Ltd",
    issues: [
      "Comparability of companies with different risk profiles",
      "Characterization of tested party"
    ],
    methods: ["TNMM"],
    natureCodes: ["04"],
    ruling: "Companies bearing significantly different risks cannot be treated as comparables. Risk profile is crucial for benchmarking.",
    ratio: "Functional and risk profile must be aligned for valid comparability. Captive service providers differ from entrepreneurs.",
    keywords: ["risk profile", "captive", "entrepreneurial", "FAR analysis", "comparability", "characterization"],
    favorableFor: "taxpayer",
    sections: ["92C"],
    precedentValue: "binding"
  },

  // ========== ITAT LANDMARK CASES ==========
  {
    id: "ITAT001",
    citation: "DCIT vs Aztec Software & Technology Services Ltd (2007) 107 ITD 141 (Bang ITAT)",
    court: "ITAT",
    bench: "Bangalore",
    assessmentYear: "2002-03",
    decisionDate: "2007-06-22",
    appellant: "DCIT",
    respondent: "Aztec Software & Technology Services Ltd",
    issues: [
      "Selection of comparables based on functional profile",
      "Rejection of high profit making companies",
      "Use of filters in comparability analysis"
    ],
    methods: ["TNMM"],
    natureCodes: ["04"],
    ruling: "Established comprehensive framework for comparable selection in software development services.",
    ratio: "Companies must be functionally comparable. Turnover filter, employee cost filter, and RPT filter can be applied.",
    keywords: ["comparable selection", "filters", "software services", "captive unit", "functional analysis", "turnover filter"],
    favorableFor: "taxpayer",
    sections: ["92C", "92CA"],
    precedentValue: "landmark"
  },
  {
    id: "ITAT002",
    citation: "Mentor Graphics (Noida) Pvt Ltd vs DCIT (2007) 109 ITD 101 (Delhi ITAT)",
    court: "ITAT",
    bench: "Delhi",
    assessmentYear: "2002-03",
    decisionDate: "2007-09-17",
    appellant: "Mentor Graphics (Noida) Pvt Ltd",
    respondent: "DCIT",
    issues: [
      "Working capital adjustment",
      "Capacity utilization adjustment",
      "Risk adjustment for comparables"
    ],
    methods: ["TNMM"],
    natureCodes: ["04"],
    ruling: "Working capital adjustment is necessary when comparables have different working capital profiles.",
    ratio: "Comparability adjustments for working capital and capacity utilization enhance reliability of benchmarking.",
    keywords: ["working capital adjustment", "capacity utilization", "comparability adjustment", "TNMM"],
    favorableFor: "taxpayer",
    sections: ["92C"],
    precedentValue: "landmark"
  },
  {
    id: "ITAT003",
    citation: "Vodafone India Services Pvt Ltd vs DCIT (2014) 152 ITD 263 (Mumbai ITAT)",
    court: "ITAT",
    bench: "Mumbai",
    assessmentYear: "2009-10",
    decisionDate: "2014-07-18",
    appellant: "Vodafone India Services Pvt Ltd",
    respondent: "DCIT",
    issues: [
      "Issue of shares at premium as international transaction",
      "Valuation of shares for transfer pricing purposes"
    ],
    methods: ["OTHER"],
    natureCodes: ["17"],
    ruling: "Issue of shares at premium is an international transaction but DCF valuation is appropriate method.",
    ratio: "Share issue is international transaction under Section 92B(1). NAV method may not always be appropriate for valuation.",
    keywords: ["share valuation", "DCF", "NAV", "capital transaction", "equity", "premium"],
    favorableFor: "mixed",
    sections: ["92B", "92C"],
    precedentValue: "landmark"
  },
  {
    id: "ITAT004",
    citation: "Rolls Royce Singapore Pte Ltd vs ADIT (2017) 88 taxmann.com 287 (Delhi ITAT)",
    court: "ITAT",
    bench: "Delhi",
    assessmentYear: "2008-09",
    decisionDate: "2017-09-29",
    appellant: "Rolls Royce Singapore Pte Ltd",
    respondent: "ADIT",
    issues: [
      "Attribution of profits to PE",
      "Benchmarking agency PE operations",
      "Limited risk vs entrepreneur PE"
    ],
    methods: ["TNMM"],
    natureCodes: ["04"],
    ruling: "Attribution of profits to PE should be based on FAR analysis. Agency PE not taxable on gross receipts.",
    ratio: "Only profits attributable to PE functions, assets and risks can be taxed in India.",
    keywords: ["PE", "permanent establishment", "attribution", "agency PE", "dependent agent", "Article 7"],
    favorableFor: "taxpayer",
    sections: ["9", "44D", "92C"],
    precedentValue: "persuasive"
  },
  {
    id: "ITAT005",
    citation: "TNS India Pvt Ltd vs ACIT (2013) 144 ITD 271 (Delhi ITAT)",
    court: "ITAT",
    bench: "Delhi",
    assessmentYear: "2006-07",
    decisionDate: "2013-04-12",
    appellant: "TNS India Pvt Ltd",
    respondent: "ACIT",
    issues: [
      "Exclusion of loss making companies",
      "Comparability of companies with persistent losses"
    ],
    methods: ["TNMM"],
    natureCodes: ["04"],
    ruling: "Companies with persistent losses should generally be excluded unless specific circumstances justify inclusion.",
    ratio: "Loss-making companies may indicate factors affecting comparability and should be excluded unless justified.",
    keywords: ["loss making", "persistent losses", "comparability", "filter", "exclusion"],
    favorableFor: "taxpayer",
    sections: ["92C"],
    precedentValue: "persuasive"
  },
  {
    id: "ITAT006",
    citation: "Philips Software Centre Pvt Ltd vs ACIT (2008) 26 SOT 226 (Bang ITAT)",
    court: "ITAT",
    bench: "Bangalore",
    assessmentYear: "2003-04",
    decisionDate: "2008-02-29",
    appellant: "Philips Software Centre Pvt Ltd",
    respondent: "ACIT",
    issues: [
      "Export incentives treatment in benchmarking",
      "Operating revenue definition for PLI calculation"
    ],
    methods: ["TNMM"],
    natureCodes: ["04"],
    ruling: "Export incentives should be excluded from operating revenue for computing PLI for captive service providers.",
    ratio: "For computing operating margin, export incentives like STPI benefits should be excluded from operating revenue.",
    keywords: ["export incentives", "STPI", "operating revenue", "PLI", "operating margin"],
    favorableFor: "taxpayer",
    sections: ["92C", "10A"],
    precedentValue: "persuasive"
  },
  {
    id: "ITAT007",
    citation: "DCIT vs B4U International Holdings Ltd (2015) 170 TTJ 1 (Mumbai ITAT)",
    court: "ITAT",
    bench: "Mumbai",
    assessmentYear: "2008-09",
    decisionDate: "2015-03-27",
    appellant: "DCIT",
    respondent: "B4U International Holdings Ltd",
    issues: [
      "Corporate guarantee fees",
      "Arm's length rate for guarantees"
    ],
    methods: ["CUP"],
    natureCodes: ["08"],
    ruling: "Corporate guarantee to AE is an international transaction. Arm's length fee should be determined.",
    ratio: "Guarantee fee of 0.5% is reasonable for corporate guarantees extended to group companies.",
    keywords: ["corporate guarantee", "guarantee fee", "0.5%", "financial transaction", "credit enhancement"],
    favorableFor: "mixed",
    sections: ["92B", "92C"],
    precedentValue: "persuasive"
  },
  {
    id: "ITAT008",
    citation: "Instrumentarium Corporation Ltd vs DCIT (2016) 72 taxmann.com 335 (Bang ITAT)",
    court: "ITAT",
    bench: "Bangalore",
    assessmentYear: "2008-09",
    decisionDate: "2016-06-24",
    appellant: "Instrumentarium Corporation Ltd",
    respondent: "DCIT",
    issues: [
      "Interest on receivables outstanding beyond normal credit period",
      "Notional interest on delayed receivables"
    ],
    methods: ["CUP", "OTHER"],
    natureCodes: ["20"],
    ruling: "Interest on delayed receivables beyond normal credit period may be charged at arm's length.",
    ratio: "If receivables are outstanding beyond normal credit period, working capital adjustment or interest may be warranted.",
    keywords: ["receivables", "interest", "credit period", "working capital", "delayed payment"],
    favorableFor: "revenue",
    sections: ["92B", "92C"],
    precedentValue: "persuasive"
  },
  {
    id: "ITAT009",
    citation: "Maersk Global Service Centre India Pvt Ltd vs DCIT (2014) 147 ITD 83 (Mumbai ITAT)",
    court: "ITAT",
    bench: "Mumbai",
    assessmentYear: "2005-06",
    decisionDate: "2014-01-10",
    appellant: "Maersk Global Service Centre India Pvt Ltd",
    respondent: "DCIT",
    issues: [
      "Comparability for back-office support services",
      "Knowledge process outsourcing vs business process outsourcing"
    ],
    methods: ["TNMM"],
    natureCodes: ["04", "05"],
    ruling: "BPO and KPO services have different functional profiles and should not be compared with each other.",
    ratio: "Clear distinction between KPO (knowledge-based) and BPO (process-based) services for comparability analysis.",
    keywords: ["BPO", "KPO", "back-office", "support services", "functional comparability"],
    favorableFor: "taxpayer",
    sections: ["92C"],
    precedentValue: "persuasive"
  },
  {
    id: "ITAT010",
    citation: "Netapp India Pvt Ltd vs ACIT (2016) 175 TTJ 273 (Bang ITAT)",
    court: "ITAT",
    bench: "Bangalore",
    assessmentYear: "2010-11",
    decisionDate: "2016-11-18",
    appellant: "Netapp India Pvt Ltd",
    respondent: "ACIT",
    issues: [
      "Related party transaction filter percentage",
      "25% RPT filter vs 15% RPT filter"
    ],
    methods: ["TNMM"],
    natureCodes: ["04"],
    ruling: "Companies with related party transactions exceeding 25% of revenue should be excluded.",
    ratio: "25% RPT filter is appropriate to ensure comparables reflect independent pricing.",
    keywords: ["RPT filter", "related party", "25%", "comparable selection", "filter criteria"],
    favorableFor: "taxpayer",
    sections: ["92C"],
    precedentValue: "persuasive"
  },
  {
    id: "ITAT011",
    citation: "E-Clerx Services Ltd vs DCIT (2017) 88 taxmann.com 98 (Mumbai ITAT)",
    court: "ITAT",
    bench: "Mumbai",
    assessmentYear: "2011-12",
    decisionDate: "2017-10-06",
    appellant: "E-Clerx Services Ltd",
    respondent: "DCIT",
    issues: [
      "Segmental analysis for multi-segment companies",
      "Entity level vs transaction level benchmarking"
    ],
    methods: ["TNMM"],
    natureCodes: ["04"],
    ruling: "Segmental data should be used when transactions pertain to specific segments.",
    ratio: "When reliable segmental data is available, it should be preferred over entity-level data.",
    keywords: ["segmental analysis", "segment-wise", "entity level", "transaction level", "multi-segment"],
    favorableFor: "taxpayer",
    sections: ["92C"],
    precedentValue: "persuasive"
  },
  {
    id: "ITAT012",
    citation: "CIT vs Tara Jewels Exports Pvt Ltd (2016) 380 ITR 579 (Bombay HC)",
    court: "High Court",
    bench: "Bombay",
    assessmentYear: "2008-09",
    decisionDate: "2016-02-05",
    appellant: "CIT",
    respondent: "Tara Jewels Exports Pvt Ltd",
    issues: [
      "Use of current year data vs multiple year data",
      "Timing of comparable search"
    ],
    methods: ["TNMM"],
    natureCodes: ["01"],
    ruling: "Multiple year data provides more reliable benchmark when available.",
    ratio: "Use of weighted average of multiple years smoothens out year-specific aberrations.",
    keywords: ["multiple year", "weighted average", "current year", "data selection", "reliability"],
    favorableFor: "taxpayer",
    sections: ["92C"],
    precedentValue: "binding"
  },
  {
    id: "ITAT013",
    citation: "Li & Fung India Pvt Ltd vs DCIT (2014) 147 ITD 49 (Delhi ITAT)",
    court: "ITAT",
    bench: "Delhi",
    assessmentYear: "2006-07",
    decisionDate: "2014-03-28",
    appellant: "Li & Fung India Pvt Ltd",
    respondent: "DCIT",
    issues: [
      "Procurement services characterization",
      "Indenting agent vs buying agent"
    ],
    methods: ["TNMM"],
    natureCodes: ["05"],
    ruling: "Procurement support services to foreign AE should be benchmarked based on functions performed.",
    ratio: "Indenting agent performing sourcing functions bears limited risks and should earn routine returns.",
    keywords: ["procurement", "sourcing", "indenting agent", "buying agent", "support services"],
    favorableFor: "taxpayer",
    sections: ["92C"],
    precedentValue: "persuasive"
  },
  {
    id: "ITAT014",
    citation: "ACIT vs Frost & Sullivan India Pvt Ltd (2016) 73 taxmann.com 115 (Mumbai ITAT)",
    court: "ITAT",
    bench: "Mumbai",
    assessmentYear: "2009-10",
    decisionDate: "2016-10-28",
    appellant: "ACIT",
    respondent: "Frost & Sullivan India Pvt Ltd",
    issues: [
      "Management services fees",
      "Benefit documentation for intercompany services"
    ],
    methods: ["TNMM", "CPM"],
    natureCodes: ["05"],
    ruling: "Management fees are allowable if benefit to recipient is demonstrated and pricing is arm's length.",
    ratio: "Service recipient must demonstrate actual benefit received. Duplicative services should not be charged.",
    keywords: ["management fees", "benefit test", "intercompany services", "stewardship", "documentation"],
    favorableFor: "taxpayer",
    sections: ["92C", "37"],
    precedentValue: "persuasive"
  },
  {
    id: "ITAT015",
    citation: "SAP Labs India Pvt Ltd vs DCIT (2013) 25 ITR(T) 641 (Bang ITAT)",
    court: "ITAT",
    bench: "Bangalore",
    assessmentYear: "2005-06",
    decisionDate: "2013-09-23",
    appellant: "SAP Labs India Pvt Ltd",
    respondent: "DCIT",
    issues: [
      "R&D services characterization",
      "Contract R&D vs full-risk R&D",
      "Employee cost to total cost ratio"
    ],
    methods: ["TNMM", "CPM"],
    natureCodes: ["06"],
    ruling: "Contract R&D services with guaranteed cost plus should be benchmarked differently from entrepreneurial R&D.",
    ratio: "Employee cost filter can be used to identify comparable R&D service providers.",
    keywords: ["R&D", "contract R&D", "software development", "employee cost filter", "cost plus"],
    favorableFor: "mixed",
    sections: ["92C"],
    precedentValue: "persuasive"
  },
  {
    id: "ITAT016",
    citation: "Ranbaxy Laboratories Ltd vs ACIT (2008) 111 ITD 428 (Delhi ITAT)",
    court: "ITAT",
    bench: "Delhi",
    assessmentYear: "2001-02",
    decisionDate: "2008-04-04",
    appellant: "Ranbaxy Laboratories Ltd",
    respondent: "ACIT",
    issues: [
      "Aggregation of transactions",
      "Transaction-by-transaction vs entity-wide approach"
    ],
    methods: ["TNMM"],
    natureCodes: ["01", "03"],
    ruling: "Closely linked transactions can be aggregated for benchmarking purposes.",
    ratio: "Interrelated transactions can be combined when they are closely linked and appropriate data exists.",
    keywords: ["aggregation", "combined transactions", "interlinked", "entity approach"],
    favorableFor: "taxpayer",
    sections: ["92C"],
    precedentValue: "persuasive"
  },
  {
    id: "ITAT017",
    citation: "Lloyds Register Industrial Services (India) Pvt Ltd vs DCIT (2019) 108 taxmann.com 447 (Mumbai ITAT)",
    court: "ITAT",
    bench: "Mumbai",
    assessmentYear: "2013-14",
    decisionDate: "2019-07-19",
    appellant: "Lloyds Register Industrial Services (India) Pvt Ltd",
    respondent: "DCIT",
    issues: [
      "Technical services characterization",
      "Fees for technical services (FTS) vs independent services"
    ],
    methods: ["TNMM"],
    natureCodes: ["04", "05"],
    ruling: "Technical services rendered independently can be benchmarked using TNMM with appropriate comparables.",
    ratio: "Technical services requiring specialized skills should be compared with companies having similar expertise.",
    keywords: ["technical services", "FTS", "specialized services", "skill-based", "expertise"],
    favorableFor: "taxpayer",
    sections: ["92C", "9(1)(vii)"],
    precedentValue: "persuasive"
  },
  {
    id: "ITAT018",
    citation: "DCIT vs Willis Processing Services India Pvt Ltd (2018) 92 taxmann.com 267 (Delhi ITAT)",
    court: "ITAT",
    bench: "Delhi",
    assessmentYear: "2012-13",
    decisionDate: "2018-04-06",
    appellant: "DCIT",
    respondent: "Willis Processing Services India Pvt Ltd",
    issues: [
      "Insurance auxiliary services benchmarking",
      "Super profits exclusion"
    ],
    methods: ["TNMM"],
    natureCodes: ["05"],
    ruling: "Companies earning super profits due to exceptional circumstances should be excluded from comparables.",
    ratio: "Super profit earning companies may not reflect arm's length conditions and distort benchmark.",
    keywords: ["super profits", "exceptional profits", "exclusion", "abnormal", "comparability"],
    favorableFor: "taxpayer",
    sections: ["92C"],
    precedentValue: "persuasive"
  },
  {
    id: "ITAT019",
    citation: "Toyota Kirloskar Motor Pvt Ltd vs ACIT (2018) 90 taxmann.com 219 (Bang ITAT)",
    court: "ITAT",
    bench: "Bangalore",
    assessmentYear: "2012-13",
    decisionDate: "2018-01-31",
    appellant: "Toyota Kirloskar Motor Pvt Ltd",
    respondent: "ACIT",
    issues: [
      "Royalty rate benchmarking",
      "Intangible valuation methods"
    ],
    methods: ["CUP", "OTHER"],
    natureCodes: ["09"],
    ruling: "Royalty rates should be benchmarked considering the value of technology and market comparables.",
    ratio: "CUP method is appropriate for royalty when comparable licenses exist. Industry-specific rates relevant.",
    keywords: ["royalty", "technology", "license", "intangibles", "brand"],
    favorableFor: "mixed",
    sections: ["92C", "37"],
    precedentValue: "persuasive"
  },
  {
    id: "ITAT020",
    citation: "Microsoft Corporation (India) Pvt Ltd vs ACIT (2018) 171 ITD 437 (Delhi ITAT)",
    court: "ITAT",
    bench: "Delhi",
    assessmentYear: "2009-10",
    decisionDate: "2018-02-02",
    appellant: "Microsoft Corporation (India) Pvt Ltd",
    respondent: "ACIT",
    issues: [
      "Marketing support services",
      "Cost allocation methods",
      "Reimbursements vs service fees"
    ],
    methods: ["TNMM"],
    natureCodes: ["05", "07"],
    ruling: "Marketing support services can be reimbursed at cost if no value addition by service provider.",
    ratio: "Pass-through costs can be reimbursed at cost. Service element should be separately benchmarked.",
    keywords: ["marketing support", "reimbursement", "cost allocation", "pass-through", "value addition"],
    favorableFor: "taxpayer",
    sections: ["92C", "37"],
    precedentValue: "persuasive"
  },

  // ========== SAFE HARBOUR AND DOCUMENTATION CASES ==========
  {
    id: "ITAT021",
    citation: "KPMG vs ACIT (2016) 69 taxmann.com 197 (Delhi ITAT)",
    court: "ITAT",
    bench: "Delhi",
    assessmentYear: "2010-11",
    decisionDate: "2016-04-29",
    appellant: "KPMG",
    respondent: "ACIT",
    issues: [
      "Documentation requirements",
      "Penalty under Section 271G"
    ],
    methods: ["OTHER"],
    natureCodes: [],
    ruling: "Penalty cannot be imposed if documentation is maintained as required, even if adjustment is made.",
    ratio: "Penalty under Section 271G requires failure to maintain/furnish documentation, not mere adjustment.",
    keywords: ["documentation", "penalty", "Section 271G", "compliance", "maintenance"],
    favorableFor: "taxpayer",
    sections: ["92D", "271G"],
    precedentValue: "persuasive"
  },
  {
    id: "ITAT022",
    citation: "DCIT vs Deloitte Consulting India Pvt Ltd (2019) 176 ITD 705 (Hyderabad ITAT)",
    court: "ITAT",
    bench: "Hyderabad",
    assessmentYear: "2012-13",
    decisionDate: "2019-05-17",
    appellant: "DCIT",
    respondent: "Deloitte Consulting India Pvt Ltd",
    issues: [
      "Safe harbour applicability",
      "Opt-in requirements for safe harbour"
    ],
    methods: ["OTHER"],
    natureCodes: ["04"],
    ruling: "Safe harbour can be opted for eligible transactions meeting threshold requirements.",
    ratio: "Safe harbour provisions provide certainty and reduce compliance burden for eligible taxpayers.",
    keywords: ["safe harbour", "opt-in", "threshold", "eligible", "IT/ITeS"],
    favorableFor: "taxpayer",
    sections: ["92CB", "92C"],
    precedentValue: "persuasive"
  },

  // ========== INTRA-GROUP FINANCING CASES ==========
  {
    id: "ITAT023",
    citation: "ACIT vs Cotton Naturals India Pvt Ltd (2015) 154 ITD 302 (Delhi ITAT)",
    court: "ITAT",
    bench: "Delhi",
    assessmentYear: "2008-09",
    decisionDate: "2015-05-22",
    appellant: "ACIT",
    respondent: "Cotton Naturals India Pvt Ltd",
    issues: [
      "Interest on loans to AE",
      "LIBOR vs domestic rate for INR loans"
    ],
    methods: ["CUP"],
    natureCodes: ["08"],
    ruling: "LIBOR plus appropriate spread is acceptable benchmark for foreign currency loans.",
    ratio: "Interest rate should reflect the currency of borrowing. LIBOR for foreign currency, SBI rate for INR.",
    keywords: ["interest rate", "LIBOR", "foreign currency", "INR", "loan", "benchmark rate"],
    favorableFor: "mixed",
    sections: ["92C"],
    precedentValue: "persuasive"
  },
  {
    id: "ITAT024",
    citation: "Micro Ink Pvt Ltd vs ACIT (2016) 176 TTJ 8 (Ahmedabad ITAT)",
    court: "ITAT",
    bench: "Ahmedabad",
    assessmentYear: "2011-12",
    decisionDate: "2016-08-26",
    appellant: "Micro Ink Pvt Ltd",
    respondent: "ACIT",
    issues: [
      "Corporate guarantee fees",
      "Implicit vs explicit guarantee"
    ],
    methods: ["CUP"],
    natureCodes: ["08"],
    ruling: "Corporate guarantee fee of 0.5% upheld as arm's length for explicit guarantees.",
    ratio: "Explicit guarantee conferring benefit warrants compensation. Rate depends on credit enhancement provided.",
    keywords: ["guarantee fee", "explicit guarantee", "0.5%", "credit enhancement", "bank guarantee"],
    favorableFor: "mixed",
    sections: ["92B", "92C"],
    precedentValue: "persuasive"
  },

  // ========== RECENT SIGNIFICANT CASES ==========
  {
    id: "ITAT025",
    citation: "PCIT vs Softbrands India Pvt Ltd (2018) 407 ITR 382 (Karnataka HC)",
    court: "High Court",
    bench: "Karnataka",
    assessmentYear: "2007-08",
    decisionDate: "2018-09-14",
    appellant: "PCIT",
    respondent: "Softbrands India Pvt Ltd",
    issues: [
      "Determination of arm's length price",
      "Use of range vs specific point"
    ],
    methods: ["TNMM"],
    natureCodes: ["04"],
    ruling: "If taxpayer's margin falls within arm's length range, no adjustment is warranted.",
    ratio: "Adjustment should be made only when tested party margin is outside the arm's length range.",
    keywords: ["arm's length range", "adjustment", "within range", "interquartile range", "margin"],
    favorableFor: "taxpayer",
    sections: ["92C"],
    precedentValue: "binding"
  }
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all cases
 */
export function getAllCases(): TPCaseLaw[] {
  return TP_CASE_LAW;
}

/**
 * Get case by ID
 */
export function getCaseById(id: string): TPCaseLaw | undefined {
  return TP_CASE_LAW.find(c => c.id === id);
}

/**
 * Get cases by court type
 */
export function getCasesByCourt(court: CourtType): TPCaseLaw[] {
  return TP_CASE_LAW.filter(c => c.court === court);
}

/**
 * Get cases favorable for a specific party
 */
export function getCasesByOutcome(outcome: RulingOutcome): TPCaseLaw[] {
  return TP_CASE_LAW.filter(c => c.favorableFor === outcome);
}

/**
 * Get cases by TP method
 */
export function getCasesByMethod(method: TPMethod): TPCaseLaw[] {
  return TP_CASE_LAW.filter(c => c.methods.includes(method));
}

/**
 * Get cases by nature code
 */
export function getCasesByNatureCode(natureCode: string): TPCaseLaw[] {
  return TP_CASE_LAW.filter(c => c.natureCodes.includes(natureCode));
}

/**
 * Get cases by keyword search
 */
export function getCasesByKeyword(keyword: string): TPCaseLaw[] {
  const lowerKeyword = keyword.toLowerCase();
  return TP_CASE_LAW.filter(c =>
    c.keywords.some(k => k.toLowerCase().includes(lowerKeyword)) ||
    c.issues.some(i => i.toLowerCase().includes(lowerKeyword)) ||
    c.ruling.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * Get landmark cases
 */
export function getLandmarkCases(): TPCaseLaw[] {
  return TP_CASE_LAW.filter(c => c.precedentValue === "landmark" || c.precedentValue === "binding");
}

/**
 * Get cases by assessment year
 */
export function getCasesByAssessmentYear(year: string): TPCaseLaw[] {
  return TP_CASE_LAW.filter(c => c.assessmentYear.includes(year));
}

/**
 * Get cases by bench
 */
export function getCasesByBench(bench: string): TPCaseLaw[] {
  const lowerBench = bench.toLowerCase();
  return TP_CASE_LAW.filter(c => c.bench.toLowerCase().includes(lowerBench));
}

/**
 * Get case statistics
 */
export function getCaseStatistics(): {
  totalCases: number;
  byOutcome: Record<RulingOutcome, number>;
  byCourt: Record<CourtType, number>;
  byMethod: Record<string, number>;
} {
  const stats = {
    totalCases: TP_CASE_LAW.length,
    byOutcome: { taxpayer: 0, revenue: 0, mixed: 0 } as Record<RulingOutcome, number>,
    byCourt: { ITAT: 0, "High Court": 0, "Supreme Court": 0 } as Record<CourtType, number>,
    byMethod: {} as Record<string, number>
  };

  for (const c of TP_CASE_LAW) {
    stats.byOutcome[c.favorableFor]++;
    stats.byCourt[c.court]++;
    for (const method of c.methods) {
      stats.byMethod[method] = (stats.byMethod[method] || 0) + 1;
    }
  }

  return stats;
}

// =============================================================================
// VERSION INFO
// =============================================================================

export const TP_CASE_LAW_VERSION = {
  version: "1.0.0",
  totalCases: TP_CASE_LAW.length,
  lastUpdated: "2025-01-29",
  coverage: {
    supremeCourt: TP_CASE_LAW.filter(c => c.court === "Supreme Court").length,
    highCourt: TP_CASE_LAW.filter(c => c.court === "High Court").length,
    itat: TP_CASE_LAW.filter(c => c.court === "ITAT").length
  },
  categories: [
    "Method Selection",
    "Comparability Analysis",
    "AMP Expenses",
    "Intra-Group Services",
    "Financial Transactions",
    "Documentation",
    "Safe Harbour",
    "Business Restructuring"
  ]
};
