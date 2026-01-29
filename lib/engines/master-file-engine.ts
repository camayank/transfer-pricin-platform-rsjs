/**
 * DIGICOMPLY MASTER FILE (FORM 3CEAA) GENERATOR
 * Transfer Pricing Master File Documentation
 *
 * Based on:
 * - Section 92D(4) of Income Tax Act
 * - Rule 10DA of Income Tax Rules
 * - OECD BEPS Action 13 Guidelines
 * - CBDT Notification dated 31.10.2017
 *
 * Applicability:
 * - Constituent entity of an international group
 * - Consolidated group revenue > Rs.500 Crores in preceding year
 * - Aggregate value of international transactions > Rs.50 Crores
 *   OR
 * - Aggregate value of intangible-related transactions > Rs.10 Crores
 *
 * Due Date: 30th November of the assessment year
 */

import { createHash } from "crypto";

// =============================================================================
// ENUMS
// =============================================================================

export enum EntityType {
  ULTIMATE_PARENT = "ultimate_parent",
  SURROGATE_PARENT = "surrogate_parent",
  INTERMEDIATE_PARENT = "intermediate_parent",
  CONSTITUENT_ENTITY = "constituent_entity",
}

export enum BusinessActivity {
  RD = "rd", // Research and Development
  HOLDING_IP = "holding_ip", // Holding or Managing IP
  PURCHASING = "purchasing", // Purchasing or Procurement
  MANUFACTURING = "manufacturing", // Manufacturing or Production
  SALES_MARKETING = "sales_marketing", // Sales, Marketing, Distribution
  ADMINISTRATIVE = "administrative", // Administrative, Management, Support
  SERVICES = "services", // Provision of Services
  INTERNAL_FINANCE = "internal_finance", // Internal Group Finance
  REGULATED_FINANCE = "regulated_finance", // Regulated Financial Services
  INSURANCE = "insurance", // Insurance
  HOLDING_SHARES = "holding_shares", // Holding Shares or Other Equity
  DORMANT = "dormant", // Dormant
  OTHER = "other", // Other
}

export enum IntangibleType {
  PATENT = "patent",
  TRADEMARK = "trademark",
  TRADE_NAME = "trade_name",
  COPYRIGHT = "copyright",
  KNOW_HOW = "know_how",
  TRADE_SECRET = "trade_secret",
  LICENSE = "license",
  FRANCHISE = "franchise",
  CUSTOMER_LIST = "customer_list",
  SOFTWARE = "software",
  OTHER = "other",
}

export enum FinancingArrangementType {
  LOAN = "loan",
  GUARANTEE = "guarantee",
  CASH_POOLING = "cash_pooling",
  HEDGING = "hedging",
  CAPTIVE_INSURANCE = "captive_insurance",
  OTHER = "other",
}

// =============================================================================
// MASTER FILE SECTIONS - AS PER RULE 10DA
// =============================================================================

export interface GroupEntity {
  name: string;
  country: string;
  countryCode: string;
  ownershipPercentage: number;
  legalForm: string;
  activities: BusinessActivity[];
}

export interface OrganizationalStructure {
  ownershipChartDescription: string;
  ownershipChartFile?: string;
  operatingEntities: GroupEntity[];
}

export interface ProductService {
  name: string;
  description: string;
  revenuePercentage: number;
  keyMarkets: string[];
}

export interface ServiceArrangement {
  serviceType: string;
  providerEntity: string;
  recipientEntities: string[];
  pricingPolicy: string;
}

export interface BusinessRestructuring {
  date: string;
  description: string;
  entitiesInvolved: string[];
  impact: string;
}

export interface BusinessDescription {
  profitDrivers: string[];
  supplyChainDescription: string;
  topProductsServices: ProductService[];
  geographicMarkets: string[];
  serviceArrangements: ServiceArrangement[];
  principalFunctions: string[];
  keyRisks: string[];
  importantAssets: string[];
  businessRestructurings: BusinessRestructuring[];
}

export interface RDFacility {
  location: string;
  country: string;
  activities: string[];
  employeeCount: number;
}

