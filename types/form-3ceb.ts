// Form 3CEB Types

export interface AssesseeDetails {
  name: string;
  pan: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  status: string;
  principalBusinessActivity: string;
  nicCode: string;
  previousYearFrom: string;
  previousYearTo: string;
  assessmentYear: string;
  email: string;
  phone: string;
}

export interface AssociatedEnterprise {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  address: string;
  relationshipType: string;
  relationshipDescription: string;
  taxId?: string;
}

export interface InternationalTransaction {
  id: string;
  aeId: string;
  aeName: string;
  aeCountry: string;
  natureCode: string;
  description: string;
  valueAsPerBooks: number;
  valueAsPerALP: number;
  method: string;
  methodJustification: string;
  numberOfComparables: number;
  alpRangeLower?: number;
  alpRangeUpper?: number;
  safeHarbourOpted: boolean;
  safeHarbourMargin?: number;
}

export interface CADetails {
  caName: string;
  membershipNumber: string;
  firmName: string;
  firmRegistrationNumber: string;
  address: string;
  city: string;
  pin: string;
  udin: string;
  dateOfReport: string;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: "critical" | "error" | "warning" | "info";
  section: string;
  suggestion?: string;
}

export interface Form3CEBData {
  assessee: AssesseeDetails;
  associatedEnterprises: AssociatedEnterprise[];
  internationalTransactions: InternationalTransaction[];
  caDetails: CADetails;
}

export interface Form3CEBWizardState {
  currentStep: number;
  data: Form3CEBData;
  validationErrors: ValidationError[];
  isValid: boolean;
}

// Validation helpers
export function validatePAN(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase());
}

export function validatePinCode(pin: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pin);
}

export function validateEmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

export function validatePhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/[\s\-]/g, ""));
}

export function validateUDIN(udin: string): boolean {
  return /^\d{8}[A-Z0-9]{10}$/i.test(udin);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat("en-IN").format(amount);
}
