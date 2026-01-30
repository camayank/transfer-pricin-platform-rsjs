/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Business Restructuring Module
 *
 * Specialized module for transfer pricing of business restructurings including
 * exit charges, intangibles transfers, termination payments, and going concern valuations.
 * Follows OECD Guidelines Chapter IX on Business Restructurings.
 * ================================================================================
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export enum RestructuringType {
  CONVERSION_TO_LRD = "conversion_to_lrd", // Limited Risk Distributor
  CONVERSION_TO_TOLL = "conversion_to_toll", // Toll/Contract Manufacturer
  CENTRALIZATION = "centralization", // Centralization of functions
  LOCATION_SAVINGS = "location_savings", // Business relocation
  SUPPLY_CHAIN = "supply_chain", // Supply chain restructuring
  IP_MIGRATION = "ip_migration", // IP transfer/migration
  BUSINESS_SALE = "business_sale", // Sale of going concern
  TERMINATION = "termination", // Contract termination
}

export enum ValuationMethod {
  DCF = "dcf", // Discounted Cash Flow
  MARKET_APPROACH = "market_approach",
  COST_APPROACH = "cost_approach",
  RELIEF_FROM_ROYALTY = "relief_from_royalty",
  MULTI_PERIOD_EXCESS_EARNINGS = "meem",
  WITH_AND_WITHOUT = "with_and_without",
}

export interface RestructuringInput {
  restructuringType: RestructuringType;
  transferor: EntityDetails;
  transferee: EntityDetails;
  effectiveDate: Date;
  assets: TransferredAsset[];
  functions: TransferredFunction[];
  risks: TransferredRisk[];
  contracts: AffectedContract[];
  financials: RestructuringFinancials;
  businessJustification: string;
}

export interface EntityDetails {
  name: string;
  jurisdiction: string;
  functionalProfile: string;
  preRestructuringRole: string;
  postRestructuringRole: string;
}

export interface TransferredAsset {
  assetType: "tangible" | "intangible" | "financial";
  description: string;
  bookValue: number;
  fairMarketValue?: number;
  valuationMethod?: ValuationMethod;
  usefulLife?: number;
  transferDate: Date;
}

export interface TransferredFunction {
  function: string;
  description: string;
  preRestructuringEntity: string;
  postRestructuringEntity: string;
  resourcesTransferred: number;
  annualCost: number;
}

export interface TransferredRisk {
  riskType: string;
  description: string;
  preRestructuringBearer: string;
  postRestructuringBearer: string;
  riskValue: number;
}

export interface AffectedContract {
  contractType: string;
  counterparty: string;
  terminationDate?: Date;
  terminationClause: string;
  compensationProvision: string;
  estimatedCompensation: number;
}

export interface RestructuringFinancials {
  preRestructuringProfit: number;
  preRestructuringRevenue: number;
  projectedPostRestructuringProfit: number;
  profitPotentialTransferred: number;
  terminalValue: number;
  discountRate: number;
  projectionPeriod: number;
}

export interface RestructuringResult {
  exitCharge: ExitChargeResult;
  terminationPayment: TerminationPaymentResult;
  goingConcernValue: GoingConcernResult;
  intangiblesTransfer: IntangiblesTransferResult;
  workforceTransfer: WorkforceTransferResult;
  totalCompensation: number;
  armLengthRange: { min: number; max: number; median: number };
  methodology: string;
  oecdCompliance: OECDComplianceAssessment;
  documentation: string[];
}

export interface ExitChargeResult {
  applicable: boolean;
  chargeAmount: number;
  components: ExitChargeComponent[];
  valuationApproach: string;
  armLengthJustification: string;
}

export interface ExitChargeComponent {
  component: string;
  description: string;
  value: number;
  methodology: string;
}

export interface TerminationPaymentResult {
  applicable: boolean;
  paymentAmount: number;
  contracts: ContractTerminationAnalysis[];
  totalTerminationCost: number;
  armLengthBasis: string;
}

export interface ContractTerminationAnalysis {
  contract: string;
  remainingTerm: number;
  annualBenefit: number;
  terminationPayment: number;
  calculationMethod: string;
}

export interface GoingConcernResult {
  applicable: boolean;
  value: number;
  dcfComponents: DCFComponents;
  comparableTransactions?: ComparableTransaction[];
  premiumOrDiscount: number;
  methodology: string;
}