export interface IntangibleAsset {
  type: IntangibleType;
  description: string;
  legalOwner: string;
  economicOwner: string;
  developmentLocation: string;
  relatedAgreements: string[];
}

export interface IntangibleTransfer {
  intangible: string;
  fromEntity: string;
  toEntity: string;
  date: string;
  consideration: number;
  countries: string[];
}

export interface CostContributionArrangement {
  participants: string[];
  subjectMatter: string;
  duration: string;
  contributionMethod: string;
}

export interface IntangiblesInfo {
  intangiblesStrategy: string;
  rdFacilities: RDFacility[];
  rdManagementLocation: string;
  intangiblesList: IntangibleAsset[];
  intangiblesTPPolicy: string;
  intangibleTransfers: IntangibleTransfer[];
  costContributionArrangements: CostContributionArrangement[];
}

export interface FinancingEntity {
  entityName: string;
  country: string;
  function: string;
  regulated: boolean;
}

export interface FinancingArrangement {
  type: FinancingArrangementType;
  lender: string;
  borrowers: string[];
  amount: number;
  currency: string;
  interestRate: number;
  terms: string;
}

export interface CashPoolingArrangement {
  poolLeader: string;
  participants: string[];
  structure: string;
  currencies: string[];
}

export interface IntercompanyFinancialActivities {
  financingDescription: string;
  financingEntities: FinancingEntity[];
  financialTPPolicy: string;
  financingArrangements: FinancingArrangement[];
  cashPooling: CashPoolingArrangement[];
  captiveInsurance: Record<string, unknown>[];
}

export interface APAInfo {
  type: "unilateral" | "bilateral" | "multilateral";
  country: string;
  entity: string;
  coveredTransactions: string[];
  periodFrom: string;
  periodTo: string;
  status: string;
}

export interface TaxRuling {
  country: string;
  entity: string;
  subjectMatter: string;
  rulingDate: string;
  validity: string;
}

export interface FinancialAndTaxPositions {
  consolidatedRevenue: number;
  consolidatedProfitBeforeTax: number;
  consolidatedTaxExpense: number;
  reportingCurrency: string;
  financialYearEnd: string;
  auditedFinancialsReference: string;
  unilateralAPAs: APAInfo[];
  bilateralAPAs: APAInfo[];
  taxRulings: TaxRuling[];
}

export interface CAVerification {
  preparedBy: string;
  preparedDate: string;
  caName: string;
  caMembershipNumber: string;
  udin: string;
}

// =============================================================================
// MAIN MASTER FILE INTERFACE
// =============================================================================

export interface MasterFile {
  formDetails: {
    formName: string;
    formVersion: string;
    assessmentYear: string;
    generatedOn: string;
  };
  reportingEntity: {
    name: string;
    pan: string;
    entityType: EntityType;
  };
  ultimateParent: {
    name: string;
    country: string;
    taxId: string;
  };
  mneGroupName: string;
  partA_OrganizationalStructure: OrganizationalStructure;
  partB_BusinessDescription: BusinessDescription;
  partC_Intangibles: IntangiblesInfo;
  partD_FinancialActivities: IntercompanyFinancialActivities;
  partE_FinancialTaxPositions: FinancialAndTaxPositions;
  verification: CAVerification;
}

// =============================================================================
// VALIDATION
// =============================================================================

export interface MasterFileValidationResult {
  section: string;
  errors: string[];
}

export function validateMasterFile(masterFile: MasterFile): Record<string, string[]> {
  const errors: Record<string, string[]> = {
    basicInfo: [],
    organizationalStructure: [],
    businessDescription: [],
    intangibles: [],
    financialActivities: [],
    financialTax: [],
  };

  // Basic info validation
  if (!masterFile.reportingEntity.pan || masterFile.reportingEntity.pan.length !== 10) {
    errors.basicInfo.push("Invalid PAN");
  }

  if (!masterFile.ultimateParent.name) {
    errors.basicInfo.push("Ultimate parent name required");
  }

  // Organizational structure
  if (!masterFile.partA_OrganizationalStructure.operatingEntities ||
      masterFile.partA_OrganizationalStructure.operatingEntities.length === 0) {
    errors.organizationalStructure.push("At least one operating entity required");
  }

  // Business description
  if (!masterFile.partB_BusinessDescription.profitDrivers ||
      masterFile.partB_BusinessDescription.profitDrivers.length === 0) {
    errors.businessDescription.push("Profit drivers not specified");
  }

  if (!masterFile.partB_BusinessDescription.supplyChainDescription) {
    errors.businessDescription.push("Supply chain description required");
  }

  // Financial positions
  if (masterFile.partE_FinancialTaxPositions.consolidatedRevenue <= 0) {
    errors.financialTax.push("Consolidated revenue required");
  }

  return errors;
}

