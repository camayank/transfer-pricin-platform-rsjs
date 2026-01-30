/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * BFSI (Banking, Financial Services, Insurance) Industry Module
 *
 * Specialized transfer pricing engine for BFSI sector transactions including
 * intercompany loans, guarantees, treasury services, and insurance captives.
 * ================================================================================
 */

import {
  BFSITransactionType,
  INTEREST_RATE_BENCHMARKS,
  CREDIT_RATING_SPREADS,
  GUARANTEE_FEE_RANGES,
  CAPTIVE_INSURANCE_PARAMETERS,
  TREASURY_SERVICE_FEES,
  NBFC_LENDING_PARAMETERS,
  InterestRateBenchmark,
  CreditRatingSpread,
  GuaranteeFeeRange,
  InsurancePricingParameter,
  TreasuryServiceFee,
  NBFCLendingParameter,
  getBenchmarkRate,
  getCreditSpread,
  getGuaranteeFeeRange,
  calculateInterestRate,
  getTreasuryServiceFee,
  getNBFCLendingParams,
} from "../constants/bfsi-benchmarks";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface LoanPricingInput {
  principal: number;
  currency: string;
  borrowerCreditRating: string;
  tenorMonths: number;
  securityType: "secured" | "unsecured";
  lenderType: "bank" | "nbfc" | "group_company";
  purpose: string;
  repaymentStructure: "bullet" | "amortizing" | "balloon";
}

export interface LoanPricingResult {
  recommendedRate: { min: number; max: number };
  rateBreakdown: {
    benchmarkRate: number;
    creditSpread: number;
    tenorPremium: number;
    securityDiscount: number;
    totalRate: number;
  };
  comparableData: ComparableTransaction[];
  methodology: string;
  armLengthRange: { low: number; high: number; median: number };
  documentation: string[];
}

export interface ComparableTransaction {
  source: string;
  rate: number;
  tenor: number;
  creditRating: string;
  date: string;
}

export interface GuaranteePricingInput {
  guaranteeType: BFSITransactionType;
  guaranteeAmount: number;
  currency: string;
  beneficiaryCreditRating: string;
  guarantorCreditRating: string;
  tenorMonths: number;
  securityProvided: boolean;
  probabilityOfDefault?: number;
}

export interface GuaranteePricingResult {
  recommendedFee: { min: number; max: number };
  feeBreakdown: {
    baseFee: number;
    creditRiskPremium: number;
    tenorAdjustment: number;
    administrativeCost: number;
    totalFee: number;
  };
  yieldApproachFee: number;
  costApproachFee: number;
  marketApproachFee: { min: number; max: number };
  recommendedApproach: string;
  methodology: string;
  documentation: string[];
}

export interface CaptiveInsuranceInput {
  coverageType: string;
  sumInsured: number;
  currency: string;
  industryType: string;
  claimsHistory: "good" | "average" | "poor";
  riskFactors: string[];
  deductible: number;
  indemnityPeriod?: number;
}

export interface CaptiveInsuranceResult {
  recommendedPremium: { min: number; max: number };
  premiumBreakdown: {
    basePremium: number;
    riskLoading: number;
    claimsAdjustment: number;
    deductibleDiscount: number;
    totalPremium: number;
  };
  commissionRange: { min: number; max: number };
  comparableRates: { source: string; rate: number }[];
  methodology: string;
  oecdChapterXCompliance: string[];
  documentation: string[];
}

export interface TreasuryServiceInput {
  serviceType: string;
  transactionVolume: number;
  currency: string;
  averageBalance?: number;
  numberOfTransactions?: number;
  complexity: "standard" | "complex";
}

export interface TreasuryServiceResult {
  recommendedFee: { min: number; max: number };
  feeStructure: {
    baseFee: number;
    volumeDiscount: number;
    complexityPremium: number;
    netFee: number;
  };
  comparableFees: TreasuryServiceFee[];
  methodology: string;
  documentation: string[];
}