export interface DCFComponents {
  projectedCashFlows: { year: number; cashFlow: number; discountedValue: number }[];
  terminalValue: number;
  discountRate: number;
  enterpriseValue: number;
  adjustments: { item: string; amount: number }[];
}

export interface ComparableTransaction {
  description: string;
  transactionValue: number;
  multiplier: number;
  relevance: string;
}

export interface IntangiblesTransferResult {
  intangibles: IntangibleValuation[];
  totalValue: number;
  dempeAnalysis: DEMPEAnalysis;
  methodology: string;
}

export interface IntangibleValuation {
  intangibleType: string;
  description: string;
  valuationMethod: ValuationMethod;
  value: number;
  royaltyRate?: number;
  usefulLife: number;
  keyAssumptions: string[];
}

export interface DEMPEAnalysis {
  development: DEMPEFunction;
  enhancement: DEMPEFunction;
  maintenance: DEMPEFunction;
  protection: DEMPEFunction;
  exploitation: DEMPEFunction;
  totalValue: number;
  allocation: { entity: string; share: number; value: number }[];
}

export interface DEMPEFunction {
  function: string;
  preRestructuringPerformer: string;
  postRestructuringPerformer: string;
  valueContribution: number;
  description: string;
}

export interface WorkforceTransferResult {
  applicable: boolean;
  value: number;
  employeesTransferred: number;
  replacementCost: number;
  trainingCost: number;
  productivityLoss: number;
  methodology: string;
}

export interface OECDComplianceAssessment {
  isCompliant: boolean;
  guidelinesFollowed: string[];
  potentialIssues: string[];
  recommendations: string[];
}

// =============================================================================
// RESTRUCTURING PARAMETERS
// =============================================================================

export const RESTRUCTURING_PARAMETERS = {
  discountRates: {
    lowRisk: 0.08,
    mediumRisk: 0.12,
    highRisk: 0.15,
    intangibles: 0.14,
  },
  terminalGrowthRate: 0.02,
  workforceMultipliers: {
    executiveLevel: 2.5,
    managerLevel: 1.5,
    professionalLevel: 1.0,
    administrativeLevel: 0.5,
  },
  terminationCompensation: {
    minimumMonths: 3,
    maximumMonths: 24,
    perYearMultiplier: 1,
  },
  exitChargeThresholds: {
    minimumProfitPotential: 0, // Any positive profit potential
    significantRestructuring: 0.25, // 25% change in profit allocation
  },
} as const;

// =============================================================================
// BUSINESS RESTRUCTURING MODULE CLASS
// =============================================================================

export class BusinessRestructuringModule {
  // ===========================================================================
  // MAIN ANALYSIS
  // ===========================================================================

  /**
   * Analyze business restructuring and calculate compensation
   */
  analyzeRestructuring(input: RestructuringInput): RestructuringResult {
    // Calculate exit charge
    const exitCharge = this.calculateExitCharge(input);

    // Calculate termination payment
    const terminationPayment = this.calculateTerminationPayment(input);

    // Calculate going concern value
    const goingConcernValue = this.calculateGoingConcernValue(input);

    // Analyze intangibles transfer
    const intangiblesTransfer = this.analyzeIntangiblesTransfer(input);

    // Calculate workforce transfer value
    const workforceTransfer = this.calculateWorkforceTransfer(input);

    // Calculate total compensation
    const totalCompensation =
      (exitCharge.applicable ? exitCharge.chargeAmount : 0) +
      (terminationPayment.applicable ? terminationPayment.paymentAmount : 0) +
      (goingConcernValue.applicable ? goingConcernValue.value : 0) +
      intangiblesTransfer.totalValue +
      (workforceTransfer.applicable ? workforceTransfer.value : 0);

    // Calculate arm's length range
    const armLengthRange = {
      min: totalCompensation * 0.85,
      max: totalCompensation * 1.15,
      median: totalCompensation,
    };

    // OECD compliance assessment
    const oecdCompliance = this.assessOECDCompliance(input);

    return {
      exitCharge,
      terminationPayment,
      goingConcernValue,
      intangiblesTransfer,
      workforceTransfer,
      totalCompensation,
      armLengthRange,
      methodology: this.generateMethodology(input),
      oecdCompliance,
      documentation: this.getRequiredDocumentation(input),
    };
  }