export function isMasterFileComplete(masterFile: MasterFile): boolean {
  const errors = validateMasterFile(masterFile);
  return Object.values(errors).every((e) => e.length === 0);
}

// =============================================================================
// MASTER FILE BUILDER CLASS
// =============================================================================

export class MasterFileBuilder {
  private assessmentYear: string = "";
  private reportingEntityName: string = "";
  private reportingEntityPan: string = "";
  private entityType: EntityType = EntityType.CONSTITUENT_ENTITY;
  private ultimateParentName: string = "";
  private ultimateParentCountry: string = "";
  private ultimateParentTaxId: string = "";
  private mneGroupName: string = "";
  private organizationalStructure: OrganizationalStructure = {
    ownershipChartDescription: "",
    operatingEntities: [],
  };
  private businessDescription: BusinessDescription = {
    profitDrivers: [],
    supplyChainDescription: "",
    topProductsServices: [],
    geographicMarkets: [],
    serviceArrangements: [],
    principalFunctions: [],
    keyRisks: [],
    importantAssets: [],
    businessRestructurings: [],
  };
  private intangibles: IntangiblesInfo = {
    intangiblesStrategy: "",
    rdFacilities: [],
    rdManagementLocation: "",
    intangiblesList: [],
    intangiblesTPPolicy: "",
    intangibleTransfers: [],
    costContributionArrangements: [],
  };
  private financialActivities: IntercompanyFinancialActivities = {
    financingDescription: "",
    financingEntities: [],
    financialTPPolicy: "",
    financingArrangements: [],
    cashPooling: [],
    captiveInsurance: [],
  };
  private financialTaxPositions: FinancialAndTaxPositions = {
    consolidatedRevenue: 0,
    consolidatedProfitBeforeTax: 0,
    consolidatedTaxExpense: 0,
    reportingCurrency: "INR",
    financialYearEnd: "",
    auditedFinancialsReference: "",
    unilateralAPAs: [],
    bilateralAPAs: [],
    taxRulings: [],
  };
  private verification: CAVerification = {
    preparedBy: "",
    preparedDate: new Date().toISOString().split("T")[0],
    caName: "",
    caMembershipNumber: "",
    udin: "",
  };

  createNew(
    assessmentYear: string,
    reportingEntityName: string,
    reportingEntityPan: string,
    entityType: EntityType = EntityType.CONSTITUENT_ENTITY
  ): MasterFileBuilder {
    this.assessmentYear = assessmentYear;
    this.reportingEntityName = reportingEntityName;
    this.reportingEntityPan = reportingEntityPan;
    this.entityType = entityType;
    return this;
  }

  setUltimateParent(name: string, country: string, taxId: string = ""): MasterFileBuilder {
    this.ultimateParentName = name;
    this.ultimateParentCountry = country;
    this.ultimateParentTaxId = taxId;
    return this;
  }

  setMneGroupName(name: string): MasterFileBuilder {
    this.mneGroupName = name;
    return this;
  }

  // Part A Methods
  addGroupEntity(
    name: string,
    country: string,
    countryCode: string,
    ownershipPercentage: number,
    legalForm: string,
    activities: BusinessActivity[]
  ): MasterFileBuilder {
    this.organizationalStructure.operatingEntities.push({
      name,
      country,
      countryCode,
      ownershipPercentage,
      legalForm,
      activities,
    });
    return this;
  }

