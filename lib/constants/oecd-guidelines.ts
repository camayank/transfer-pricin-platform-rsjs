/**
 * OECD Transfer Pricing Guidelines Reference Database
 * Based on OECD Transfer Pricing Guidelines for Multinational Enterprises and Tax Administrations
 * Version: 2022 (January 2022 consolidated version)
 */

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface OECDGuideline {
  chapter: number;
  section: string;
  paragraph: string;
  title: string;
  content: string;
  keywords: string[];
  version: string;
  relatedSections: string[];
}

export interface OECDChapter {
  number: number;
  title: string;
  description: string;
  sections: string[];
}

export interface GuidelineSearchResult {
  guideline: OECDGuideline;
  relevanceScore: number;
  matchedKeywords: string[];
}

// =============================================================================
// CHAPTER DEFINITIONS
// =============================================================================

export const OECD_CHAPTERS: OECDChapter[] = [
  {
    number: 1,
    title: "The Arm's Length Principle",
    description: "Establishes the arm's length principle as the international transfer pricing standard and provides guidance on its application.",
    sections: ["A", "B", "C", "D"]
  },
  {
    number: 2,
    title: "Transfer Pricing Methods",
    description: "Describes the traditional transaction methods (CUP, Resale Price, Cost Plus) and transactional profit methods (TNMM, Profit Split).",
    sections: ["A", "B", "C", "D", "E"]
  },
  {
    number: 3,
    title: "Comparability Analysis",
    description: "Provides detailed guidance on performing comparability analysis, including the nine-step process and comparability factors.",
    sections: ["A", "B", "C", "D"]
  },
  {
    number: 4,
    title: "Administrative Approaches to Avoiding and Resolving Transfer Pricing Disputes",
    description: "Covers compliance practices, corresponding adjustments, MAP, safe harbours, and APAs.",
    sections: ["A", "B", "C", "D", "E", "F"]
  },
  {
    number: 5,
    title: "Documentation",
    description: "Establishes the three-tiered documentation approach: Master File, Local File, and Country-by-Country Report.",
    sections: ["A", "B", "C", "D", "E"]
  },
  {
    number: 6,
    title: "Special Considerations for Intangibles",
    description: "Comprehensive guidance on identifying and pricing transactions involving intangibles.",
    sections: ["A", "B", "C", "D", "E", "F"]
  },
  {
    number: 7,
    title: "Special Considerations for Intra-Group Services",
    description: "Guidance on determining whether services have been rendered, their arm's length charge, and the simplified approach for low value-adding services.",
    sections: ["A", "B", "C", "D", "E"]
  },
  {
    number: 8,
    title: "Cost Contribution Arrangements",
    description: "Guidance on determining arm's length contributions and the treatment of buy-in/buy-out payments.",
    sections: ["A", "B", "C", "D", "E"]
  },
  {
    number: 9,
    title: "Transfer Pricing Aspects of Business Restructurings",
    description: "Addresses arm's length compensation for restructuring transactions and post-restructuring remuneration.",
    sections: ["A", "B", "C", "D"]
  },
  {
    number: 10,
    title: "Transfer Pricing Aspects of Financial Transactions",
    description: "Guidance on intra-group loans, cash pooling, hedging, financial guarantees, and captive insurance.",
    sections: ["A", "B", "C", "D", "E", "F"]
  }
];

// =============================================================================
// GUIDELINE DATABASE
// =============================================================================