  // ===========================================================================
  // EXIT CHARGE CALCULATION
  // ===========================================================================

  /**
   * Calculate exit charge (indemnification for loss of profit potential)
   */
  calculateExitCharge(input: RestructuringInput): ExitChargeResult {
    const profitPotentialTransferred = input.financials.profitPotentialTransferred;

    // Determine if exit charge is applicable
    const isApplicable =
      profitPotentialTransferred > 0 &&
      (input.restructuringType === RestructuringType.CONVERSION_TO_LRD ||
        input.restructuringType === RestructuringType.CONVERSION_TO_TOLL ||
        input.restructuringType === RestructuringType.CENTRALIZATION);

    if (!isApplicable) {
      return {
        applicable: false,
        chargeAmount: 0,
        components: [],
        valuationApproach: "N/A",
        armLengthJustification: "Exit charge not applicable for this type of restructuring",
      };
    }

    const components: ExitChargeComponent[] = [];

    // Component 1: Profit potential foregone
    const profitPotentialValue = this.calculateProfitPotentialValue(input);
    components.push({
      component: "Profit Potential Foregone",
      description: "Present value of expected future profits foregone",
      value: profitPotentialValue,
      methodology: "DCF of projected profit reduction",
    });

    // Component 2: Stranded costs
    const strandedCosts = this.calculateStrandedCosts(input);
    components.push({
      component: "Stranded Costs",
      description: "Costs that cannot be avoided post-restructuring",
      value: strandedCosts,
      methodology: "Identification of unavoidable fixed costs",
    });

    // Component 3: Workforce disruption
    const workforceCost = this.calculateWorkforceDisruption(input);
    components.push({
      component: "Workforce Disruption",
      description: "Severance and transition costs",
      value: workforceCost,
      methodology: "Severance packages and transition support",
    });

    const chargeAmount = components.reduce((sum, c) => sum + c.value, 0);

    return {
      applicable: true,
      chargeAmount,
      components,
      valuationApproach: "Profit Potential Approach (DCF-based)",
      armLengthJustification:
        "Exit charge represents compensation for the transfer of profit potential " +
        "from the restructured entity, consistent with OECD Guidelines Chapter IX.",
    };
  }

  private calculateProfitPotentialValue(input: RestructuringInput): number {
    const { preRestructuringProfit, projectedPostRestructuringProfit, discountRate, projectionPeriod } =
      input.financials;

    const annualProfitReduction = preRestructuringProfit - projectedPostRestructuringProfit;

    if (annualProfitReduction <= 0) return 0;

    // Calculate present value of profit reduction over projection period
    let pv = 0;
    for (let year = 1; year <= projectionPeriod; year++) {
      pv += annualProfitReduction / Math.pow(1 + discountRate, year);
    }

    // Add terminal value
    const terminalValue =
      (annualProfitReduction * (1 + RESTRUCTURING_PARAMETERS.terminalGrowthRate)) /
      (discountRate - RESTRUCTURING_PARAMETERS.terminalGrowthRate);
    const pvTerminal = terminalValue / Math.pow(1 + discountRate, projectionPeriod);

    return pv + pvTerminal;
  }

  private calculateStrandedCosts(input: RestructuringInput): number {
    // Estimate stranded costs based on transferred functions
    return input.functions.reduce((sum, f) => {
      // Assume 20% of function costs become stranded for 2 years
      return sum + f.annualCost * 0.20 * 2;
    }, 0);
  }

  private calculateWorkforceDisruption(input: RestructuringInput): number {
    // Estimate workforce disruption costs
    return input.functions.reduce((sum, f) => {
      // Assume severance of 6 months per transferred resource
      const averageSalary = f.annualCost / Math.max(f.resourcesTransferred, 1);
      return sum + f.resourcesTransferred * averageSalary * 0.5;
    }, 0);
  }

  // ===========================================================================
  // TERMINATION PAYMENT CALCULATION
  // ===========================================================================

