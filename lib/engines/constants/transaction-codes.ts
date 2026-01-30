/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Form 3CEB Transaction Nature Codes
 *
 * Based on: Form 3CEB (Transfer Pricing Audit Report) - Schema Version 1.4
 * Reference: Income Tax Rules, Rule 10E
 * ================================================================================
 */

// =============================================================================
// TRANSACTION NATURE CODES (FORM 3CEB)
// =============================================================================

/**
 * Complete list of transaction nature codes as per Form 3CEB
 * Organized by category for easier selection
 */
export const TRANSACTION_NATURE_CODES = {
  // =========================================================================
  // PURCHASE TRANSACTIONS (01-09)
  // =========================================================================
  "01": {
    code: "01",
    description: "Purchase of raw materials",
    category: "purchase",
    shortName: "Raw Materials Purchase",
    direction: "outflow",
    typicalMethod: "CUP",
  },
  "02": {
    code: "02",
    description: "Purchase of finished goods",
    category: "purchase",
    shortName: "Finished Goods Purchase",
    direction: "outflow",
    typicalMethod: "CUP",
  },
  "03": {
    code: "03",
    description: "Purchase of capital goods",
    category: "purchase",
    shortName: "Capital Goods Purchase",
    direction: "outflow",
    typicalMethod: "CUP",
  },
  "04": {
    code: "04",
    description: "Purchase of traded goods for resale",
    category: "purchase",
    shortName: "Traded Goods Purchase",
    direction: "outflow",
    typicalMethod: "RPM",
  },
  "05": {
    code: "05",
    description: "Purchase of tangible property (other than above)",
    category: "purchase",
    shortName: "Other Tangible Purchase",
    direction: "outflow",
    typicalMethod: "CUP",
  },
  "06": {
    code: "06",
    description: "Purchase of components/spare parts",
    category: "purchase",
    shortName: "Components Purchase",
    direction: "outflow",
    typicalMethod: "CUP",
  },
  "07": {
    code: "07",
    description: "Purchase of consumables/stores",
    category: "purchase",
    shortName: "Consumables Purchase",
    direction: "outflow",
    typicalMethod: "CUP",
  },
  "08": {
    code: "08",
    description: "Purchase under hire purchase/lease arrangement",
    category: "purchase",
    shortName: "Hire Purchase",
    direction: "outflow",
    typicalMethod: "CUP",
  },
  "09": {
    code: "09",
    description: "Purchase - Others (specify)",
    category: "purchase",
    shortName: "Other Purchase",
    direction: "outflow",
    typicalMethod: "OTHER",
  },

  // =========================================================================
  // SALE TRANSACTIONS (10-19)
  // =========================================================================
  "10": {
    code: "10",
    description: "Sale of raw materials",
    category: "sale",
    shortName: "Raw Materials Sale",
    direction: "inflow",
    typicalMethod: "CUP",
  },
  "11": {
    code: "11",
    description: "Sale of finished goods",
    category: "sale",
    shortName: "Finished Goods Sale",
    direction: "inflow",
    typicalMethod: "CUP",
  },
  "12": {
    code: "12",
    description: "Sale of capital goods",
    category: "sale",
    shortName: "Capital Goods Sale",
    direction: "inflow",
    typicalMethod: "CUP",
  },
  "13": {
    code: "13",
    description: "Sale of traded goods",
    category: "sale",
    shortName: "Traded Goods Sale",
    direction: "inflow",
    typicalMethod: "RPM",
  },
  "14": {
    code: "14",
    description: "Sale of scrap",
    category: "sale",
    shortName: "Scrap Sale",
    direction: "inflow",
    typicalMethod: "CUP",
  },
  "15": {
    code: "15",
    description: "Sale of tangible property (other than above)",
    category: "sale",
    shortName: "Other Tangible Sale",
    direction: "inflow",
    typicalMethod: "CUP",
  },
  "16": {
    code: "16",
    description: "Sale of components/spare parts",
    category: "sale",
    shortName: "Components Sale",
    direction: "inflow",
    typicalMethod: "CUP",
  },
  "17": {
    code: "17",
    description: "Sale of consumables/stores",
    category: "sale",
    shortName: "Consumables Sale",
    direction: "inflow",
    typicalMethod: "CUP",
  },
  "18": {
    code: "18",
    description: "Sale under hire/lease arrangement",
    category: "sale",
    shortName: "Hire/Lease Sale",
    direction: "inflow",
    typicalMethod: "CUP",
  },
  "19": {
    code: "19",
    description: "Sale - Others (specify)",
    category: "sale",
    shortName: "Other Sale",
    direction: "inflow",
    typicalMethod: "OTHER",
  },

  // =========================================================================
  // SERVICES - PAYMENT (20-29)
  // =========================================================================
  "20": {
    code: "20",
    description: "Payment for software development services",
    category: "services_payment",
    shortName: "Software Dev Payment",
    direction: "outflow",
    typicalMethod: "TNMM",
    safeHarbourEligible: false,
  },
  "21": {
    code: "21",
    description: "Payment for IT enabled services / BPO services",
    category: "services_payment",
    shortName: "ITeS/BPO Payment",
    direction: "outflow",
    typicalMethod: "TNMM",
    safeHarbourEligible: false,
  },
  "22": {
    code: "22",
    description: "Payment for support services",
    category: "services_payment",
    shortName: "Support Services Payment",
    direction: "outflow",
    typicalMethod: "TNMM",
  },
  "23": {
    code: "23",
    description: "Payment for management services",
    category: "services_payment",
    shortName: "Management Services Payment",
    direction: "outflow",
    typicalMethod: "TNMM",
  },
  "24": {
    code: "24",
    description: "Payment for technical services",
    category: "services_payment",
    shortName: "Technical Services Payment",
    direction: "outflow",
    typicalMethod: "TNMM",
  },
  "25": {
    code: "25",
    description: "Payment for R&D services",
    category: "services_payment",
    shortName: "R&D Services Payment",
    direction: "outflow",
    typicalMethod: "TNMM",
  },
  "26": {
    code: "26",
    description: "Payment for contract manufacturing services",
    category: "services_payment",
    shortName: "Contract Mfg Payment",
    direction: "outflow",
    typicalMethod: "TNMM",
  },
  "27": {
    code: "27",
    description: "Payment for marketing services",
    category: "services_payment",
    shortName: "Marketing Services Payment",
    direction: "outflow",
    typicalMethod: "TNMM",
  },
  "28": {
    code: "28",
    description: "Payment for engineering services",
    category: "services_payment",
    shortName: "Engineering Services Payment",
    direction: "outflow",
    typicalMethod: "TNMM",
  },
  "29": {
    code: "29",
    description: "Payment for services - Others (specify)",
    category: "services_payment",
    shortName: "Other Services Payment",
    direction: "outflow",
    typicalMethod: "OTHER",
  },

  // =========================================================================
  // SERVICES - RECEIPT (30-39)
  // =========================================================================
  "30": {
    code: "30",
    description: "Receipt for software development services",
    category: "services_receipt",
    shortName: "Software Dev Receipt",
    direction: "inflow",
    typicalMethod: "TNMM",
    safeHarbourEligible: true,
    safeHarbourType: "IT_ITES",
  },
  "31": {
    code: "31",
    description: "Receipt for IT enabled services / BPO services",
    category: "services_receipt",
    shortName: "ITeS/BPO Receipt",
    direction: "inflow",
    typicalMethod: "TNMM",
    safeHarbourEligible: true,
    safeHarbourType: "IT_ITES",
  },
  "32": {
    code: "32",
    description: "Receipt for support services",
    category: "services_receipt",
    shortName: "Support Services Receipt",
    direction: "inflow",
    typicalMethod: "TNMM",
  },
  "33": {
    code: "33",
    description: "Receipt for management services",
    category: "services_receipt",
    shortName: "Management Services Receipt",
    direction: "inflow",
    typicalMethod: "TNMM",
  },
  "34": {
    code: "34",
    description: "Receipt for technical services",
    category: "services_receipt",
    shortName: "Technical Services Receipt",
    direction: "inflow",
    typicalMethod: "TNMM",
  },
  "35": {
    code: "35",
    description: "Receipt for R&D services",
    category: "services_receipt",
    shortName: "R&D Services Receipt",
    direction: "inflow",
    typicalMethod: "TNMM",
    safeHarbourEligible: true,
    safeHarbourType: "CONTRACT_RD_SOFTWARE",
  },
  "36": {
    code: "36",
    description: "Receipt for contract manufacturing services",
    category: "services_receipt",
    shortName: "Contract Mfg Receipt",
    direction: "inflow",
    typicalMethod: "TNMM",
  },
  "37": {
    code: "37",
    description: "Receipt for KPO services",
    category: "services_receipt",
    shortName: "KPO Services Receipt",
    direction: "inflow",
    typicalMethod: "TNMM",
    safeHarbourEligible: true,
    safeHarbourType: "KPO",
  },
  "38": {
    code: "38",
    description: "Receipt for engineering design services",
    category: "services_receipt",
    shortName: "Engineering Design Receipt",
    direction: "inflow",
    typicalMethod: "TNMM",
  },
  "39": {
    code: "39",
    description: "Receipt for services - Others (specify)",
    category: "services_receipt",
    shortName: "Other Services Receipt",
    direction: "inflow",
    typicalMethod: "OTHER",
  },

  // =========================================================================
  // ROYALTY/LICENSE - PAYMENT (40-44)
  // =========================================================================
  "40": {
    code: "40",
    description: "Payment of royalty for use of intangible property",
    category: "royalty_payment",
    shortName: "Royalty Payment - Intangible",
    direction: "outflow",
    typicalMethod: "CUP",
  },
  "41": {
    code: "41",
    description: "Payment of royalty for use of technology/technical know-how",
    category: "royalty_payment",
    shortName: "Royalty Payment - Technology",
    direction: "outflow",
    typicalMethod: "CUP",
  },
  "42": {
    code: "42",
    description: "Payment for use of trademark/brand name",
    category: "royalty_payment",
    shortName: "Trademark/Brand Payment",
    direction: "outflow",
    typicalMethod: "CUP",
  },
  "43": {
    code: "43",
    description: "Payment for license fees",
    category: "royalty_payment",
    shortName: "License Fees Payment",
    direction: "outflow",
    typicalMethod: "CUP",
  },
  "44": {
    code: "44",
    description: "Payment for royalty/license - Others (specify)",
    category: "royalty_payment",
    shortName: "Other Royalty Payment",
    direction: "outflow",
    typicalMethod: "OTHER",
  },

  // =========================================================================
  // ROYALTY/LICENSE - RECEIPT (45-49)
  // =========================================================================
  "45": {
    code: "45",
    description: "Receipt of royalty for use of intangible property",
    category: "royalty_receipt",
    shortName: "Royalty Receipt - Intangible",
    direction: "inflow",
    typicalMethod: "CUP",
  },
  "46": {
    code: "46",
    description: "Receipt of royalty for use of technology/technical know-how",
    category: "royalty_receipt",
    shortName: "Royalty Receipt - Technology",
    direction: "inflow",
    typicalMethod: "CUP",
  },
  "47": {
    code: "47",
    description: "Receipt for use of trademark/brand name",
    category: "royalty_receipt",
    shortName: "Trademark/Brand Receipt",
    direction: "inflow",
    typicalMethod: "CUP",
  },
  "48": {
    code: "48",
    description: "Receipt for license fees",
    category: "royalty_receipt",
    shortName: "License Fees Receipt",
    direction: "inflow",
    typicalMethod: "CUP",
  },
  "49": {
    code: "49",
    description: "Receipt for royalty/license - Others (specify)",
    category: "royalty_receipt",
    shortName: "Other Royalty Receipt",
    direction: "inflow",
    typicalMethod: "OTHER",
  },

  // =========================================================================
  // FINANCIAL TRANSACTIONS (50-59)
  // =========================================================================
  "50": {
    code: "50",
    description: "Interest paid on borrowings",
    category: "financial",
    shortName: "Interest Paid - Borrowings",
    direction: "outflow",
    typicalMethod: "CUP",
    safeHarbourEligible: true,
    safeHarbourType: "LOAN",
  },
  "51": {
    code: "51",
    description: "Interest paid on debentures/bonds",
    category: "financial",
    shortName: "Interest Paid - Debentures",
    direction: "outflow",
    typicalMethod: "CUP",
  },
  "52": {
    code: "52",
    description: "Interest paid on ECBs",
    category: "financial",
    shortName: "Interest Paid - ECB",
    direction: "outflow",
    typicalMethod: "CUP",
    safeHarbourEligible: true,
    safeHarbourType: "LOAN_FOREIGN_CURRENCY",
  },
  "53": {
    code: "53",
    description: "Interest received on loans given",
    category: "financial",
    shortName: "Interest Received - Loans",
    direction: "inflow",
    typicalMethod: "CUP",
    safeHarbourEligible: true,
    safeHarbourType: "LOAN",
  },
  "54": {
    code: "54",
    description: "Interest received on deposits/advances",
    category: "financial",
    shortName: "Interest Received - Deposits",
    direction: "inflow",
    typicalMethod: "CUP",
  },
  "55": {
    code: "55",
    description: "Guarantee commission paid",
    category: "financial",
    shortName: "Guarantee Commission Paid",
    direction: "outflow",
    typicalMethod: "CUP",
    safeHarbourEligible: true,
    safeHarbourType: "CORPORATE_GUARANTEE",
  },
  "56": {
    code: "56",
    description: "Guarantee commission received",
    category: "financial",
    shortName: "Guarantee Commission Received",
    direction: "inflow",
    typicalMethod: "CUP",
    safeHarbourEligible: true,
    safeHarbourType: "CORPORATE_GUARANTEE",
  },
  "57": {
    code: "57",
    description: "Dividend paid",
    category: "financial",
    shortName: "Dividend Paid",
    direction: "outflow",
    typicalMethod: "OTHER",
  },
  "58": {
    code: "58",
    description: "Dividend received",
    category: "financial",
    shortName: "Dividend Received",
    direction: "inflow",
    typicalMethod: "OTHER",
  },
  "59": {
    code: "59",
    description: "Financial transactions - Others (specify)",
    category: "financial",
    shortName: "Other Financial",
    direction: "both",
    typicalMethod: "OTHER",
  },

  // =========================================================================
  // CAPITAL TRANSACTIONS (60-69)
  // =========================================================================
  "60": {
    code: "60",
    description: "Issue of equity shares",
    category: "capital",
    shortName: "Equity Shares Issue",
    direction: "inflow",
    typicalMethod: "OTHER",
  },
  "61": {
    code: "61",
    description: "Issue of preference shares",
    category: "capital",
    shortName: "Preference Shares Issue",
    direction: "inflow",
    typicalMethod: "OTHER",
  },
  "62": {
    code: "62",
    description: "Issue of debentures/bonds",
    category: "capital",
    shortName: "Debentures Issue",
    direction: "inflow",
    typicalMethod: "OTHER",
  },
  "63": {
    code: "63",
    description: "Buyback of shares",
    category: "capital",
    shortName: "Shares Buyback",
    direction: "outflow",
    typicalMethod: "OTHER",
  },
  "64": {
    code: "64",
    description: "Purchase of equity shares",
    category: "capital",
    shortName: "Equity Shares Purchase",
    direction: "outflow",
    typicalMethod: "OTHER",
  },
  "65": {
    code: "65",
    description: "Sale of equity shares",
    category: "capital",
    shortName: "Equity Shares Sale",
    direction: "inflow",
    typicalMethod: "OTHER",
  },
  "66": {
    code: "66",
    description: "Subscription to preference shares",
    category: "capital",
    shortName: "Preference Shares Subscription",
    direction: "outflow",
    typicalMethod: "OTHER",
  },
  "67": {
    code: "67",
    description: "Redemption of preference shares/debentures",
    category: "capital",
    shortName: "Redemption",
    direction: "both",
    typicalMethod: "OTHER",
  },
  "68": {
    code: "68",
    description: "Capital contribution/withdrawal in partnership/LLP",
    category: "capital",
    shortName: "Partnership Capital",
    direction: "both",
    typicalMethod: "OTHER",
  },
  "69": {
    code: "69",
    description: "Capital transactions - Others (specify)",
    category: "capital",
    shortName: "Other Capital",
    direction: "both",
    typicalMethod: "OTHER",
  },

  // =========================================================================
  // REIMBURSEMENTS (70-79)
  // =========================================================================
  "70": {
    code: "70",
    description: "Reimbursement of expenses - paid",
    category: "reimbursement",
    shortName: "Expense Reimbursement Paid",
    direction: "outflow",
    typicalMethod: "OTHER",
  },
  "71": {
    code: "71",
    description: "Reimbursement of expenses - received",
    category: "reimbursement",
    shortName: "Expense Reimbursement Received",
    direction: "inflow",
    typicalMethod: "OTHER",
  },
  "72": {
    code: "72",
    description: "Cost allocation/contribution - paid",
    category: "reimbursement",
    shortName: "Cost Allocation Paid",
    direction: "outflow",
    typicalMethod: "OTHER",
  },
  "73": {
    code: "73",
    description: "Cost allocation/contribution - received",
    category: "reimbursement",
    shortName: "Cost Allocation Received",
    direction: "inflow",
    typicalMethod: "OTHER",
  },
  "74": {
    code: "74",
    description: "Reimbursement of employee costs - paid",
    category: "reimbursement",
    shortName: "Employee Cost Reimbursement Paid",
    direction: "outflow",
    typicalMethod: "OTHER",
  },
  "75": {
    code: "75",
    description: "Reimbursement of employee costs - received",
    category: "reimbursement",
    shortName: "Employee Cost Reimbursement Received",
    direction: "inflow",
    typicalMethod: "OTHER",
  },
  "76": {
    code: "76",
    description: "Reimbursement of travel expenses - paid",
    category: "reimbursement",
    shortName: "Travel Reimbursement Paid",
    direction: "outflow",
    typicalMethod: "OTHER",
  },
  "77": {
    code: "77",
    description: "Reimbursement of travel expenses - received",
    category: "reimbursement",
    shortName: "Travel Reimbursement Received",
    direction: "inflow",
    typicalMethod: "OTHER",
  },
  "78": {
    code: "78",
    description: "Cost contribution arrangement (CCA) payments",
    category: "reimbursement",
    shortName: "CCA Payments",
    direction: "both",
    typicalMethod: "PSM",
  },
  "79": {
    code: "79",
    description: "Reimbursements - Others (specify)",
    category: "reimbursement",
    shortName: "Other Reimbursement",
    direction: "both",
    typicalMethod: "OTHER",
  },

  // =========================================================================
  // INTANGIBLES (80-89)
  // =========================================================================
  "80": {
    code: "80",
    description: "Purchase of intangible property",
    category: "intangibles",
    shortName: "Intangible Purchase",
    direction: "outflow",
    typicalMethod: "CUP",
  },
  "81": {
    code: "81",
    description: "Sale of intangible property",
    category: "intangibles",
    shortName: "Intangible Sale",
    direction: "inflow",
    typicalMethod: "CUP",
  },
  "82": {
    code: "82",
    description: "Cost sharing/contribution for intangibles development",
    category: "intangibles",
    shortName: "Intangibles Cost Sharing",
    direction: "both",
    typicalMethod: "PSM",
  },
  "83": {
    code: "83",
    description: "Purchase of patents/copyrights",
    category: "intangibles",
    shortName: "Patents/Copyrights Purchase",
    direction: "outflow",
    typicalMethod: "CUP",
  },
  "84": {
    code: "84",
    description: "Sale of patents/copyrights",
    category: "intangibles",
    shortName: "Patents/Copyrights Sale",
    direction: "inflow",
    typicalMethod: "CUP",
  },
  "85": {
    code: "85",
    description: "Transfer of marketing intangibles",
    category: "intangibles",
    shortName: "Marketing Intangibles Transfer",
    direction: "both",
    typicalMethod: "PSM",
  },
  "86": {
    code: "86",
    description: "Transfer of customer-related intangibles",
    category: "intangibles",
    shortName: "Customer Intangibles Transfer",
    direction: "both",
    typicalMethod: "PSM",
  },
  "87": {
    code: "87",
    description: "Transfer of contract-based intangibles",
    category: "intangibles",
    shortName: "Contract Intangibles Transfer",
    direction: "both",
    typicalMethod: "CUP",
  },
  "88": {
    code: "88",
    description: "Hard-to-value intangibles (HTVI) transactions",
    category: "intangibles",
    shortName: "HTVI Transactions",
    direction: "both",
    typicalMethod: "OTHER",
  },
  "89": {
    code: "89",
    description: "Intangibles - Others (specify)",
    category: "intangibles",
    shortName: "Other Intangibles",
    direction: "both",
    typicalMethod: "OTHER",
  },

  // =========================================================================
  // OTHER TRANSACTIONS (90-99)
  // =========================================================================
  "90": {
    code: "90",
    description: "Lease rentals paid",
    category: "others",
    shortName: "Lease Rentals Paid",
    direction: "outflow",
    typicalMethod: "CUP",
  },
  "91": {
    code: "91",
    description: "Lease rentals received",
    category: "others",
    shortName: "Lease Rentals Received",
    direction: "inflow",
    typicalMethod: "CUP",
  },
  "92": {
    code: "92",
    description: "Commission paid",
    category: "others",
    shortName: "Commission Paid",
    direction: "outflow",
    typicalMethod: "CUP",
  },
  "93": {
    code: "93",
    description: "Commission received",
    category: "others",
    shortName: "Commission Received",
    direction: "inflow",
    typicalMethod: "CUP",
  },
  "94": {
    code: "94",
    description: "Business restructuring compensation paid",
    category: "others",
    shortName: "Restructuring Comp Paid",
    direction: "outflow",
    typicalMethod: "OTHER",
  },
  "95": {
    code: "95",
    description: "Business restructuring compensation received",
    category: "others",
    shortName: "Restructuring Comp Received",
    direction: "inflow",
    typicalMethod: "OTHER",
  },
  "96": {
    code: "96",
    description: "Exit/termination payment - paid",
    category: "others",
    shortName: "Exit Payment Paid",
    direction: "outflow",
    typicalMethod: "OTHER",
  },
  "97": {
    code: "97",
    description: "Exit/termination payment - received",
    category: "others",
    shortName: "Exit Payment Received",
    direction: "inflow",
    typicalMethod: "OTHER",
  },
  "98": {
    code: "98",
    description: "Secondment/deputation of employees",
    category: "others",
    shortName: "Employee Secondment",
    direction: "both",
    typicalMethod: "TNMM",
  },
  "99": {
    code: "99",
    description: "Any other transaction not covered above (specify)",
    category: "others",
    shortName: "Other Transaction",
    direction: "both",
    typicalMethod: "OTHER",
  },
} as const;