  setOwnershipChart(description: string): MasterFileBuilder {
    this.organizationalStructure.ownershipChartDescription = description;
    return this;
  }

  // Part B Methods
  setProfitDrivers(drivers: string[]): MasterFileBuilder {
    this.businessDescription.profitDrivers = drivers;
    return this;
  }

  setSupplyChain(description: string): MasterFileBuilder {
    this.businessDescription.supplyChainDescription = description;
    return this;
  }

  addProductService(
    name: string,
    description: string,
    revenuePercentage: number,
    keyMarkets: string[]
  ): MasterFileBuilder {
    this.businessDescription.topProductsServices.push({
      name,
      description,
      revenuePercentage,
      keyMarkets,
    });
    return this;
  }

  setFunctionalAnalysis(
    functions: string[],
    risks: string[],
    assets: string[]
  ): MasterFileBuilder {
    this.businessDescription.principalFunctions = functions;
    this.businessDescription.keyRisks = risks;
    this.businessDescription.importantAssets = assets;
    return this;
  }

  setGeographicMarkets(markets: string[]): MasterFileBuilder {
    this.businessDescription.geographicMarkets = markets;
    return this;
  }

  // Part C Methods
  setIntangiblesStrategy(strategy: string): MasterFileBuilder {
    this.intangibles.intangiblesStrategy = strategy;
    return this;
  }

  addIntangible(
    intangibleType: IntangibleType,
    description: string,
    legalOwner: string,
    economicOwner: string,
    developmentLocation: string,
    relatedAgreements: string[] = []
  ): MasterFileBuilder {
    this.intangibles.intangiblesList.push({
      type: intangibleType,
      description,
      legalOwner,
      economicOwner,
      developmentLocation,
      relatedAgreements,
    });
    return this;
  }

  addRDFacility(
    location: string,
    country: string,
    activities: string[],
    employeeCount: number
  ): MasterFileBuilder {
    this.intangibles.rdFacilities.push({
      location,
      country,
      activities,
      employeeCount,
    });
    return this;
  }

  setIntangiblesTPPolicy(policy: string): MasterFileBuilder {
    this.intangibles.intangiblesTPPolicy = policy;
    return this;
  }

  // Part D Methods
  setFinancingDescription(description: string): MasterFileBuilder {
    this.financialActivities.financingDescription = description;
    return this;
  }

  addFinancingArrangement(
    arrangementType: FinancingArrangementType,
    lender: string,
    borrowers: string[],
    amount: number,
    currency: string,
    interestRate: number,
    terms: string
  ): MasterFileBuilder {
    this.financialActivities.financingArrangements.push({
      type: arrangementType,
      lender,
      borrowers,
      amount,
      currency,
      interestRate,
      terms,
    });
    return this;
  }

  setFinancialTPPolicy(policy: string): MasterFileBuilder {
    this.financialActivities.financialTPPolicy = policy;
    return this;
  }

  // Part E Methods
  setConsolidatedFinancials(
    revenue: number,
    profitBeforeTax: number,
    taxExpense: number,
    currency: string = "INR",
    yearEnd: string = ""
  ): MasterFileBuilder {
    this.financialTaxPositions.consolidatedRevenue = revenue;
    this.financialTaxPositions.consolidatedProfitBeforeTax = profitBeforeTax;
    this.financialTaxPositions.consolidatedTaxExpense = taxExpense;
    this.financialTaxPositions.reportingCurrency = currency;
    this.financialTaxPositions.financialYearEnd =
      yearEnd || new Date().toISOString().split("T")[0];
    return this;
  }

  addAPA(
    apaType: "unilateral" | "bilateral" | "multilateral",
    country: string,
    entity: string,
    transactions: string[],
    periodFrom: string,
    periodTo: string,
    status: string
  ): MasterFileBuilder {
    const apaInfo: APAInfo = {
      type: apaType,
      country,
      entity,
      coveredTransactions: transactions,
      periodFrom,
      periodTo,
      status,
    };

    if (apaType === "unilateral") {
      this.financialTaxPositions.unilateralAPAs.push(apaInfo);
    } else {
      this.financialTaxPositions.bilateralAPAs.push(apaInfo);
    }
    return this;
  }

