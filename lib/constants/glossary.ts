/**
 * Transfer Pricing Glossary
 * Comprehensive definitions of TP terms for user education
 */

export interface GlossaryTerm {
  term: string;
  abbreviation?: string;
  definition: string;
  example?: string;
  relatedTerms?: string[];
  category: "method" | "form" | "concept" | "regulation" | "calculation" | "entity";
}

export const TP_GLOSSARY: GlossaryTerm[] = [
  // TP Methods
  {
    term: "Arm's Length Price",
    abbreviation: "ALP",
    definition: "The price at which two unrelated parties would transact in an open market. Transfer pricing regulations require related party transactions to be priced at arm's length.",
    example: "If Company A sells goods to its subsidiary at Rs. 100, the ALP is what Company A would charge an unrelated buyer.",
    relatedTerms: ["TNMM", "CUP", "Comparable"],
    category: "concept",
  },
  {
    term: "Transactional Net Margin Method",
    abbreviation: "TNMM",
    definition: "A transfer pricing method that compares the net profit margin of a tested party to those of comparable uncontrolled transactions. Most commonly used method in India.",
    example: "If comparable companies earn 12-18% OP/OC margin, the tested party's margin should fall within this range.",
    relatedTerms: ["PLI", "OP/OC", "Comparable"],
    category: "method",
  },
  {
    term: "Comparable Uncontrolled Price",
    abbreviation: "CUP",
    definition: "A transfer pricing method that compares the price charged in a controlled transaction to the price in a comparable uncontrolled transaction.",
    example: "Using market prices for commodities to benchmark related party commodity purchases.",
    relatedTerms: ["ALP", "Internal CUP", "External CUP"],
    category: "method",
  },
  {
    term: "Cost Plus Method",
    abbreviation: "CPM",
    definition: "A transfer pricing method that adds an appropriate markup to the costs incurred by a supplier in a controlled transaction.",
    example: "If manufacturing costs are Rs. 100 and comparable markup is 15%, the arm's length price would be Rs. 115.",
    relatedTerms: ["Markup", "Manufacturing"],
    category: "method",
  },

  // PLI Types
  {
    term: "Profit Level Indicator",
    abbreviation: "PLI",
    definition: "A financial ratio used to compare the profitability of a tested party with comparable companies. Common PLIs include OP/OC, OP/OR, and Berry Ratio.",
    example: "OP/OC of 15% means operating profit is 15% of operating costs.",
    relatedTerms: ["OP/OC", "OP/OR", "TNMM"],
    category: "calculation",
  },
  {
    term: "Operating Profit to Operating Cost",
    abbreviation: "OP/OC",
    definition: "A PLI calculated as Operating Profit divided by Operating Cost. Most commonly used PLI for service providers in India.",
    example: "Operating Profit Rs. 15 Cr / Operating Cost Rs. 100 Cr = 15% OP/OC",
    relatedTerms: ["PLI", "TNMM", "Safe Harbour"],
    category: "calculation",
  },
  {
    term: "Operating Profit to Operating Revenue",
    abbreviation: "OP/OR",
    definition: "A PLI calculated as Operating Profit divided by Operating Revenue (Sales). Also known as Operating Margin.",
    example: "Operating Profit Rs. 15 Cr / Revenue Rs. 115 Cr = 13% OP/OR",
    relatedTerms: ["PLI", "Operating Margin"],
    category: "calculation",
  },

  // Forms & Reports
  {
    term: "Form 3CEB",
    definition: "Accountant's Report under Section 92E for international and specified domestic transactions. Must be filed by the due date of income tax return.",
    example: "Companies with international transactions exceeding Rs. 1 Cr must file Form 3CEB.",
    relatedTerms: ["Section 92E", "International Transaction"],
    category: "form",
  },
  {
    term: "Form 3CEFA",
    definition: "Safe Harbour option election form. Filed to opt for safe harbour provisions under Rule 10TD/10TE/10TF.",
    example: "IT/ITeS companies opting for safe harbour must file Form 3CEFA along with Form 3CEB.",
    relatedTerms: ["Safe Harbour", "Rule 10TD"],
    category: "form",
  },

  // Safe Harbour
  {
    term: "Safe Harbour",
    definition: "A regime where the tax authority accepts the transfer price declared by the taxpayer without detailed scrutiny, provided certain conditions and margins are met.",
    example: "IT/ITeS companies with OP/OC of 18% or more can opt for safe harbour (per CBDT Notification 117/2023).",
    relatedTerms: ["Rule 10TD", "Form 3CEFA", "OP/OC"],
    category: "regulation",
  },
  {
    term: "Rule 10TD",
    definition: "Income Tax Rule prescribing safe harbour margins for eligible international transactions including IT/ITeS, KPO, and intra-group loans.",
    example: "Rule 10TD specifies 18-24% OP/OC margins for IT/ITeS based on revenue (per CBDT Notification 117/2023).",
    relatedTerms: ["Safe Harbour", "IT/ITeS", "KPO"],
    category: "regulation",
  },

  // Entities
  {
    term: "Associated Enterprise",
    abbreviation: "AE",
    definition: "An enterprise that participates directly or indirectly in the management, control, or capital of another enterprise. Defined under Section 92A.",
    example: "Parent company, subsidiaries, and fellow subsidiaries are associated enterprises.",
    relatedTerms: ["International Transaction", "Section 92A"],
    category: "entity",
  },
  {
    term: "Transfer Pricing Officer",
    abbreviation: "TPO",
    definition: "A tax officer appointed to determine the arm's length price of international transactions. The TPO's order is binding on the Assessing Officer.",
    relatedTerms: ["ALP", "TP Adjustment"],
    category: "entity",
  },

  // Penalties
  {
    term: "Section 271(1)(c)",
    definition: "Penalty for concealment of income or furnishing inaccurate particulars. Ranges from 100% to 300% of tax sought to be evaded.",
    example: "If TP adjustment is Rs. 10 Cr and tax rate is 30%, penalty can range from Rs. 3 Cr to Rs. 9 Cr.",
    relatedTerms: ["Penalty", "Concealment"],
    category: "regulation",
  },
  {
    term: "Section 271AA",
    definition: "Penalty of 2% of transaction value for failure to keep and maintain prescribed TP documentation.",
    example: "If international transactions are Rs. 100 Cr and documentation is not maintained, penalty is Rs. 2 Cr.",
    relatedTerms: ["Documentation", "Rule 10D"],
    category: "regulation",
  },

  // Other Key Terms
  {
    term: "International Transaction",
    definition: "A transaction between associated enterprises involving purchase/sale of property, provision of services, lending/borrowing, or any other transaction having a bearing on profits.",
    example: "Software development services provided by Indian subsidiary to US parent is an international transaction.",
    relatedTerms: ["Associated Enterprise", "Section 92B"],
    category: "concept",
  },
];

// Helper function to get term by abbreviation or name
export function getGlossaryTerm(termOrAbbr: string): GlossaryTerm | undefined {
  return TP_GLOSSARY.find(
    (t) =>
      t.term.toLowerCase() === termOrAbbr.toLowerCase() ||
      t.abbreviation?.toLowerCase() === termOrAbbr.toLowerCase()
  );
}

// Helper function to search glossary
export function searchGlossary(query: string): GlossaryTerm[] {
  const lowerQuery = query.toLowerCase();
  return TP_GLOSSARY.filter(
    (t) =>
      t.term.toLowerCase().includes(lowerQuery) ||
      t.abbreviation?.toLowerCase().includes(lowerQuery) ||
      t.definition.toLowerCase().includes(lowerQuery)
  );
}

// Get terms by category
export function getTermsByCategory(category: GlossaryTerm["category"]): GlossaryTerm[] {
  return TP_GLOSSARY.filter((t) => t.category === category);
}