// =============================================================================
// TRANSACTION CATEGORIES
// =============================================================================

export const TRANSACTION_CATEGORIES = {
  purchase: {
    name: "Purchase Transactions",
    codes: ["01", "02", "03", "04", "05", "06", "07", "08", "09"],
    description: "Purchase of goods and property from AE",
  },
  sale: {
    name: "Sale Transactions",
    codes: ["10", "11", "12", "13", "14", "15", "16", "17", "18", "19"],
    description: "Sale of goods and property to AE",
  },
  services_payment: {
    name: "Services - Payment",
    codes: ["20", "21", "22", "23", "24", "25", "26", "27", "28", "29"],
    description: "Payment for services received from AE",
  },
  services_receipt: {
    name: "Services - Receipt",
    codes: ["30", "31", "32", "33", "34", "35", "36", "37", "38", "39"],
    description: "Receipt for services provided to AE",
  },
  royalty_payment: {
    name: "Royalty/License - Payment",
    codes: ["40", "41", "42", "43", "44"],
    description: "Payment of royalty/license fees to AE",
  },
  royalty_receipt: {
    name: "Royalty/License - Receipt",
    codes: ["45", "46", "47", "48", "49"],
    description: "Receipt of royalty/license fees from AE",
  },
  financial: {
    name: "Financial Transactions",
    codes: ["50", "51", "52", "53", "54", "55", "56", "57", "58", "59"],
    description: "Interest, guarantee, dividend transactions",
  },
  capital: {
    name: "Capital Transactions",
    codes: ["60", "61", "62", "63", "64", "65", "66", "67", "68", "69"],
    description: "Share and debenture transactions",
  },
  reimbursement: {
    name: "Reimbursements",
    codes: ["70", "71", "72", "73", "74", "75", "76", "77", "78", "79"],
    description: "Cost reimbursements and allocations",
  },
  intangibles: {
    name: "Intangibles",
    codes: ["80", "81", "82", "83", "84", "85", "86", "87", "88", "89"],
    description: "Intangible property transactions",
  },
  others: {
    name: "Other Transactions",
    codes: ["90", "91", "92", "93", "94", "95", "96", "97", "98", "99"],
    description: "Lease, commission, restructuring, others",
  },
};