  // Verification
  setVerification(
    preparedBy: string,
    caName: string,
    caMembership: string,
    udin: string
  ): MasterFileBuilder {
    this.verification = {
      preparedBy,
      preparedDate: new Date().toISOString().split("T")[0],
      caName,
      caMembershipNumber: caMembership,
      udin,
    };
    return this;
  }

  build(): MasterFile {
    return {
      formDetails: {
        formName: "3CEAA",
        formVersion: "1.0",
        assessmentYear: this.assessmentYear,
        generatedOn: new Date().toISOString(),
      },
      reportingEntity: {
        name: this.reportingEntityName,
        pan: this.reportingEntityPan,
        entityType: this.entityType,
      },
      ultimateParent: {
        name: this.ultimateParentName,
        country: this.ultimateParentCountry,
        taxId: this.ultimateParentTaxId,
      },
      mneGroupName: this.mneGroupName,
      partA_OrganizationalStructure: this.organizationalStructure,
      partB_BusinessDescription: this.businessDescription,
      partC_Intangibles: this.intangibles,
      partD_FinancialActivities: this.financialActivities,
      partE_FinancialTaxPositions: this.financialTaxPositions,
      verification: this.verification,
    };
  }

  generateHash(masterFile: MasterFile): string {
    const data = JSON.stringify(masterFile);
    return createHash("sha256").update(data).digest("hex");
  }

  exportJSON(masterFile: MasterFile): string {
    return JSON.stringify(masterFile, null, 2);
  }
}

// =============================================================================
// MASTER FILE TEMPLATES
// =============================================================================

export const MASTER_FILE_TEMPLATES = {
  itServicesCaptive: {
    profitDrivers: [
      "Skilled workforce availability and cost arbitrage",
      "Process efficiency and automation",
      "Client relationships managed by parent",
      "Proprietary tools and methodologies from parent",
    ],
    supplyChain: `The Indian entity operates as a captive service provider,
delivering IT/ITeS services exclusively to group entities.
Services are rendered from delivery centers in India using
infrastructure, tools, and methodologies provided by the parent.
Client acquisition and relationship management is handled by
the parent/regional entities.`,
    functions: [
      "Software development and maintenance",
      "Quality assurance and testing",
      "Technical support services",
      "Project management (operational level)",
    ],
    risks: [
      "Operational risk (limited)",
      "Employee attrition risk",
      "Currency risk (limited, pass-through)",
    ],
    assets: [
      "Skilled workforce",
      "IT infrastructure",
      "Delivery center facilities",
    ],
  },
  contractRD: {
    profitDrivers: [
      "R&D talent availability",
      "Cost-effective research capabilities",
      "Integration with global R&D network",
    ],
    supplyChain: `The Indian entity operates as a contract R&D center,
performing research and development activities under direction
from the parent entity. All IP developed vests with the parent.
R&D priorities and strategies are determined by the global R&D team.`,
    functions: [
      "Research and development activities",
      "Product development support",
      "Testing and validation",
      "Documentation and reporting",
    ],
    risks: [
      "Operational risk only",
      "No market or IP-related risks",
    ],
    assets: [
      "R&D facilities and equipment",
      "Technical workforce",
      "Laboratory infrastructure",
    ],
  },
  distributionEntity: {
    profitDrivers: [
      "Market access and customer relationships",
      "Distribution network efficiency",
      "Brand value of parent company products",
    ],
    supplyChain: `The Indian entity operates as a limited risk distributor,
purchasing products from the parent/group entities for resale
in the Indian market. Product development, branding, and major
marketing decisions are made by the parent.`,
    functions: [
      "Sales and distribution",
      "Marketing support (local execution)",
      "Warehousing and logistics",
      "Customer service",
    ],
    risks: [
      "Limited inventory risk",
      "Credit risk on customers",
      "Currency risk (limited)",
    ],
    assets: [
      "Distribution network",
      "Customer relationships",
      "Warehouse facilities",
    ],
  },
};

// Export for convenience
export const createMasterFileBuilder = () => new MasterFileBuilder();