  /**
   * Calculate termination payment for affected contracts
   */
  calculateTerminationPayment(input: RestructuringInput): TerminationPaymentResult {
    if (input.contracts.length === 0) {
      return {
        applicable: false,
        paymentAmount: 0,
        contracts: [],
        totalTerminationCost: 0,
        armLengthBasis: "N/A",
      };
    }

    const contracts: ContractTerminationAnalysis[] = input.contracts.map((contract) => {
      const remainingTerm = contract.terminationDate
        ? this.calculateRemainingMonths(input.effectiveDate, contract.terminationDate)
        : 24; // Default 2 years if no termination date

      // Calculate annual benefit from contract
      const annualBenefit = contract.estimatedCompensation * 12;

      // Calculate termination payment
      const terminationMonths = Math.min(
        Math.max(remainingTerm, RESTRUCTURING_PARAMETERS.terminationCompensation.minimumMonths),
        RESTRUCTURING_PARAMETERS.terminationCompensation.maximumMonths
      );

      const terminationPayment = (annualBenefit / 12) * terminationMonths * 0.5;

      return {
        contract: contract.contractType,
        remainingTerm,
        annualBenefit,
        terminationPayment,
        calculationMethod: "Present value of foregone benefits during notice period",
      };
    });

    const totalTerminationCost = contracts.reduce((sum, c) => sum + c.terminationPayment, 0);

    return {
      applicable: true,
      paymentAmount: totalTerminationCost,
      contracts,
      totalTerminationCost,
      armLengthBasis:
        "Termination payments based on foregone contractual benefits, " +
        "consistent with arm's length principle and contract terms.",
    };
  }