// =============================================================================
// TP METHODS
// =============================================================================

export const TP_METHODS = {
  CUP: {
    code: "CUP",
    name: "Comparable Uncontrolled Price Method",
    description:
      "Compares the price charged in a controlled transaction to the price charged in a comparable uncontrolled transaction",
    applicableTo: ["tangible_goods", "royalty", "interest", "services"],
    priority: 1,
  },
  RPM: {
    code: "RPM",
    name: "Resale Price Method",
    description:
      "Based on the resale price at which property purchased from an AE is resold to an independent enterprise",
    applicableTo: ["distribution", "resale", "trading"],
    priority: 2,
  },
  CPM: {
    code: "CPM",
    name: "Cost Plus Method",
    description:
      "Based on the costs incurred by the supplier in a controlled transaction, plus an appropriate markup",
    applicableTo: ["manufacturing", "services", "contract_work"],
    priority: 2,
  },
  PSM: {
    code: "PSM",
    name: "Profit Split Method",
    description:
      "Identifies combined profit from a controlled transaction and splits it between AEs based on relative contributions",
    applicableTo: ["integrated_operations", "unique_intangibles", "highly_integrated"],
    priority: 4,
  },
  TNMM: {
    code: "TNMM",
    name: "Transactional Net Margin Method",
    description:
      "Examines the net profit margin relative to an appropriate base that a taxpayer realizes from a controlled transaction",
    applicableTo: ["services", "manufacturing", "distribution", "most_transactions"],
    priority: 3,
  },
  OTHER: {
    code: "OTHER",
    name: "Other Method",
    description:
      "Any other method which takes into account the price charged or paid for similar goods/services",
    applicableTo: ["special_cases"],
    priority: 5,
  },
};

