export interface ComplianceDeadline {
  name: string;
  description: string;
  dueDate: string;
  penalty: string;
  applicableTo: string;
}

export const COMPLIANCE_DEADLINES: Record<string, ComplianceDeadline> = {
  FORM_3CEB: {
    name: "Form 3CEB",
    description: "Transfer Pricing Audit Report under Section 92E",
    dueDate: "October 31",
    penalty: "Rs. 1,00,000",
    applicableTo:
      "All entities with international transactions > specified threshold",
  },
  FORM_3CEAA: {
    name: "Form 3CEAA (Master File)",
    description: "Master File as per Rule 10DA",
    dueDate: "November 30",
    penalty: "Rs. 5,00,000",
    applicableTo:
      "Constituent entity of international group with consolidated revenue > Rs. 500 Cr AND (intl txns > Rs. 50 Cr OR intangibles > Rs. 10 Cr)",
  },
  FORM_3CEAB: {
    name: "Form 3CEAB",
    description: "Intimation for Master File",
    dueDate: "November 30",
    penalty: "Rs. 5,00,000",
    applicableTo: "Same as Form 3CEAA",
  },
  FORM_3CEAD: {
    name: "Form 3CEAD (CbCR)",
    description: "Country-by-Country Report",
    dueDate: "March 31",
    penalty: "Rs. 5,000 - Rs. 15,000 per day",
    applicableTo:
      "Parent entity with consolidated revenue > Rs. 6,400 Cr (~EUR 750M)",
  },
  LOCAL_FILE: {
    name: "Local File / TP Documentation",
    description: "Local File as per Rule 10D",
    dueDate: "October 31 (with Form 3CEB)",
    penalty: "2% of value of international transaction",
    applicableTo: "All entities with international transactions",
  },
  ITR: {
    name: "Income Tax Return",
    description: "For entities requiring TP audit",
    dueDate: "November 30",
    penalty: "Rs. 5,000 - Rs. 10,000 + interest",
    applicableTo: "All entities with TP requirements",
  },
};

export function getUpcomingDeadlines(
  assessmentYear: string
): { deadline: ComplianceDeadline; date: Date }[] {
  const [startYear] = assessmentYear.split("-").map(Number);
  const currentYear = startYear - 1; // AY 2025-26 means FY 2024-25

  const deadlines = [
    {
      deadline: COMPLIANCE_DEADLINES.FORM_3CEB,
      date: new Date(currentYear, 9, 31), // Oct 31
    },
    {
      deadline: COMPLIANCE_DEADLINES.FORM_3CEAA,
      date: new Date(currentYear, 10, 30), // Nov 30
    },
    {
      deadline: COMPLIANCE_DEADLINES.FORM_3CEAB,
      date: new Date(currentYear, 10, 30), // Nov 30
    },
    {
      deadline: COMPLIANCE_DEADLINES.ITR,
      date: new Date(currentYear, 10, 30), // Nov 30
    },
    {
      deadline: COMPLIANCE_DEADLINES.FORM_3CEAD,
      date: new Date(currentYear + 1, 2, 31), // Mar 31 next year
    },
  ];

  return deadlines.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function getDaysUntilDeadline(deadline: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = deadline.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