  private calculateRemainingMonths(startDate: Date, endDate: Date): number {
    const months =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());
    return Math.max(0, months);
  }

  // ===========================================================================
  // GOING CONCERN VALUATION
  // ===========================================================================

  /**
   * Calculate going concern value
   */
  calculateGoingConcernValue(input: RestructuringInput): GoingConcernResult {
    const isApplicable =
      input.restructuringType === RestructuringType.BUSINESS_SALE ||
      input.restructuringType === RestructuringType.CENTRALIZATION;

    if (!isApplicable) {
      return {
        applicable: false,
        value: 0,
        dcfComponents: {
          projectedCashFlows: [],
          terminalValue: 0,
          discountRate: 0,
          enterpriseValue: 0,
          adjustments: [],
        },
        premiumOrDiscount: 0,
        methodology: "N/A",
      };
    }

    // DCF Valuation
    const dcfComponents = this.performDCFValuation(input);

    // Control premium for business transfer (typically 15-25%)
    const controlPremium = 0.20;
    const goingConcernValue = dcfComponents.enterpriseValue * (1 + controlPremium);

    return {
      applicable: true,
      value: goingConcernValue,
      dcfComponents,
      premiumOrDiscount: controlPremium,
      methodology:
        "DCF valuation with control premium adjustment for going concern transfer",
    };
  }

  private performDCFValuation(input: RestructuringInput): DCFComponents {
    const { preRestructuringProfit, discountRate, projectionPeriod, terminalValue } =
      input.financials;

    // Assume profit grows at 3% per year
    const growthRate = 0.03;
    const projectedCashFlows: { year: number; cashFlow: number; discountedValue: number }[] = [];

    let cumulativePV = 0;
    for (let year = 1; year <= projectionPeriod; year++) {
      const cashFlow = preRestructuringProfit * Math.pow(1 + growthRate, year);
      const discountedValue = cashFlow / Math.pow(1 + discountRate, year);
      projectedCashFlows.push({ year, cashFlow, discountedValue });
      cumulativePV += discountedValue;
    }

    // Terminal value
    const tvGrowthRate = RESTRUCTURING_PARAMETERS.terminalGrowthRate;
    const finalYearCashFlow = projectedCashFlows[projectedCashFlows.length - 1]?.cashFlow || preRestructuringProfit;
    const calculatedTerminalValue =
      (finalYearCashFlow * (1 + tvGrowthRate)) / (discountRate - tvGrowthRate);
    const pvTerminalValue = calculatedTerminalValue / Math.pow(1 + discountRate, projectionPeriod);

    const enterpriseValue = cumulativePV + pvTerminalValue;

    return {
      projectedCashFlows,
      terminalValue: pvTerminalValue,
      discountRate,
      enterpriseValue,
      adjustments: [
        { item: "Working capital adjustment", amount: 0 },
        { item: "Non-operating assets", amount: 0 },
      ],
    };
  }

  // ===========================================================================
  // INTANGIBLES TRANSFER
  // ===========================================================================

  /**
   * Analyze intangibles transfer
   */
  analyzeIntangiblesTransfer(input: RestructuringInput): IntangiblesTransferResult {
    const intangibleAssets = input.assets.filter((a) => a.assetType === "intangible");

    const intangibles: IntangibleValuation[] = intangibleAssets.map((asset) => {
      const valuation = this.valueIntangible(asset, input.financials);
      return {
        intangibleType: asset.description,
        description: `${asset.description} transferred from ${input.transferor.name} to ${input.transferee.name}`,
        valuationMethod: asset.valuationMethod || ValuationMethod.RELIEF_FROM_ROYALTY,
        value: valuation,
        royaltyRate: this.estimateRoyaltyRate(asset.description),
        usefulLife: asset.usefulLife || 10,
        keyAssumptions: [
          "Useful life based on industry standards",
          "Royalty rate from comparable agreements",
          "Revenue projections from management",
        ],
      };
    });

    const dempeAnalysis = this.performDEMPEAnalysis(input);

    const totalValue = intangibles.reduce((sum, i) => sum + i.value, 0);

    return {
      intangibles,
      totalValue,
      dempeAnalysis,
      methodology: "Relief from Royalty method with DEMPE analysis for value allocation",
    };
  }

  private valueIntangible(asset: TransferredAsset, financials: RestructuringFinancials): number {
    if (asset.fairMarketValue) {
      return asset.fairMarketValue;
    }

    // Relief from Royalty method
    const royaltyRate = this.estimateRoyaltyRate(asset.description) / 100;
    const annualRevenue = financials.preRestructuringRevenue;
    const usefulLife = asset.usefulLife || 10;
    const discountRate = RESTRUCTURING_PARAMETERS.discountRates.intangibles;

    let pv = 0;
    for (let year = 1; year <= usefulLife; year++) {
      const royaltySaving = annualRevenue * royaltyRate;
      pv += royaltySaving / Math.pow(1 + discountRate, year);
    }

    return pv;
  }

  private estimateRoyaltyRate(intangibleType: string): number {
    const lowerType = intangibleType.toLowerCase();
    if (lowerType.includes("trademark") || lowerType.includes("brand")) return 3.0;
    if (lowerType.includes("patent") || lowerType.includes("technology")) return 5.0;
    if (lowerType.includes("software")) return 4.0;
    if (lowerType.includes("customer") || lowerType.includes("relationship")) return 2.0;
    if (lowerType.includes("know-how") || lowerType.includes("process")) return 3.5;
    return 2.5; // Default
  }

  private performDEMPEAnalysis(input: RestructuringInput): DEMPEAnalysis {
    const totalValue = input.financials.profitPotentialTransferred;

    const dempeFunc = (func: string, preEntity: string, postEntity: string, share: number): DEMPEFunction => ({
      function: func,
      preRestructuringPerformer: preEntity,
      postRestructuringPerformer: postEntity,
      valueContribution: totalValue * share,
      description: `${func} function ${preEntity === postEntity ? "remains with" : "transferred to"} ${postEntity}`,
    });

    const development = dempeFunc("Development", input.transferor.name, input.transferee.name, 0.30);
    const enhancement = dempeFunc("Enhancement", input.transferor.name, input.transferee.name, 0.20);
    const maintenance = dempeFunc("Maintenance", input.transferor.name, input.transferee.name, 0.15);
    const protection = dempeFunc("Protection", input.transferor.name, input.transferee.name, 0.15);
    const exploitation = dempeFunc("Exploitation", input.transferor.name, input.transferee.name, 0.20);

    return {
      development,
      enhancement,
      maintenance,
      protection,
      exploitation,
      totalValue,
      allocation: [
        { entity: input.transferor.name, share: 0.20, value: totalValue * 0.20 },
        { entity: input.transferee.name, share: 0.80, value: totalValue * 0.80 },
      ],
    };
  }

  // ===========================================================================
  // WORKFORCE TRANSFER
  // ===========================================================================

  /**
   * Calculate workforce transfer value
   */
  calculateWorkforceTransfer(input: RestructuringInput): WorkforceTransferResult {
    const totalResources = input.functions.reduce((sum, f) => sum + f.resourcesTransferred, 0);

    if (totalResources === 0) {
      return {
        applicable: false,
        value: 0,
        employeesTransferred: 0,
        replacementCost: 0,
        trainingCost: 0,
        productivityLoss: 0,
        methodology: "N/A",
      };
    }

    // Calculate average cost per employee
    const totalCost = input.functions.reduce((sum, f) => sum + f.annualCost, 0);
    const avgCostPerEmployee = totalCost / totalResources;

    // Replacement cost (recruitment + onboarding)
    const replacementCost = totalResources * avgCostPerEmployee * 0.25;

    // Training cost
    const trainingCost = totalResources * avgCostPerEmployee * 0.10;

    // Productivity loss during transition (3-6 months)
    const productivityLoss = totalResources * avgCostPerEmployee * 0.15;

    const totalValue = replacementCost + trainingCost + productivityLoss;

    return {
      applicable: true,
      value: totalValue,
      employeesTransferred: totalResources,
      replacementCost,
      trainingCost,
      productivityLoss,
      methodology:
        "Workforce transfer valued using Cost Approach: " +
        "replacement cost + training cost + productivity loss during transition",
    };
  }

  // ===========================================================================
  // COMPLIANCE AND DOCUMENTATION
  // ===========================================================================

  private assessOECDCompliance(input: RestructuringInput): OECDComplianceAssessment {
    const guidelinesFollowed: string[] = [
      "Chapter IX - Business Restructurings",
      "Para 9.1 - Arm's length principle applies to restructurings",
      "Para 9.46 - Compensation for terminated arrangements",
      "Para 9.60 - Relocation of functions and risks",
    ];

    const potentialIssues: string[] = [];
    const recommendations: string[] = [];

    // Check for potential issues
    if (input.financials.profitPotentialTransferred > input.financials.preRestructuringProfit * 3) {
      potentialIssues.push(
        "Significant profit potential transfer may attract scrutiny"
      );
      recommendations.push(
        "Document business rationale thoroughly"
      );
    }

    if (input.restructuringType === RestructuringType.IP_MIGRATION) {
      potentialIssues.push(
        "IP migration subject to enhanced documentation requirements"
      );
      recommendations.push(
        "Prepare comprehensive DEMPE analysis"
      );
    }

    recommendations.push(
      "Maintain contemporaneous documentation of restructuring rationale"
    );
    recommendations.push(
      "Document arm's length pricing for all transfers"
    );

    return {
      isCompliant: potentialIssues.length === 0,
      guidelinesFollowed,
      potentialIssues,
      recommendations,
    };
  }

  private generateMethodology(input: RestructuringInput): string {
    return (
      `BUSINESS RESTRUCTURING ANALYSIS\n\n` +
      `Type: ${input.restructuringType}\n` +
      `Transferor: ${input.transferor.name} (${input.transferor.jurisdiction})\n` +
      `Transferee: ${input.transferee.name} (${input.transferee.jurisdiction})\n` +
      `Effective Date: ${input.effectiveDate.toLocaleDateString()}\n\n` +
      `VALUATION APPROACH:\n` +
      `Following OECD Guidelines Chapter IX, the restructuring has been analyzed considering:\n` +
      `1. Profit potential foregone by the transferor\n` +
      `2. Compensation for terminated/renegotiated arrangements\n` +
      `3. Value of assets and functions transferred\n` +
      `4. Arm's length compensation for all transfers\n\n` +
      `Business Justification:\n${input.businessJustification}`
    );
  }

  private getRequiredDocumentation(input: RestructuringInput): string[] {
    return [
      "Board resolutions approving the restructuring",
      "Business case and commercial rationale",
      "Pre and post restructuring FAR analysis",
      "Valuation reports for transferred assets",
      "Profit potential analysis",
      "Contract termination documentation",
      "Workforce transfer agreements",
      "DEMPE analysis for intangibles",
      "Arm's length pricing documentation",
      "Contemporaneous written agreements",
    ];
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export function createBusinessRestructuringModule(): BusinessRestructuringModule {
  return new BusinessRestructuringModule();
}

let _restructuringModuleInstance: BusinessRestructuringModule | null = null;

export function getBusinessRestructuringModule(): BusinessRestructuringModule {
  if (!_restructuringModuleInstance) {
    _restructuringModuleInstance = createBusinessRestructuringModule();
  }
  return _restructuringModuleInstance;
}