// =============================================================================
// PLI TYPES FOR TNMM
// =============================================================================

export const PLI_TYPES = {
  OP_OC: {
    code: "OP_OC",
    name: "Operating Profit / Operating Cost",
    formula: "(Operating Profit / Operating Cost) x 100",
    applicableTo: ["services", "contract_manufacturing", "routine_activities"],
    description: "Most commonly used for service providers and contract manufacturers",
  },
  OP_OR: {
    code: "OP_OR",
    name: "Operating Profit / Operating Revenue",
    formula: "(Operating Profit / Operating Revenue) x 100",
    applicableTo: ["distribution", "trading", "services"],
    description: "Also known as Net Profit Margin (NPM)",
  },
  OP_TA: {
    code: "OP_TA",
    name: "Operating Profit / Total Assets",
    formula: "(Operating Profit / Total Assets) x 100",
    applicableTo: ["asset_intensive", "manufacturing"],
    description: "Return on Assets - used when assets are significant value driver",
  },
  OP_CE: {
    code: "OP_CE",
    name: "Operating Profit / Capital Employed",
    formula: "(Operating Profit / Capital Employed) x 100",
    applicableTo: ["manufacturing", "capital_intensive"],
    description: "Return on Capital Employed (ROCE)",
  },
  GP_SALES: {
    code: "GP_SALES",
    name: "Gross Profit / Sales",
    formula: "(Gross Profit / Sales) x 100",
    applicableTo: ["trading", "distribution"],
    description: "Gross margin - used for trading/distribution",
  },
  BERRY_RATIO: {
    code: "BERRY_RATIO",
    name: "Berry Ratio",
    formula: "Gross Profit / Operating Expenses",
    applicableTo: ["distribution", "low_risk_activities"],
    description: "Used for distributors with limited functions and risks",
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get transaction code details by code
 */
export function getTransactionCode(code: string) {
  return TRANSACTION_NATURE_CODES[code as keyof typeof TRANSACTION_NATURE_CODES];
}

/**
 * Get all transaction codes for a category
 */
export function getTransactionCodesByCategory(category: string) {
  const categoryInfo = TRANSACTION_CATEGORIES[category as keyof typeof TRANSACTION_CATEGORIES];
  if (!categoryInfo) return [];

  return categoryInfo.codes.map((code) => {
    const details = TRANSACTION_NATURE_CODES[code as keyof typeof TRANSACTION_NATURE_CODES];
    return { ...details };
  });
}

/**
 * Get all Safe Harbour eligible transaction codes
 */
export function getSafeHarbourEligibleCodes() {
  return Object.entries(TRANSACTION_NATURE_CODES)
    .filter(([, value]) => "safeHarbourEligible" in value && value.safeHarbourEligible)
    .map(([, value]) => ({ ...value }));
}

/**
 * Get recommended TP method for a transaction code
 */
export function getRecommendedTPMethod(code: string) {
  const transaction = getTransactionCode(code);
  if (!transaction) return null;
  return TP_METHODS[transaction.typicalMethod as keyof typeof TP_METHODS];
}

/**
 * Get all categories as dropdown options
 */
export function getCategoryOptions() {
  return Object.entries(TRANSACTION_CATEGORIES).map(([key, value]) => ({
    value: key,
    label: value.name,
    description: value.description,
  }));
}

/**
 * Get all codes as flat list for dropdown
 */
export function getAllTransactionCodesFlat() {
  return Object.entries(TRANSACTION_NATURE_CODES).map(([code, details]) => ({
    value: code,
    label: `${code} - ${details.shortName}`,
    description: details.description,
    category: details.category,
  }));
}

/**
 * Group codes by category for grouped dropdown
 */
export function getTransactionCodesGrouped() {
  return Object.entries(TRANSACTION_CATEGORIES).map(([, category]) => ({
    label: category.name,
    options: category.codes.map((code) => {
      const details = TRANSACTION_NATURE_CODES[code as keyof typeof TRANSACTION_NATURE_CODES];
      return {
        value: code,
        label: `${code} - ${details.shortName}`,
        description: details.description,
      };
    }),
  }));
}
