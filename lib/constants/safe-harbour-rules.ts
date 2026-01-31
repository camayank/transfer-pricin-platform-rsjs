// Indian Income Tax Rule 10TD/10TE/10TF - Valid through AY 2026-27

export type SafeHarbourType =
  | "IT_ITES"
  | "KPO"
  | "CONTRACT_RD_SOFTWARE"
  | "CONTRACT_RD_PHARMA"
  | "AUTO_ANCILLARY"
  | "LOAN_FC"
  | "LOAN_INR"
  | "GUARANTEE";

export interface SafeHarbourThreshold {
  condition: string;
  margin: number | string;
}

export interface SafeHarbourRule {
  name: string;
  description: string;
  marginType: string;
  thresholds: SafeHarbourThreshold[];
  eligibilityConditions: string[];
}

// Safe Harbour Rules - Updated FY 2023-24 onwards per CBDT Notifications
export const SAFE_HARBOUR_RULES: Record<SafeHarbourType, SafeHarbourRule> = {
  // IT/ITeS Services (Software Development, BPO, etc.)
  // Per CBDT Notification No. 117/2023 dated 07-11-2023 for FY 2023-24 onwards
  IT_ITES: {
    name: "IT/ITeS Services",
    description: "Software development, IT support, BPO, call centers",
    marginType: "OP/OC",
    thresholds: [
      { condition: "Normal case", margin: 18 }, // Per CBDT Notification 117/2023
      { condition: "Significant ownership (>50%)", margin: 19.5 }, // Per CBDT Notification 117/2023
    ],
    eligibilityConditions: [
      "Receipt from Associated Enterprise",
      "Aggregate value <= Rs. 200 crore",
    ],
  },

  // KPO Services - Per CBDT Notification No. 117/2023 dated 07-11-2023
  KPO: {
    name: "Knowledge Process Outsourcing",
    description: "Research, analytics, legal services, engineering design",
    marginType: "OP/OC",
    thresholds: [
      { condition: "Employee cost < 40% of total cost", margin: 18 }, // Per CBDT Notification 117/2023
      { condition: "Employee cost 40-60% of total cost", margin: 21 }, // Per CBDT Notification 117/2023
      { condition: "Employee cost > 60% of total cost", margin: 24 }, // Per CBDT Notification 117/2023
    ],
    eligibilityConditions: [
      "Receipt from Associated Enterprise",
      "Aggregate value <= Rs. 200 crore",
    ],
  },

  // Contract R&D - Software
  CONTRACT_RD_SOFTWARE: {
    name: "Contract R&D - Software Development",
    description: "Software R&D services provided to AE",
    marginType: "OP/OC",
    thresholds: [{ condition: "All cases", margin: 24 }],
    eligibilityConditions: [
      "Receipt from Associated Enterprise",
      "Aggregate value <= Rs. 200 crore",
    ],
  },

  // Contract R&D - Pharma/Generic
  CONTRACT_RD_PHARMA: {
    name: "Contract R&D - Pharma/Generic",
    description: "Pharmaceutical and generic drug R&D services",
    marginType: "OP/OC",
    thresholds: [{ condition: "All cases", margin: 24 }],
    eligibilityConditions: [
      "Receipt from Associated Enterprise",
      "Aggregate value <= Rs. 200 crore",
    ],
  },

  // Auto Component Manufacturing
  AUTO_ANCILLARY: {
    name: "Auto Component Manufacturing",
    description: "Manufacture and export of auto components",
    marginType: "OP/OC",
    thresholds: [{ condition: "All cases", margin: 12 }],
    eligibilityConditions: [
      "Sale to Associated Enterprise",
      "Aggregate value <= Rs. 200 crore",
    ],
  },

  // Intra-Group Loans - Foreign Currency
  LOAN_FC: {
    name: "Intra-Group Loan (Foreign Currency)",
    description: "Loans advanced to/received from AE in foreign currency",
    marginType: "Interest Rate",
    thresholds: [
      { condition: "Credit rating AAA/AA", margin: "SBI Base Rate + 150 bps" },
      { condition: "Credit rating A", margin: "SBI Base Rate + 300 bps" },
      { condition: "Credit rating BBB", margin: "SBI Base Rate + 400 bps" },
      { condition: "Credit rating BB", margin: "SBI Base Rate + 500 bps" },
      { condition: "Credit rating B/C/D", margin: "SBI Base Rate + 600 bps" },
    ],
    eligibilityConditions: ["Loan amount <= Rs. 100 crore"],
  },

  // Intra-Group Loans - INR
  LOAN_INR: {
    name: "Intra-Group Loan (Indian Rupees)",
    description: "Loans advanced to/received from AE in INR",
    marginType: "Interest Rate",
    thresholds: [
      { condition: "Credit rating AAA/AA", margin: "1Y SBI MCLR + 175 bps" },
      { condition: "Credit rating A", margin: "1Y SBI MCLR + 325 bps" },
      { condition: "Credit rating BBB", margin: "1Y SBI MCLR + 425 bps" },
      { condition: "Credit rating BB", margin: "1Y SBI MCLR + 525 bps" },
      { condition: "Credit rating B/C/D", margin: "1Y SBI MCLR + 625 bps" },
    ],
    eligibilityConditions: ["Loan amount <= Rs. 100 crore"],
  },

  // Corporate Guarantee
  GUARANTEE: {
    name: "Corporate Guarantee",
    description: "Explicit corporate guarantee to AE",
    marginType: "Guarantee Commission",
    thresholds: [{ condition: "All cases", margin: "1% per annum" }],
    eligibilityConditions: ["Guarantee amount <= Rs. 100 crore"],
  },
};

