// Form 3CEB Constants based on Income Tax Rules 10E, Section 92E

export const TRANSACTION_NATURE_CODES = {
  // Purchase transactions
  "01": "Purchase of raw materials",
  "02": "Purchase of finished goods",
  "03": "Purchase of capital goods",
  "04": "Purchase of other goods",

  // Sale transactions
  "11": "Sale of raw materials",
  "12": "Sale of finished goods",
  "13": "Sale of capital goods",
  "14": "Sale of other goods",

  // Services - Payment
  "21": "Payment for software development services",
  "22": "Payment for technical services",
  "23": "Payment for management services",
  "24": "Payment for support services",
  "25": "Payment for other services",

  // Services - Receipt
  "31": "Receipt for software development services",
  "32": "Receipt for technical services",
  "33": "Receipt for management services",
  "34": "Receipt for support services",
  "35": "Receipt for other services",

  // Royalty/License
  "41": "Payment of royalty",
  "42": "Receipt of royalty",
  "43": "Payment of license fee",
  "44": "Receipt of license fee",

  // Financial transactions
  "51": "Loan/advance given",
  "52": "Loan/advance taken",
  "53": "Interest paid",
  "54": "Interest received",
  "55": "Guarantee given",
  "56": "Guarantee received",

  // Capital transactions
  "61": "Purchase of shares/securities",
  "62": "Sale of shares/securities",
  "63": "Purchase of intangible assets",
  "64": "Sale of intangible assets",

  // Cost sharing
  "71": "Payment towards cost sharing arrangement",
  "72": "Receipt towards cost sharing arrangement",

  // Others
  "99": "Other transaction",
};

export const TRANSACTION_CATEGORIES = {
  PURCHASE: {
    label: "Purchase Transactions",
    codes: ["01", "02", "03", "04"],
  },
  SALE: {
    label: "Sale Transactions",
    codes: ["11", "12", "13", "14"],
  },
  SERVICE_PAYMENT: {
    label: "Service Payments",
    codes: ["21", "22", "23", "24", "25"],
  },
  SERVICE_RECEIPT: {
    label: "Service Receipts",
    codes: ["31", "32", "33", "34", "35"],
  },
  ROYALTY: {
    label: "Royalty/License",
    codes: ["41", "42", "43", "44"],
  },
  FINANCIAL: {
    label: "Financial Transactions",
    codes: ["51", "52", "53", "54", "55", "56"],
  },
  CAPITAL: {
    label: "Capital Transactions",
    codes: ["61", "62", "63", "64"],
  },
  COST_SHARING: {
    label: "Cost Sharing",
    codes: ["71", "72"],
  },
  OTHER: {
    label: "Other",
    codes: ["99"],
  },
};

export const TP_METHODS = {
  CUP: {
    code: "CUP",
    name: "Comparable Uncontrolled Price Method",
    description: "Compares price in controlled transaction with price in uncontrolled transaction",
  },
  RPM: {
    code: "RPM",
    name: "Resale Price Method",
    description: "Based on resale price minus appropriate gross margin",
  },
  CPM: {
    code: "CPM",
    name: "Cost Plus Method",
    description: "Based on costs incurred plus appropriate mark-up",
  },
  PSM: {
    code: "PSM",
    name: "Profit Split Method",
    description: "Splits combined profits between associated enterprises",
  },
  TNMM: {
    code: "TNMM",
    name: "Transactional Net Margin Method",
    description: "Compares net profit margin relative to appropriate base",
  },
  OTHER: {
    code: "OTHER",
    name: "Other Method",
    description: "Any other method prescribed by the Board",
  },
};

export const RELATIONSHIP_TYPES = {
  "01": "Holding Company",
  "02": "Subsidiary",
  "03": "Fellow Subsidiary",
  "04": "Joint Venture",
  "05": "Common Control",
  "99": "Other Relationship",
};

export const COUNTRY_LIST = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "AU", name: "Australia" },
  { code: "CA", name: "Canada" },
  { code: "NL", name: "Netherlands" },
  { code: "CH", name: "Switzerland" },
  { code: "IE", name: "Ireland" },
  { code: "LU", name: "Luxembourg" },
  { code: "HK", name: "Hong Kong" },
  { code: "MY", name: "Malaysia" },
  { code: "TH", name: "Thailand" },
  { code: "ID", name: "Indonesia" },
  { code: "KR", name: "South Korea" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "BE", name: "Belgium" },
  { code: "SE", name: "Sweden" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
  { code: "ZA", name: "South Africa" },
  { code: "NZ", name: "New Zealand" },
  { code: "IL", name: "Israel" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "MU", name: "Mauritius" },
];

export const INDIAN_STATES = [
  { code: "AN", name: "Andaman and Nicobar Islands" },
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CH", name: "Chandigarh" },
  { code: "CT", name: "Chhattisgarh" },
  { code: "DD", name: "Daman and Diu" },
  { code: "DL", name: "Delhi" },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "HR", name: "Haryana" },
  { code: "JH", name: "Jharkhand" },
  { code: "JK", name: "Jammu and Kashmir" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "LA", name: "Ladakh" },
  { code: "MH", name: "Maharashtra" },
  { code: "ML", name: "Meghalaya" },
  { code: "MN", name: "Manipur" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OR", name: "Odisha" },
  { code: "PB", name: "Punjab" },
  { code: "PY", name: "Puducherry" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TG", name: "Telangana" },
  { code: "TR", name: "Tripura" },
  { code: "UK", name: "Uttarakhand" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "WB", name: "West Bengal" },
];

export const ASSESSEE_STATUS = [
  { code: "COMPANY", name: "Company" },
  { code: "LLP", name: "Limited Liability Partnership" },
  { code: "FIRM", name: "Partnership Firm" },
  { code: "TRUST", name: "Trust" },
  { code: "AOP", name: "Association of Persons" },
  { code: "BOI", name: "Body of Individuals" },
];

// Validation patterns
export const VALIDATION_PATTERNS = {
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
  PIN_CODE: /^[1-9][0-9]{5}$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^[6-9]\d{9}$/,
  UDIN: /^\d{8}[A-Z0-9]{10}$/,
  CA_MEMBERSHIP: /^\d{5,7}$/,
  FIRM_REG: /^\d{6}[A-Z]$/,
};

// Validation messages
export const VALIDATION_MESSAGES = {
  PAN: "PAN must be 10 characters: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)",
  PIN_CODE: "PIN code must be 6 digits starting with non-zero",
  EMAIL: "Enter a valid email address",
  PHONE: "Enter 10-digit mobile number starting with 6-9",
  UDIN: "UDIN must be 18 characters from ICAI portal",
  CA_MEMBERSHIP: "Enter valid ICAI membership number (5-7 digits)",
  FIRM_REG: "Enter firm registration number (6 digits + letter)",
};