export interface CashPoolInput {
  poolType: "notional" | "physical" | "zero_balancing";
  participatingEntities: CashPoolEntity[];
  poolLeaderCurrency: string;
  interestRateBasis: string;
  spreadAllocation: "benefit_sharing" | "risk_based" | "fixed";
}

export interface CashPoolEntity {
  entityName: string;
  jurisdiction: string;
  averagePosition: number; // positive = depositor, negative = borrower
  creditRating: string;
  currency: string;
}

export interface CashPoolResult {
  interestAllocation: CashPoolInterestAllocation[];
  poolLeaderCompensation: number;
  armLengthInterestRates: {
    depositRate: { min: number; max: number };
    borrowingRate: { min: number; max: number };
    spread: number;
  };
  benefitSharingAnalysis: {
    totalBenefit: number;
    allocationMethod: string;
    entityBenefits: { entity: string; benefit: number }[];
  };
  methodology: string;
  documentation: string[];
}

export interface CashPoolInterestAllocation {
  entity: string;
  position: number;
  interestRate: number;
  interestAmount: number;
  marketRate: number;
  benefit: number;
}

// =============================================================================
// BFSI MODULE CLASS
// =============================================================================

export class BFSIModule {
  // ===========================================================================
  // LOAN PRICING
  // ===========================================================================

  /**
   * Price an intercompany loan
   */
  priceIntercompanyLoan(input: LoanPricingInput): LoanPricingResult {
    // Get benchmark rate
    const benchmark = getBenchmarkRate(input.currency);
    const benchmarkRate = benchmark?.currentRate || 8.50;

    // Get credit spread
    const creditSpreadBps = getCreditSpread(input.borrowerCreditRating);
    const creditSpread = creditSpreadBps / 100;

    // Calculate tenor premium
    const tenorPremium = this.calculateTenorPremium(input.tenorMonths);

    // Security discount
    const securityDiscount = input.securityType === "secured" ? -0.50 : 0;

    // Calculate total rate
    const totalRate = benchmarkRate + creditSpread + tenorPremium + securityDiscount;

    // Build arm's length range
    const armLengthRange = {
      low: totalRate - 0.50,
      high: totalRate + 0.50,
      median: totalRate,
    };

    return {
      recommendedRate: { min: armLengthRange.low, max: armLengthRange.high },
      rateBreakdown: {
        benchmarkRate,
        creditSpread,
        tenorPremium,
        securityDiscount,
        totalRate,
      },
      comparableData: this.getComparableLoanTransactions(input),
      methodology: this.generateLoanMethodology(input, benchmark),
      armLengthRange,
      documentation: [
        "Loan agreement with terms and conditions",
        "Credit rating report or internal credit assessment",
        "Interest rate benchmark documentation",
        "Security valuation (if applicable)",
        "Board resolution approving the loan",
      ],
    };
  }

  private calculateTenorPremium(tenorMonths: number): number {
    if (tenorMonths <= 12) return 0;
    if (tenorMonths <= 36) return 0.25;
    if (tenorMonths <= 60) return 0.50;
    return 0.75;
  }

  private getComparableLoanTransactions(input: LoanPricingInput): ComparableTransaction[] {
    // Simulated comparable data - in real implementation, would query database
    const baseRate = getBenchmarkRate(input.currency)?.currentRate || 8.50;
    const spread = getCreditSpread(input.borrowerCreditRating) / 100;

    return [
      {
        source: "External loan database",
        rate: baseRate + spread - 0.25,
        tenor: input.tenorMonths - 6,
        creditRating: input.borrowerCreditRating,
        date: "2024-01-15",
      },
      {
        source: "Bank quote",
        rate: baseRate + spread + 0.10,
        tenor: input.tenorMonths,
        creditRating: input.borrowerCreditRating,
        date: "2024-02-01",
      },
      {
        source: "Market data",
        rate: baseRate + spread,
        tenor: input.tenorMonths + 6,
        creditRating: input.borrowerCreditRating,
        date: "2024-01-20",
      },
    ];
  }

