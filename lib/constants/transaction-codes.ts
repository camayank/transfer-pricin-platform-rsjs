export const TRANSACTION_NATURE_CODES: Record<string, string> = {
  // Purchase Transactions (01-19)
  "01": "Purchase of raw materials",
  "02": "Purchase of finished goods",
  "03": "Purchase of capital goods",
  "04": "Purchase of traded goods for resale",
  "09": "Purchase - Others",

  // Sale Transactions (10-19)
  "10": "Sale of raw materials",
  "11": "Sale of finished goods",
  "12": "Sale of capital goods",
  "13": "Sale of traded goods",
  "14": "Sale of scrap",
  "19": "Sale - Others",

  // Services - Payment (20-29)
  "20": "Payment for software development services",
  "21": "Payment for IT enabled services",
  "22": "Payment for support services",
  "23": "Payment for management services",
  "24": "Payment for technical services",
  "25": "Payment for R&D services",
  "26": "Payment for contract manufacturing",
  "29": "Payment for services - Others",

  // Services - Receipt (30-39)
  "30": "Receipt for software development services",
  "31": "Receipt for IT enabled services",
  "32": "Receipt for support services",
  "33": "Receipt for management services",
  "34": "Receipt for technical services",
  "35": "Receipt for R&D services",
  "36": "Receipt for contract manufacturing",
  "39": "Receipt for services - Others",

  // Royalty/License (40-49)
  "40": "Payment of royalty for use of intangible",
  "41": "Payment of royalty for technology",
  "42": "Receipt of royalty for use of intangible",
  "43": "Receipt of royalty for technology",
  "44": "Payment for use of trademark/brand",
  "45": "Receipt for use of trademark/brand",
  "49": "Royalty/License - Others",

  // Financial Transactions (50-59)
  "50": "Interest paid on borrowings",
  "51": "Interest paid on debentures/bonds",
  "52": "Interest paid on ECBs",
  "53": "Interest received on loans given",
  "54": "Interest received on deposits",
  "55": "Guarantee commission paid",
  "56": "Guarantee commission received",
  "59": "Financial transactions - Others",

  // Capital Transactions (60-69)
  "60": "Issue of equity shares",
  "61": "Issue of preference shares",
  "62": "Issue of debentures/bonds",
  "63": "Buyback of shares",
  "69": "Capital transactions - Others",

  // Reimbursements (70-79)
  "70": "Reimbursement of expenses - paid",
  "71": "Reimbursement of expenses - received",
  "72": "Cost allocation - paid",
  "73": "Cost allocation - received",
  "79": "Reimbursements - Others",

  // Others (90-99)
  "90": "Lease rentals paid",
  "91": "Lease rentals received",
  "92": "Commission paid",
  "93": "Commission received",
  "99": "Any other transaction",
};

export const TP_METHODS = {
  CUP: "Comparable Uncontrolled Price Method",
  RPM: "Resale Price Method",
  CPM: "Cost Plus Method",
  PSM: "Profit Split Method",
  TNMM: "Transactional Net Margin Method",
  OTHER: "Other Method (specify)",
};

export const PLI_TYPES = {
  "OP/OC": "Operating Profit / Operating Cost",
  "OP/OR": "Operating Profit / Operating Revenue (Net Margin)",
  "OP/TA": "Operating Profit / Total Assets (ROA)",
  "OP/CE": "Operating Profit / Capital Employed (ROCE)",
  "GP/Sales": "Gross Profit / Sales",
  Berry: "Gross Profit / Operating Expenses",
};

// Group transaction codes by category
export const TRANSACTION_CATEGORIES = {
  PURCHASE: ["01", "02", "03", "04", "09"],
  SALE: ["10", "11", "12", "13", "14", "19"],
  SERVICE_PAYMENT: ["20", "21", "22", "23", "24", "25", "26", "29"],
  SERVICE_RECEIPT: ["30", "31", "32", "33", "34", "35", "36", "39"],
  ROYALTY_LICENSE: ["40", "41", "42", "43", "44", "45", "49"],
  FINANCIAL: ["50", "51", "52", "53", "54", "55", "56", "59"],
  CAPITAL: ["60", "61", "62", "63", "69"],
  REIMBURSEMENT: ["70", "71", "72", "73", "79"],
  OTHER: ["90", "91", "92", "93", "99"],
};