export const OECD_GUIDELINES: OECDGuideline[] = [
  // ========== CHAPTER I: ARM'S LENGTH PRINCIPLE ==========
  {
    chapter: 1,
    section: "A",
    paragraph: "1.1",
    title: "Introduction to the Arm's Length Principle",
    content: "When independent enterprises transact with each other, the conditions of their commercial and financial relations (e.g. the price of goods transferred or services provided and the conditions of the transfer or provision) ordinarily are determined by market forces.",
    keywords: ["arm's length", "market forces", "independent enterprises", "commercial relations"],
    version: "2022",
    relatedSections: ["1.2", "1.6"]
  },
  {
    chapter: 1,
    section: "A",
    paragraph: "1.2",
    title: "MNE Associated Enterprise Transactions",
    content: "When associated enterprises transact with each other, their commercial and financial relations may not be directly affected by external market forces in the same way. Tax administrations should not automatically assume that associated enterprises have sought to manipulate their profits.",
    keywords: ["associated enterprises", "MNE", "commercial relations", "profit manipulation"],
    version: "2022",
    relatedSections: ["1.1", "1.3"]
  },
  {
    chapter: 1,
    section: "B",
    paragraph: "1.6",
    title: "Statement of the Arm's Length Principle",
    content: "Article 9 of the OECD Model Tax Convention provides that where conditions are made or imposed between two associated enterprises in their commercial or financial relations which differ from those which would be made between independent enterprises, then any profits which would, but for those conditions, have accrued to one of the enterprises may be included in the profits of that enterprise and taxed accordingly.",
    keywords: ["Article 9", "OECD Model", "associated enterprises", "profit allocation", "tax treaty"],
    version: "2022",
    relatedSections: ["1.1", "1.7"]
  },
  {
    chapter: 1,
    section: "C",
    paragraph: "1.33",
    title: "Accurate Delineation of the Transaction",
    content: "The actual transaction between the associated enterprises must be accurately delineated. This means identifying the economically relevant characteristics of the transaction, including the contractual terms, the functions performed, assets used and risks assumed, the characteristics of property transferred or services provided, the economic circumstances, and the business strategies.",
    keywords: ["accurate delineation", "economically relevant", "functions", "assets", "risks", "FAR analysis"],
    version: "2022",
    relatedSections: ["1.34", "1.35", "3.1"]
  },
  {
    chapter: 1,
    section: "C",
    paragraph: "1.36",
    title: "Conduct of the Parties",
    content: "The conduct of the parties should generally be taken as the best evidence of the actual allocation of risk. If a risk is contractually allocated to one party but the other party controls the risk or does not have the financial capacity to assume the risk, the actual allocation of risk may differ from the contractual allocation.",
    keywords: ["conduct", "risk allocation", "control of risk", "financial capacity", "contractual terms"],
    version: "2022",
    relatedSections: ["1.33", "1.60"]
  },
  {
    chapter: 1,
    section: "D",
    paragraph: "1.57",
    title: "Control Over Risk",
    content: "For a party to assume a risk, it must have the capability to make decisions to take on, lay off, or decline a risk-bearing opportunity and must actually perform that decision-making function. Control over risk requires both the capability to make decisions and the actual performance of decision-making functions.",
    keywords: ["control", "risk", "decision-making", "capability", "risk assumption"],
    version: "2022",
    relatedSections: ["1.56", "1.58", "1.60"]
  },
  {
    chapter: 1,
    section: "D",
    paragraph: "1.60",
    title: "Financial Capacity to Assume Risk",
    content: "The party assuming a risk must have access to funding to take on the risk or to lay off the risk, and to bear the consequences of the risk if it materializes. A party can have access to funding either through its own assets or through access to capital.",
    keywords: ["financial capacity", "funding", "risk assumption", "capital", "assets"],
    version: "2022",
    relatedSections: ["1.57", "1.61"]
  },

  // ========== CHAPTER II: TRANSFER PRICING METHODS ==========
  {
    chapter: 2,
    section: "A",
    paragraph: "2.1",
    title: "Selection of Transfer Pricing Method",
    content: "The selection of a transfer pricing method always aims at finding the most appropriate method for a particular case. The selection process should take account of the respective strengths and weaknesses of the OECD recognised methods.",
    keywords: ["method selection", "most appropriate method", "MAM", "transfer pricing methods"],
    version: "2022",
    relatedSections: ["2.2", "2.3", "2.4"]
  },
  {
    chapter: 2,
    section: "A",
    paragraph: "2.2",
    title: "Factors for Method Selection",
    content: "The following factors should be taken into account when selecting the most appropriate method: the respective strengths and weaknesses of each method; the nature of the controlled transaction; the availability of reliable information; the degree of comparability between controlled and uncontrolled transactions.",
    keywords: ["method selection", "comparability", "reliable information", "transaction nature"],
    version: "2022",
    relatedSections: ["2.1", "2.3"]
  },
  {
    chapter: 2,
    section: "B",
    paragraph: "2.14",
    title: "Comparable Uncontrolled Price Method (CUP)",
    content: "The CUP method compares the price charged for property or services transferred in a controlled transaction to the price charged for property or services transferred in a comparable uncontrolled transaction in comparable circumstances.",
    keywords: ["CUP", "comparable uncontrolled price", "traditional method", "price comparison"],
    version: "2022",
    relatedSections: ["2.15", "2.16", "2.17"]
  },
  {
    chapter: 2,
    section: "B",
    paragraph: "2.21",
    title: "Resale Price Method (RPM)",
    content: "The resale price method begins with the price at which a product that has been purchased from an associated enterprise is resold to an independent enterprise. This resale price is then reduced by an appropriate gross margin representing the reselling enterprise's costs and an appropriate profit.",
    keywords: ["RPM", "resale price method", "gross margin", "distribution", "reseller"],
    version: "2022",
    relatedSections: ["2.22", "2.27", "2.28"]
  },
  {
    chapter: 2,
    section: "B",
    paragraph: "2.39",
    title: "Cost Plus Method (CPM)",
    content: "The cost plus method begins with the costs incurred by the supplier of property or services in a controlled transaction for property transferred or services provided to an associated purchaser. An appropriate cost plus mark up is then added to this cost, to make an appropriate profit in light of the functions performed and the market conditions.",
    keywords: ["CPM", "cost plus method", "mark up", "manufacturing", "services"],
    version: "2022",
    relatedSections: ["2.40", "2.41", "2.45"]
  },
  {
    chapter: 2,
    section: "C",
    paragraph: "2.58",
    title: "Transactional Net Margin Method (TNMM)",
    content: "The transactional net margin method examines the net profit relative to an appropriate base (e.g. costs, sales, assets) that a taxpayer realises from a controlled transaction. The TNMM operates in a manner similar to the cost plus and resale price methods, but differs in that it examines net profit rather than gross profit.",
    keywords: ["TNMM", "net margin", "profit level indicator", "PLI", "net profit"],
    version: "2022",
    relatedSections: ["2.59", "2.64", "2.65"]
  },
  {
    chapter: 2,
    section: "C",
    paragraph: "2.64",
    title: "Profit Level Indicators",
    content: "A net profit indicator measures the relationship between net profit and an appropriate base such as sales, costs, or assets. The net profit indicators used in the TNMM should be determined so as to be reliable measures of arm's length profitability.",
    keywords: ["PLI", "profit level indicator", "net profit", "operating margin", "return on assets"],
    version: "2022",
    relatedSections: ["2.58", "2.65", "2.76"]
  },
  {
    chapter: 2,
    section: "D",
    paragraph: "2.114",
    title: "Transactional Profit Split Method",
    content: "The transactional profit split method seeks to eliminate the effect on profits of special conditions made or imposed in a controlled transaction by determining the division of profits that independent enterprises would have expected to realise from engaging in the transaction or transactions.",
    keywords: ["profit split", "PSM", "combined profit", "unique intangibles", "highly integrated"],
    version: "2022",
    relatedSections: ["2.115", "2.118", "2.131"]
  },
  {
    chapter: 2,
    section: "D",
    paragraph: "2.118",
    title: "Profit Split Circumstances",
    content: "The profit split method is most appropriate where both parties make unique and valuable contributions to the transaction or where the operations are highly integrated such that the contributions of the parties cannot be evaluated in isolation.",
    keywords: ["profit split", "unique contributions", "valuable intangibles", "integrated operations"],
    version: "2022",
    relatedSections: ["2.114", "2.119", "2.131"]
  },

  // ========== CHAPTER III: COMPARABILITY ANALYSIS ==========
  {
    chapter: 3,
    section: "A",
    paragraph: "3.1",
    title: "Typical Comparability Analysis Process",
    content: "A comparability analysis involves a nine-step process: Step 1 - Determination of years to be covered; Step 2 - Broad-based analysis of circumstances; Step 3 - Understanding the controlled transaction; Step 4 - Review of existing internal comparables; Step 5 - Determine available external sources; Step 6 - Select most appropriate method; Step 7 - Identify potential comparables; Step 8 - Determine and make adjustments; Step 9 - Interpret and use data.",
    keywords: ["nine step process", "comparability analysis", "methodology", "search strategy"],
    version: "2022",
    relatedSections: ["3.2", "3.4", "3.5"]
  },
  {
    chapter: 3,
    section: "A",
    paragraph: "3.4",
    title: "Comparability Factors",
    content: "There are five comparability factors that may be important when determining comparability: (i) the characteristics of property or services transferred; (ii) the functions performed by parties, assets used and risks assumed; (iii) the contractual terms; (iv) the economic circumstances; and (v) the business strategies.",
    keywords: ["comparability factors", "five factors", "FAR analysis", "characteristics", "economic circumstances"],
    version: "2022",
    relatedSections: ["3.1", "3.5", "3.18"]
  },
  {
    chapter: 3,
    section: "B",
    paragraph: "3.18",
    title: "Functional Analysis",
    content: "In transactions between two independent enterprises, compensation usually will reflect the functions that each enterprise performs, taking into account assets used and risks assumed. A functional analysis seeks to identify the economically significant activities and responsibilities undertaken, assets used, and risks assumed by the parties to transactions.",
    keywords: ["functional analysis", "FAR", "functions", "assets", "risks", "economically significant"],
    version: "2022",
    relatedSections: ["3.4", "3.19", "3.24"]
  },
  {
    chapter: 3,
    section: "C",
    paragraph: "3.38",
    title: "Internal Comparables",
    content: "Internal comparables, because of their closer relationship to the tested transaction, may have a more direct and closer relationship to the controlled transaction than external comparables. Their use eliminates to some extent the difficulties in finding sources of information on external comparables.",
    keywords: ["internal comparables", "tested transaction", "closer relationship", "information sources"],
    version: "2022",
    relatedSections: ["3.39", "3.40", "3.46"]
  },
  {
    chapter: 3,
    section: "D",
    paragraph: "3.55",
    title: "Arm's Length Range",
    content: "In some cases it will be possible to apply the arm's length principle to arrive at a single figure that is the most reliable measure of an arm's length price or profit. However, because transfer pricing is not an exact science, there will also be many situations where the application of the most appropriate method produces a range of figures.",
    keywords: ["arm's length range", "interquartile range", "IQR", "single point", "range of figures"],
    version: "2022",
    relatedSections: ["3.56", "3.57", "3.62"]
  },
  {
    chapter: 3,
    section: "D",
    paragraph: "3.57",
    title: "Interquartile Range",
    content: "Statistical tools that take account of central tendency to narrow the range may assist the analysis of arm's length range. For instance, the interquartile range may assist in focusing the analysis. The interquartile range consists of the range from the 25th to the 75th percentile of the results derived from the comparable set.",
    keywords: ["interquartile range", "IQR", "25th percentile", "75th percentile", "central tendency", "statistics"],
    version: "2022",
    relatedSections: ["3.55", "3.58", "3.62"]
  },

  // ========== CHAPTER IV: ADMINISTRATIVE APPROACHES ==========
  {
    chapter: 4,
    section: "A",
    paragraph: "4.1",
    title: "Introduction to Administrative Approaches",
    content: "This chapter examines various administrative approaches that may be used to avoid and resolve transfer pricing disputes. These approaches include compliance practices, corresponding adjustments, the mutual agreement procedure, safe harbours, advance pricing arrangements, and other procedures.",
    keywords: ["administrative approaches", "dispute resolution", "compliance", "MAP", "APA", "safe harbour"],
    version: "2022",
    relatedSections: ["4.2", "4.95", "4.123"]
  },
  {
    chapter: 4,
    section: "C",
    paragraph: "4.29",
    title: "Corresponding Adjustments",
    content: "Where a tax administration of one country adjusts the profits of an enterprise in accordance with Article 9, the other country needs to make a corresponding adjustment to the profits of the associated enterprise to avoid double taxation.",
    keywords: ["corresponding adjustment", "Article 9", "double taxation", "economic double taxation"],
    version: "2022",
    relatedSections: ["4.30", "4.31", "4.32"]
  },
  {
    chapter: 4,
    section: "D",
    paragraph: "4.95",
    title: "Safe Harbours",
    content: "A safe harbour is a provision that applies to a defined category of taxpayers or transactions and that relieves eligible taxpayers from certain obligations otherwise imposed by a country's general transfer pricing rules. It may take different forms, including exemptions from general rules, simplified procedural obligations, or simplified methods for determining arm's length prices.",
    keywords: ["safe harbour", "simplification", "compliance burden", "eligible taxpayers", "threshold"],
    version: "2022",
    relatedSections: ["4.96", "4.102", "4.115"]
  },
  {
    chapter: 4,
    section: "E",
    paragraph: "4.123",
    title: "Advance Pricing Arrangements",
    content: "An advance pricing arrangement (APA) is an arrangement that determines, in advance of controlled transactions, an appropriate set of criteria for the determination of the transfer pricing for those transactions over a fixed period of time.",
    keywords: ["APA", "advance pricing arrangement", "bilateral APA", "unilateral APA", "certainty"],
    version: "2022",
    relatedSections: ["4.124", "4.130", "4.145"]
  },

  // ========== CHAPTER V: DOCUMENTATION ==========
  {
    chapter: 5,
    section: "A",
    paragraph: "5.1",
    title: "Introduction to Documentation",
    content: "Transfer pricing documentation requirements should be designed to provide tax administrations with the information necessary to conduct an informed transfer pricing risk assessment and, where necessary, to conduct a comprehensive audit of the transfer pricing positions of a taxpayer.",
    keywords: ["documentation", "risk assessment", "audit", "compliance", "information requirements"],
    version: "2022",
    relatedSections: ["5.2", "5.5", "5.16"]
  },
  {
    chapter: 5,
    section: "B",
    paragraph: "5.16",
    title: "Three-Tiered Documentation",
    content: "The guidance recommends a standardised three-tiered approach to transfer pricing documentation, consisting of (i) a master file containing standardised information relevant for all MNE group members; (ii) a local file referring specifically to material transactions of the local taxpayer; and (iii) a Country-by-Country Report.",
    keywords: ["three-tiered", "master file", "local file", "CbCR", "country-by-country report"],
    version: "2022",
    relatedSections: ["5.17", "5.18", "5.25"]
  },
  {
    chapter: 5,
    section: "C",
    paragraph: "5.18",
    title: "Master File",
    content: "The master file provides an overview of the MNE group business including the nature of its global business operations, its overall transfer pricing policies, and its global allocation of income and economic activity. The master file should provide a high-level overview to place the MNE group's transfer pricing practices in their global economic, legal, financial and tax context.",
    keywords: ["master file", "global overview", "MNE group", "transfer pricing policies", "organizational structure"],
    version: "2022",
    relatedSections: ["5.16", "5.19", "Annex I"]
  },
  {
    chapter: 5,
    section: "C",
    paragraph: "5.22",
    title: "Local File",
    content: "The local file provides more detailed information relating to specific intercompany transactions. The information required in the local file supplements the master file and helps to ensure that the taxpayer has complied with the arm's length principle in its material transfer pricing positions.",
    keywords: ["local file", "intercompany transactions", "specific transactions", "material transactions", "compliance"],
    version: "2022",
    relatedSections: ["5.16", "5.18", "Annex II"]
  },
  {
    chapter: 5,
    section: "D",
    paragraph: "5.25",
    title: "Country-by-Country Report",
    content: "The Country-by-Country Report requires aggregate tax jurisdiction-wide information relating to the global allocation of the income, the taxes paid, and certain indicators of the location of economic activity among tax jurisdictions in which the MNE group operates.",
    keywords: ["CbCR", "country-by-country report", "BEPS Action 13", "tax jurisdiction", "allocation"],
    version: "2022",
    relatedSections: ["5.16", "5.26", "5.27"]
  },

  // ========== CHAPTER VI: INTANGIBLES ==========
  {
    chapter: 6,
    section: "A",
    paragraph: "6.6",
    title: "Definition of Intangible",
    content: "For purposes of these Guidelines, the word 'intangible' is intended to address something which is not a physical asset or a financial asset, which is capable of being owned or controlled for use in commercial activities, and whose use or transfer would be compensated had it occurred in a transaction between independent parties in comparable circumstances.",
    keywords: ["intangible", "definition", "intellectual property", "know-how", "trade intangibles"],
    version: "2022",
    relatedSections: ["6.7", "6.15", "6.16"]
  },
  {
    chapter: 6,
    section: "B",
    paragraph: "6.32",
    title: "Legal Ownership of Intangibles",
    content: "Legal ownership of intangibles by an MNE group member, on its own, does not confer any right ultimately to retain returns derived by the MNE group from exploiting the intangible. Legal ownership, standing alone, without the performance of functions, use of assets, or assumption of risks, does not entitle an entity to arm's length compensation from exploiting the intangible.",
    keywords: ["legal ownership", "intangible ownership", "DEMPE functions", "arm's length return"],
    version: "2022",
    relatedSections: ["6.33", "6.42", "6.48"]
  },
  {
    chapter: 6,
    section: "B",
    paragraph: "6.48",
    title: "DEMPE Functions",
    content: "The important functions relating to intangibles are those relating to the development, enhancement, maintenance, protection and exploitation (DEMPE) of intangibles. Members of the MNE group performing these important functions, controlling risks associated with these functions and contributing assets to these functions, should be appropriately compensated.",
    keywords: ["DEMPE", "development", "enhancement", "maintenance", "protection", "exploitation", "intangible functions"],
    version: "2022",
    relatedSections: ["6.32", "6.49", "6.50"]
  },
  {
    chapter: 6,
    section: "D",
    paragraph: "6.145",
    title: "Hard to Value Intangibles",
    content: "Situations in which there is uncertainty about the value of intangibles at the time of the transaction are referred to as hard-to-value intangibles (HTVI). These are intangibles for which, at the time of their transfer, (i) no reliable comparables exist; and (ii) at the time the transaction was entered into, the projections of future cash flows expected to be derived from the transferred intangible are highly uncertain.",
    keywords: ["HTVI", "hard to value intangibles", "valuation", "uncertain cash flows", "ex-post evidence"],
    version: "2022",
    relatedSections: ["6.146", "6.153", "6.192"]
  },

  // ========== CHAPTER VII: INTRA-GROUP SERVICES ==========
  {
    chapter: 7,
    section: "A",
    paragraph: "7.2",
    title: "Main Issues - Intra-Group Services",
    content: "The main issues to be addressed in the transfer pricing analysis of intra-group services are: (i) determining whether services have in fact been provided; (ii) determining whether the intra-group charge is consistent with the arm's length principle.",
    keywords: ["intra-group services", "benefit test", "arm's length charge", "service fee"],
    version: "2022",
    relatedSections: ["7.6", "7.14", "7.23"]
  },
  {
    chapter: 7,
    section: "B",
    paragraph: "7.6",
    title: "Benefit Test",
    content: "The determination of whether an intra-group service has been rendered depends on whether the activity provides a respective group member with economic or commercial value to enhance or maintain its business position. This is sometimes referred to as the 'benefit test'.",
    keywords: ["benefit test", "economic value", "commercial value", "service rendered"],
    version: "2022",
    relatedSections: ["7.2", "7.7", "7.9"]
  },
  {
    chapter: 7,
    section: "C",
    paragraph: "7.14",
    title: "Shareholder Activities",
    content: "There are certain activities that a group member performs solely because of its ownership interest in one or more other group members. These are commonly referred to as shareholder activities and they do not justify a charge to the recipient.",
    keywords: ["shareholder activities", "stewardship", "no charge", "duplicative services"],
    version: "2022",
    relatedSections: ["7.6", "7.15", "7.16"]
  },
  {
    chapter: 7,
    section: "D",
    paragraph: "7.45",
    title: "Low Value-Adding Intra-Group Services",
    content: "These Guidelines provide an elective, simplified approach for low value-adding intra-group services. Low value-adding services are services which: (i) are supportive in nature; (ii) are not part of the core business; (iii) do not require the use of unique and valuable intangibles; and (iv) do not involve assumption of significant risk.",
    keywords: ["low value-adding services", "LVAS", "simplified approach", "5% mark-up", "supportive services"],
    version: "2022",
    relatedSections: ["7.46", "7.47", "7.57"]
  },
  {
    chapter: 7,
    section: "D",
    paragraph: "7.61",
    title: "LVAS Mark-up",
    content: "The charging mechanism for low value-adding services involves applying a mark-up of 5% on the costs of providing the services. This mark-up is considered to reflect arm's length remuneration for low value-adding services.",
    keywords: ["LVAS", "5% mark-up", "cost plus", "simplified method", "arm's length"],
    version: "2022",
    relatedSections: ["7.45", "7.57", "7.62"]
  },

  // ========== CHAPTER VIII: COST CONTRIBUTION ARRANGEMENTS ==========
  {
    chapter: 8,
    section: "A",
    paragraph: "8.3",
    title: "Definition of CCA",
    content: "A cost contribution arrangement (CCA) is a contractual arrangement among business enterprises to share the contributions and risks involved in the joint development, production or obtaining of intangibles, tangible assets or services with the understanding that such intangibles, tangible assets or services are expected to create benefits for the individual businesses of each of the participants.",
    keywords: ["CCA", "cost contribution arrangement", "joint development", "shared contributions", "expected benefits"],
    version: "2022",
    relatedSections: ["8.4", "8.5", "8.7"]
  },
  {
    chapter: 8,
    section: "B",
    paragraph: "8.10",
    title: "Participants in CCA",
    content: "Only enterprises having a reasonable expectation of benefit from the CCA activity should be considered as participants. A participant must have the capability to exercise control over the specific risks it assumes under the CCA and must have the financial capacity to assume those risks.",
    keywords: ["CCA participants", "expected benefits", "control", "financial capacity", "risk assumption"],
    version: "2022",
    relatedSections: ["8.3", "8.11", "8.14"]
  },
  {
    chapter: 8,
    section: "C",
    paragraph: "8.26",
    title: "CCA Contributions",
    content: "Each participant's contribution should be consistent with what a comparable independent enterprise would have agreed to contribute under comparable circumstances given the reasonably anticipated benefits it expects to receive from the arrangement.",
    keywords: ["CCA contributions", "anticipated benefits", "proportionate share", "arm's length contribution"],
    version: "2022",
    relatedSections: ["8.10", "8.27", "8.31"]
  },
  {
    chapter: 8,
    section: "D",
    paragraph: "8.42",
    title: "Buy-In Payments",
    content: "When a participant enters into an already active CCA, or when an existing participant acquires an increased interest in the rights arising out of CCA activity, a buy-in payment may be required. The arm's length buy-in payment should be consistent with what an independent enterprise would have paid under comparable circumstances.",
    keywords: ["buy-in payment", "CCA entry", "arm's length payment", "joining participant"],
    version: "2022",
    relatedSections: ["8.41", "8.43", "8.45"]
  },

  // ========== CHAPTER IX: BUSINESS RESTRUCTURINGS ==========
  {
    chapter: 9,
    section: "A",
    paragraph: "9.1",
    title: "Scope of Business Restructuring Chapter",
    content: "This chapter provides guidance on the transfer pricing aspects of business restructurings. For purposes of this chapter, business restructurings cover the cross-border redeployment by a multinational enterprise of functions, assets and/or risks.",
    keywords: ["business restructuring", "redeployment", "functions", "assets", "risks", "cross-border"],
    version: "2022",
    relatedSections: ["9.2", "9.18", "9.36"]
  },
  {
    chapter: 9,
    section: "B",
    paragraph: "9.18",
    title: "Recognition of Restructuring Transaction",
    content: "In considering whether the restructuring arrangement as accurately delineated would have been entered into by independent parties, it is relevant to consider the realistic options available to the parties at the time of the restructuring.",
    keywords: ["restructuring recognition", "realistic options", "arm's length", "delineation"],
    version: "2022",
    relatedSections: ["9.1", "9.19", "9.36"]
  },
  {
    chapter: 9,
    section: "C",
    paragraph: "9.36",
    title: "Arm's Length Compensation for Restructuring",
    content: "When a business restructuring involves a transfer of something of value from one group company to another, arm's length compensation should be provided. The question of whether arm's length compensation is due depends on an analysis of what functions, assets and risks have been transferred.",
    keywords: ["restructuring compensation", "transfer of value", "arm's length", "FAR transfer"],
    version: "2022",
    relatedSections: ["9.1", "9.18", "9.66"]
  },
  {
    chapter: 9,
    section: "D",
    paragraph: "9.66",
    title: "Post-Restructuring Remuneration",
    content: "Post-restructuring arrangements should be compensated on an arm's length basis. The question is whether the remuneration allocated to the restructured entity's activities is arm's length in light of the functions it performs, the assets it uses and the risks it assumes.",
    keywords: ["post-restructuring", "remuneration", "arm's length", "restructured entity"],
    version: "2022",
    relatedSections: ["9.36", "9.67", "9.85"]
  },

  // ========== CHAPTER X: FINANCIAL TRANSACTIONS ==========
  {
    chapter: 10,
    section: "A",
    paragraph: "10.1",
    title: "Introduction to Financial Transactions",
    content: "This chapter provides guidance for determining the arm's length conditions for intra-group financial transactions. The guidance applies to loans, cash pooling arrangements, hedging, financial guarantees and captive insurance arrangements.",
    keywords: ["financial transactions", "intra-group loans", "cash pooling", "guarantees", "captive insurance"],
    version: "2022",
    relatedSections: ["10.2", "10.55", "10.155"]
  },
  {
    chapter: 10,
    section: "B",
    paragraph: "10.55",
    title: "Accurately Delineating Financial Transactions",
    content: "In accurately delineating the transaction it will be important to consider all economically relevant characteristics which include the terms of the instrument, the functional analysis, the characteristics of the financial products, the circumstances of the borrower and the business strategy.",
    keywords: ["delineation", "financial transactions", "loan terms", "borrower circumstances", "economically relevant"],
    version: "2022",
    relatedSections: ["10.1", "10.56", "10.64"]
  },
  {
    chapter: 10,
    section: "B",
    paragraph: "10.64",
    title: "Loan vs Equity",
    content: "In some cases, the purported loan may actually have the character of equity. Factors such as the absence of a fixed repayment date, the obligation to pay interest contingent on earnings, subordination to trade creditors, and the lack of financial covenants may indicate that the purported loan is more in the nature of equity.",
    keywords: ["loan vs equity", "debt characterization", "thin capitalization", "recharacterization"],
    version: "2022",
    relatedSections: ["10.55", "10.65", "10.78"]
  },
  {
    chapter: 10,
    section: "C",
    paragraph: "10.78",
    title: "Treasury Functions and Interest Rates",
    content: "The interest rate on an intra-group loan should be determined considering all economically relevant factors. These include the amount of the loan, its maturity, the schedule of repayment, the currency, the creditworthiness of the borrower, any guarantees, and any covenants.",
    keywords: ["interest rate", "treasury", "intra-group loan", "creditworthiness", "loan terms"],
    version: "2022",
    relatedSections: ["10.55", "10.79", "10.100"]
  },
  {
    chapter: 10,
    section: "D",
    paragraph: "10.119",
    title: "Cash Pooling",
    content: "A cash pool is a cash management arrangement whereby the cash balances and cash requirements of various entities within an MNE group are consolidated. In the physical cash pooling arrangement, the pool leader will typically sweep the debit and credit balances of pool participants at the end of each day.",
    keywords: ["cash pooling", "cash management", "pool leader", "treasury", "sweeping"],
    version: "2022",
    relatedSections: ["10.120", "10.126", "10.135"]
  },
  {
    chapter: 10,
    section: "E",
    paragraph: "10.155",
    title: "Financial Guarantees",
    content: "A financial guarantee is an undertaking by one party to assume a specific borrower's debt obligation in the event of a default. The transfer pricing analysis of financial guarantees should first accurately delineate the transaction by examining the contractual arrangements and the conduct of the parties.",
    keywords: ["financial guarantee", "credit enhancement", "implicit support", "guarantee fee"],
    version: "2022",
    relatedSections: ["10.156", "10.166", "10.175"]
  },
  {
    chapter: 10,
    section: "E",
    paragraph: "10.166",
    title: "Implicit Support",
    content: "The potential for implicit support arising from group membership should be distinguished from explicit guarantees. Implicit support may arise from passive association with the MNE group and does not warrant a guarantee fee.",
    keywords: ["implicit support", "passive association", "group membership", "no fee", "credit uplift"],
    version: "2022",
    relatedSections: ["10.155", "10.167", "10.175"]
  },
  {
    chapter: 10,
    section: "F",
    paragraph: "10.199",
    title: "Captive Insurance",
    content: "A captive insurance arrangement is one in which a subsidiary of a multinational group, the 'captive', provides insurance or reinsurance coverage for risks of other members of the group. The transfer pricing analysis should examine whether the arrangement constitutes insurance from a transfer pricing perspective.",
    keywords: ["captive insurance", "risk transfer", "insurance arrangement", "reinsurance", "premium"],
    version: "2022",
    relatedSections: ["10.200", "10.205", "10.224"]
  }
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get guidelines by chapter number
 */
export function getGuidelinesByChapter(chapter: number): OECDGuideline[] {
  return OECD_GUIDELINES.filter(g => g.chapter === chapter);
}

/**
 * Get a specific guideline by chapter and paragraph
 */
export function getGuideline(chapter: number, paragraph: string): OECDGuideline | undefined {
  return OECD_GUIDELINES.find(g => g.chapter === chapter && g.paragraph === paragraph);
}

/**
 * Get chapter information
 */
export function getChapterInfo(chapter: number): OECDChapter | undefined {
  return OECD_CHAPTERS.find(c => c.number === chapter);
}

/**
 * Get all guidelines related to a specific keyword
 */
export function getGuidelinesByKeyword(keyword: string): OECDGuideline[] {
  const lowerKeyword = keyword.toLowerCase();
  return OECD_GUIDELINES.filter(g =>
    g.keywords.some(k => k.toLowerCase().includes(lowerKeyword))
  );
}

/**
 * Get guidelines by multiple keywords (OR logic)
 */
export function getGuidelinesByKeywords(keywords: string[]): OECDGuideline[] {
  const lowerKeywords = keywords.map(k => k.toLowerCase());
  return OECD_GUIDELINES.filter(g =>
    g.keywords.some(gk => lowerKeywords.some(k => gk.toLowerCase().includes(k)))
  );
}

/**
 * Get related guidelines for a given paragraph
 */
export function getRelatedGuidelines(chapter: number, paragraph: string): OECDGuideline[] {
  const guideline = getGuideline(chapter, paragraph);
  if (!guideline) return [];

  return guideline.relatedSections
    .map(ref => {
      // Handle references like "1.2" or "Annex I"
      const match = ref.match(/^(\d+)\.(\d+)$/);
      if (match) {
        return getGuideline(parseInt(match[1]), ref);
      }
      return undefined;
    })
    .filter((g): g is OECDGuideline => g !== undefined);
}

/**
 * Get all chapter titles
 */
export function getAllChapterTitles(): { chapter: number; title: string }[] {
  return OECD_CHAPTERS.map(c => ({ chapter: c.number, title: c.title }));
}

/**
 * Get guidelines relevant to a specific TP method
 */
export function getGuidelinesForMethod(method: "CUP" | "RPM" | "CPM" | "TNMM" | "PSM"): OECDGuideline[] {
  const methodKeywords: Record<string, string[]> = {
    CUP: ["CUP", "comparable uncontrolled price"],
    RPM: ["RPM", "resale price method", "resale price"],
    CPM: ["CPM", "cost plus method", "cost plus"],
    TNMM: ["TNMM", "net margin", "profit level indicator"],
    PSM: ["profit split", "PSM", "combined profit"]
  };

  return getGuidelinesByKeywords(methodKeywords[method] || []);
}

/**
 * Get guidelines relevant to a transaction type
 */
export function getGuidelinesForTransactionType(
  type: "goods" | "services" | "intangibles" | "financial" | "restructuring"
): OECDGuideline[] {
  const typeKeywords: Record<string, string[]> = {
    goods: ["property", "goods", "tangible", "manufacturing"],
    services: ["services", "intra-group services", "LVAS", "benefit test"],
    intangibles: ["intangible", "DEMPE", "HTVI", "intellectual property"],
    financial: ["loan", "interest rate", "guarantee", "cash pooling", "captive insurance"],
    restructuring: ["restructuring", "redeployment", "post-restructuring"]
  };

  return getGuidelinesByKeywords(typeKeywords[type] || []);
}

// =============================================================================
// VERSION INFO
// =============================================================================

export const OECD_GUIDELINES_VERSION = {
  version: "2022",
  published: "January 2022",
  source: "OECD Transfer Pricing Guidelines for Multinational Enterprises and Tax Administrations",
  chapters: 10,
  totalGuidelines: OECD_GUIDELINES.length,
  lastUpdated: "2025-01-29"
};