  private generateLoanMethodology(
    input: LoanPricingInput,
    benchmark: InterestRateBenchmark | undefined
  ): string {
    return (
      `LOAN PRICING METHODOLOGY\n\n` +
      `Method Applied: CUP Method (Comparable Uncontrolled Price)\n\n` +
      `The arm's length interest rate has been determined using the following approach:\n\n` +
      `1. Benchmark Rate: ${benchmark?.name || "Standard benchmark"} (${benchmark?.currentRate || 8.50}%)\n` +
      `2. Credit Spread: Based on borrower's credit rating (${input.borrowerCreditRating})\n` +
      `3. Tenor Premium: Adjustment for loan duration (${input.tenorMonths} months)\n` +
      `4. Security Adjustment: ${input.securityType === "secured" ? "Discount for collateral" : "No security discount"}\n\n` +
      `The rate is consistent with rates charged by banks for similar loans to ` +
      `borrowers with comparable credit profiles.`
    );
  }

  // ===========================================================================
  // GUARANTEE PRICING
  // ===========================================================================

  /**
   * Price a corporate guarantee
   */
  priceGuarantee(input: GuaranteePricingInput): GuaranteePricingResult {
    // Get fee range from benchmarks
    const feeRange = getGuaranteeFeeRange(
      input.guaranteeType,
      input.beneficiaryCreditRating,
      input.tenorMonths
    );

    // Calculate base fee (midpoint of range)
    const baseFee = (feeRange.min + feeRange.max) / 2;

    // Credit risk premium based on rating differential
    const creditRiskPremium = this.calculateGuaranteeRiskPremium(
      input.guarantorCreditRating,
      input.beneficiaryCreditRating
    );

    // Tenor adjustment
    const tenorAdjustment = input.tenorMonths > 36 ? 0.15 : input.tenorMonths > 12 ? 0.05 : 0;

    // Administrative cost
    const administrativeCost = 0.05;

    // Total fee
    const totalFee = baseFee + creditRiskPremium + tenorAdjustment + administrativeCost;

    // Calculate using different approaches
    const yieldApproachFee = this.calculateYieldApproach(
      input.beneficiaryCreditRating,
      input.guarantorCreditRating
    );
    const costApproachFee = this.calculateCostApproach(input);

    return {
      recommendedFee: { min: feeRange.min, max: feeRange.max },
      feeBreakdown: {
        baseFee,
        creditRiskPremium,
        tenorAdjustment,
        administrativeCost,
        totalFee,
      },
      yieldApproachFee,
      costApproachFee,
      marketApproachFee: feeRange,
      recommendedApproach: "Yield Approach (CDS + administrative margin)",
      methodology: this.generateGuaranteeMethodology(input, yieldApproachFee),
      documentation: [
        "Guarantee agreement",
        "Credit assessment of beneficiary",
        "Credit rating of guarantor",
        "CDS spread data for comparable credits",
        "Bank guarantee quotes (if available)",
        "Board resolution",
      ],
    };
  }

  private calculateGuaranteeRiskPremium(
    guarantorRating: string,
    beneficiaryRating: string
  ): number {
    const guarantorSpread = getCreditSpread(guarantorRating);
    const beneficiarySpread = getCreditSpread(beneficiaryRating);

    // Risk premium is the difference in credit spreads
    return Math.max(0, (beneficiarySpread - guarantorSpread) / 100);
  }

  private calculateYieldApproach(
    beneficiaryRating: string,
    guarantorRating: string
  ): number {
    // Yield approach: CDS spread of beneficiary minus CDS spread of guarantor
    const beneficiarySpread = getCreditSpread(beneficiaryRating);
    const guarantorSpread = getCreditSpread(guarantorRating);

    const cdsSpread = Math.max(0, (beneficiarySpread - guarantorSpread) / 100);
    const adminMargin = 0.05;

    return cdsSpread + adminMargin;
  }

  private calculateCostApproach(input: GuaranteePricingInput): number {
    // Cost approach: Expected loss + capital charge + admin cost
    const expectedLoss = (input.probabilityOfDefault || 0.01) *
      (1 - 0.40); // 40% recovery rate assumption

    const capitalCharge = 0.08 * 0.08; // 8% capital × 8% return
    const adminCost = 0.05;

    return expectedLoss + capitalCharge + adminCost;
  }