// Current SBI Rates (Update periodically)
export const SBI_RATES = {
  baseRate: 10.15, // As of April 2024
  mclr1Year: 8.7, // As of April 2024
  lastUpdated: "2024-04-01",
};

// Calculate Safe Harbour interest rate
export function calculateSafeHarbourInterestRate(
  type: "FC" | "INR",
  creditRating: string
): number {
  const baseRate = type === "FC" ? SBI_RATES.baseRate : SBI_RATES.mclr1Year;
  const spreads: Record<string, number> = {
    FC: {
      "AAA/AA": 1.5,
      A: 3.0,
      BBB: 4.0,
      BB: 5.0,
      "B/C/D": 6.0,
    }[creditRating] as number,
    INR: {
      "AAA/AA": 1.75,
      A: 3.25,
      BBB: 4.25,
      BB: 5.25,
      "B/C/D": 6.25,
    }[creditRating] as number,
  };
  return baseRate + (spreads[type] || 0);
}

// Check Safe Harbour eligibility
export function checkSafeHarbourEligibility(
  type: SafeHarbourType,
  transactionValue: number,
  margin?: number,
  employeeCostRatio?: number
): {
  eligible: boolean;
  requiredMargin: number | string;
  gap?: number;
  message: string;
} {
  const rule = SAFE_HARBOUR_RULES[type];

  // Check value threshold
  const maxValue =
    type.includes("LOAN") || type === "GUARANTEE" ? 100_00_00_000 : 200_00_00_000;
  if (transactionValue > maxValue) {
    return {
      eligible: false,
      requiredMargin: "-",
      message: `Transaction value exceeds Rs. ${maxValue / 10000000} crore threshold`,
    };
  }

  // For service transactions with margin
  if (margin !== undefined && typeof rule.thresholds[0].margin === "number") {
    let requiredMargin: number;

    if (type === "KPO" && employeeCostRatio !== undefined) {
      // Per CBDT Notification 117/2023 dated 07-11-2023
      if (employeeCostRatio < 40) requiredMargin = 18;
      else if (employeeCostRatio <= 60) requiredMargin = 21;
      else requiredMargin = 24;
    } else if (type === "IT_ITES") {
      // Per CBDT Notification 117/2023: 18% normal, 19.5% for significant ownership
      requiredMargin = 18;
    } else {
      requiredMargin = rule.thresholds[0].margin as number;
    }

    const gap = requiredMargin - margin;
    const eligible = margin >= requiredMargin;

    return {
      eligible,
      requiredMargin,
      gap: eligible ? 0 : gap,
      message: eligible
        ? `Eligible! Margin ${margin}% meets Safe Harbour threshold of ${requiredMargin}%`
        : `Not eligible. Current margin ${margin}% is ${gap.toFixed(2)}% below required ${requiredMargin}%`,
    };
  }

  return {
    eligible: true,
    requiredMargin: rule.thresholds[0].margin,
    message: "Eligible for Safe Harbour. Use prescribed rates.",
  };
}
