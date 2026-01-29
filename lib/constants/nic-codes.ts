export const NIC_CODES: Record<string, string> = {
  // IT & Software
  "6201": "Computer programming activities",
  "6202": "Computer consultancy and computer facilities management activities",
  "6209": "Other information technology and computer service activities",

  // Information Services
  "6311": "Data processing, hosting and related activities",
  "6312": "Web portals",

  // Management Consultancy
  "7010": "Activities of head offices",
  "7020": "Management consultancy activities",

  // Scientific R&D
  "7210": "Research and experimental development on natural sciences and engineering",
  "7220": "Research and experimental development on social sciences and humanities",

  // Pharma
  "2100": "Manufacture of pharmaceuticals, medicinal chemical and botanical products",

  // Auto
  "2910": "Manufacture of motor vehicles",
  "2930": "Manufacture of parts and accessories for motor vehicles",

  // Financial Services
  "6411": "Central banking",
  "6419": "Other monetary intermediation",
  "6491": "Financial leasing",
  "6492": "Other credit granting",

  // BPO/KPO
  "8211": "Combined office administrative service activities",
  "8220": "Activities of call centres",
  "8291": "Activities of collection agencies and credit bureaus",
  "8292": "Packaging activities",
  "8299": "Other business support service activities n.e.c.",
};

export const NIC_CATEGORIES: Record<string, string[]> = {
  IT_SOFTWARE: ["6201", "6202", "6209"],
  INFORMATION_SERVICES: ["6311", "6312"],
  MANAGEMENT_CONSULTANCY: ["7010", "7020"],
  SCIENTIFIC_RD: ["7210", "7220"],
  PHARMA: ["2100"],
  AUTO: ["2910", "2930"],
  FINANCIAL: ["6411", "6419", "6491", "6492"],
  BPO_KPO: ["8211", "8220", "8291", "8292", "8299"],
};

export function getNicCodeLabel(code: string): string {
  return NIC_CODES[code] || "Unknown NIC Code";
}

export function getNicCategory(code: string): string | null {
  for (const [category, codes] of Object.entries(NIC_CATEGORIES)) {
    if (codes.includes(code)) {
      return category;
    }
  }
  return null;
}