  private generateGuaranteeMethodology(
    input: GuaranteePricingInput,
    yieldFee: number
  ): string {
    return (
      `GUARANTEE FEE PRICING METHODOLOGY\n\n` +
      `Primary Method: Yield Approach\n\n` +
      `The arm's length guarantee fee has been determined using the Yield Approach, ` +
      `which measures the benefit to the beneficiary:\n\n` +
      `1. The CDS spread for the beneficiary (${input.beneficiaryCreditRating}) represents ` +
      `the market price of credit risk\n` +
      `2. The CDS spread for the guarantor (${input.guarantorCreditRating}) is deducted ` +
      `as this risk remains with the guarantor\n` +
      `3. An administrative margin is added for the guarantor's costs\n\n` +
      `Calculated Fee: ${(yieldFee * 100).toFixed(2)}% per annum\n\n` +
      `This approach is consistent with OECD Transfer Pricing Guidelines Chapter X ` +
      `on Financial Transactions.`
    );
  }

  // ===========================================================================
  // CAPTIVE INSURANCE PRICING
  // ===========================================================================

  /**
   * Price captive insurance premium
   */
  priceCaptiveInsurance(input: CaptiveInsuranceInput): CaptiveInsuranceResult {
    // Get base parameters
    const insuranceParams = CAPTIVE_INSURANCE_PARAMETERS.find(
      (p) => p.coverageType.toLowerCase().includes(input.coverageType.toLowerCase())
    ) || CAPTIVE_INSURANCE_PARAMETERS[0];

    // Calculate base premium
    const basePremium = (input.sumInsured / 1000) * insuranceParams.baseRate;

    // Apply risk loading
    let riskLoadingFactor = 1.0;
    insuranceParams.riskFactors.forEach((rf) => {
      if (input.riskFactors.includes(rf.factor)) {
        riskLoadingFactor *= rf.multiplier;
      }
    });
    const riskLoading = basePremium * (riskLoadingFactor - 1);

    // Claims adjustment
    const claimsMultiplier =
      input.claimsHistory === "good" ? 0.90 :
      input.claimsHistory === "poor" ? 1.15 : 1.00;
    const claimsAdjustment = basePremium * (claimsMultiplier - 1);

    // Deductible discount
    const deductibleDiscount = this.calculateDeductibleDiscount(
      input.deductible,
      input.sumInsured
    );

    // Total premium
    const totalPremium = basePremium + riskLoading + claimsAdjustment - deductibleDiscount;

    // Premium range (±15%)
    const premiumRange = {
      min: totalPremium * 0.85,
      max: totalPremium * 1.15,
    };

    return {
      recommendedPremium: premiumRange,
      premiumBreakdown: {
        basePremium,
        riskLoading,
        claimsAdjustment,
        deductibleDiscount,
        totalPremium,
      },
      commissionRange: insuranceParams.commissionRange,
      comparableRates: this.getComparableInsuranceRates(input),
      methodology: this.generateInsuranceMethodology(input, insuranceParams),
      oecdChapterXCompliance: [
        "Premium determined using actuarial principles",
        "Risk transfer is genuine and economically significant",
        "Coverage terms are consistent with commercial practice",
        "Claims handling follows arm's length procedures",
      ],
      documentation: [
        "Insurance policy document",
        "Actuarial report",
        "Risk assessment report",
        "Claims history analysis",
        "Comparable insurance quotes",
        "Reinsurance arrangements (if any)",
      ],
    };
  }

  private calculateDeductibleDiscount(deductible: number, sumInsured: number): number {
    const deductibleRatio = deductible / sumInsured;
    if (deductibleRatio >= 0.10) return sumInsured * 0.001 * 0.20;
    if (deductibleRatio >= 0.05) return sumInsured * 0.001 * 0.10;
    if (deductibleRatio >= 0.01) return sumInsured * 0.001 * 0.05;
    return 0;
  }

  private getComparableInsuranceRates(
    input: CaptiveInsuranceInput
  ): { source: string; rate: number }[] {
    // Simulated comparable rates
    const baseRate = 0.15;
    return [
      { source: "Commercial insurer A", rate: baseRate * 1.05 },
      { source: "Commercial insurer B", rate: baseRate * 0.95 },
      { source: "Industry benchmark", rate: baseRate },
    ];
  }

  private generateInsuranceMethodology(
    input: CaptiveInsuranceInput,
    params: InsurancePricingParameter
  ): string {
    return (
      `CAPTIVE INSURANCE PRICING METHODOLOGY\n\n` +
      `Method: Actuarial Analysis with Market Benchmarking\n\n` +
      `The captive insurance premium has been determined following OECD Guidelines ` +
      `Chapter X on Financial Transactions:\n\n` +
      `1. Coverage Type: ${input.coverageType}\n` +
      `2. Base Rate: ${params.baseRate} per 1,000 sum insured\n` +
      `3. Risk Factors Considered: ${input.riskFactors.join(", ") || "Standard"}\n` +
      `4. Claims History Adjustment: ${input.claimsHistory}\n\n` +
      `The premium is comparable to rates charged by commercial insurers for ` +
      `similar coverage and risk profiles.`
    );
  }

  // ===========================================================================
  // TREASURY SERVICES
  // ===========================================================================

  /**
   * Price treasury services
   */
  priceTreasuryServices(input: TreasuryServiceInput): TreasuryServiceResult {
    const serviceFee = getTreasuryServiceFee(input.serviceType);

    if (!serviceFee) {
      return this.getDefaultTreasuryPricing(input);
    }

    const baseFee = (serviceFee.feeRange.min + serviceFee.feeRange.max) / 2;

    // Volume discount (10% for high volume)
    const volumeDiscount = input.transactionVolume > 100000000 ? baseFee * 0.10 : 0;

    // Complexity premium
    const complexityPremium = input.complexity === "complex" ? baseFee * 0.15 : 0;

    const netFee = baseFee - volumeDiscount + complexityPremium;

    return {
      recommendedFee: {
        min: serviceFee.feeRange.min,
        max: serviceFee.feeRange.max,
      },
      feeStructure: {
        baseFee,
        volumeDiscount,
        complexityPremium,
        netFee,
      },
      comparableFees: TREASURY_SERVICE_FEES.filter(
        (f) => f.service.toLowerCase().includes(input.serviceType.toLowerCase().split(" ")[0])
      ),
      methodology: this.generateTreasuryMethodology(input, serviceFee),
      documentation: [
        "Service agreement",
        "Transaction volume records",
        "Fee schedules from comparable providers",
        "Cost allocation documentation",
      ],
    };
  }

  private getDefaultTreasuryPricing(input: TreasuryServiceInput): TreasuryServiceResult {
    return {
      recommendedFee: { min: 0.05, max: 0.25 },
      feeStructure: {
        baseFee: 0.15,
        volumeDiscount: 0,
        complexityPremium: 0,
        netFee: 0.15,
      },
      comparableFees: [],
      methodology: "Standard treasury service pricing applied",
      documentation: ["Service agreement", "Cost allocation analysis"],
    };
  }

  private generateTreasuryMethodology(
    input: TreasuryServiceInput,
    serviceFee: TreasuryServiceFee
  ): string {
    return (
      `TREASURY SERVICE PRICING METHODOLOGY\n\n` +
      `Service: ${input.serviceType}\n` +
      `Fee Type: ${serviceFee.feeType}\n` +
      `Basis: ${serviceFee.basis}\n\n` +
      `The service fee has been benchmarked against comparable third-party providers. ` +
      `Volume discounts and complexity adjustments have been applied as appropriate.`
    );
  }

  // ===========================================================================
  // CASH POOLING
  // ===========================================================================

  /**
   * Analyze cash pool arrangements
   */
  analyzeCashPool(input: CashPoolInput): CashPoolResult {
    const interestAllocation: CashPoolInterestAllocation[] = [];
    let totalBenefit = 0;

    // Get benchmark rates
    const depositRate = this.getPoolDepositRate(input);
    const borrowingRate = this.getPoolBorrowingRate(input);

    input.participatingEntities.forEach((entity) => {
      const marketRate = entity.averagePosition >= 0
        ? this.getStandaloneDepositRate(entity)
        : this.getStandaloneBorrowingRate(entity);

      const poolRate = entity.averagePosition >= 0 ? depositRate.max : borrowingRate.min;
      const interestAmount = Math.abs(entity.averagePosition) * (poolRate / 100) / 12;
      const benefit = entity.averagePosition >= 0
        ? (poolRate - marketRate) * Math.abs(entity.averagePosition) / 100 / 12
        : (marketRate - poolRate) * Math.abs(entity.averagePosition) / 100 / 12;

      interestAllocation.push({
        entity: entity.entityName,
        position: entity.averagePosition,
        interestRate: poolRate,
        interestAmount,
        marketRate,
        benefit,
      });

      totalBenefit += benefit;
    });

    // Pool leader compensation (10-15% of total benefit)
    const poolLeaderCompensation = totalBenefit * 0.125;

    return {
      interestAllocation,
      poolLeaderCompensation,
      armLengthInterestRates: {
        depositRate,
        borrowingRate,
        spread: borrowingRate.min - depositRate.max,
      },
      benefitSharingAnalysis: {
        totalBenefit,
        allocationMethod: input.spreadAllocation,
        entityBenefits: interestAllocation.map((ia) => ({
          entity: ia.entity,
          benefit: ia.benefit,
        })),
      },
      methodology: this.generateCashPoolMethodology(input),
      documentation: [
        "Cash pooling agreement",
        "Interest rate policy",
        "Standalone borrowing/lending quotes",
        "Benefit allocation analysis",
        "Pool leader compensation calculation",
      ],
    };
  }

  private getPoolDepositRate(input: CashPoolInput): { min: number; max: number } {
    const benchmark = getBenchmarkRate(input.poolLeaderCurrency);
    const baseRate = benchmark?.currentRate || 6.0;
    return { min: baseRate - 1.5, max: baseRate - 0.5 };
  }

  private getPoolBorrowingRate(input: CashPoolInput): { min: number; max: number } {
    const benchmark = getBenchmarkRate(input.poolLeaderCurrency);
    const baseRate = benchmark?.currentRate || 6.0;
    return { min: baseRate + 0.5, max: baseRate + 2.0 };
  }

  private getStandaloneDepositRate(entity: CashPoolEntity): number {
    const benchmark = getBenchmarkRate(entity.currency);
    return (benchmark?.currentRate || 6.0) - 2.0;
  }

  private getStandaloneBorrowingRate(entity: CashPoolEntity): number {
    const benchmark = getBenchmarkRate(entity.currency);
    const creditSpread = getCreditSpread(entity.creditRating) / 100;
    return (benchmark?.currentRate || 6.0) + creditSpread + 1.0;
  }

  private generateCashPoolMethodology(input: CashPoolInput): string {
    return (
      `CASH POOLING ARRANGEMENT ANALYSIS\n\n` +
      `Pool Type: ${input.poolType}\n` +
      `Pool Currency: ${input.poolLeaderCurrency}\n` +
      `Benefit Allocation: ${input.spreadAllocation}\n\n` +
      `The cash pool interest rates have been benchmarked against standalone ` +
      `borrowing and deposit rates. All participating entities receive a benefit ` +
      `compared to their standalone position. The pool leader receives compensation ` +
      `for its administrative and credit intermediation functions.`
    );
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export function createBFSIModule(): BFSIModule {
  return new BFSIModule();
}

let _bfsiModuleInstance: BFSIModule | null = null;

export function getBFSIModule(): BFSIModule {
  if (!_bfsiModuleInstance) {
    _bfsiModuleInstance = createBFSIModule();
  }
  return _bfsiModuleInstance;
}

// Re-export types
export { BFSITransactionType };
