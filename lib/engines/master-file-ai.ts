/**
 * ================================================================================
 * DIGICOMPLY MASTER FILE AI SERVICE
 * AI-Enhanced Master File (Form 3CEAA) Generation
 *
 * Integrates AI capabilities for:
 * - Organizational structure narratives
 * - Business description generation
 * - Supply chain documentation
 * - Intangibles strategy documentation
 * - Financial policy narratives
 * - FAR analysis generation
 * ================================================================================
 */

import {
  MasterFileBuilder,
  MasterFile,
  EntityType,
  BusinessActivity,
  IntangibleType,
  FinancingArrangementType,
  GroupEntity,
  ProductService,
  IntangibleAsset,
  FinancingArrangement,
  RDFacility,
  MASTER_FILE_TEMPLATES,
  validateMasterFile,
} from "./master-file-engine";
import {
  getTPDocumentGenerator,
  isAIConfigured,
  PromptType,
  QualityResult,
} from "../ai";

// =============================================================================
// TYPES
// =============================================================================

export interface OrganizationalStructureResult {
  narrative: string;
  keyObservations: string[];
  materialChanges: string[];
  aiGenerated: boolean;
  qualityScore?: QualityResult;
}

export interface BusinessDescriptionResult {
  description: string;
  profitDrivers: string[];
  supplyChainNarrative: string;
  farAnalysis: {
    functions: string[];
    assets: string[];
    risks: string[];
  };
  aiGenerated: boolean;
  qualityScore?: QualityResult;
}

export interface IntangiblesStrategyResult {
  strategy: string;
  dempeAnalysis: {
    development: string;
    enhancement: string;
    maintenance: string;
    protection: string;
    exploitation: string;
  };
  tpPolicy: string;
  aiGenerated: boolean;
  qualityScore?: QualityResult;
}

export interface FinancialPolicyResult {
  description: string;
  financingEntitiesNarrative: string;
  tpPolicy: string;
  aiGenerated: boolean;
  qualityScore?: QualityResult;
}

export interface FARAnalysisResult {
  functionsAnalysis: Array<{
    function: string;
    significance: "high" | "medium" | "low";
    description: string;
  }>;
  assetsAnalysis: Array<{
    asset: string;
    type: "tangible" | "intangible";
    ownership: string;
    description: string;
  }>;
  risksAnalysis: Array<{
    risk: string;
    bearer: string;
    mitigation: string;
  }>;
  entityCharacterization: string;
  methodImplication: string;
  aiGenerated: boolean;
  qualityScore?: QualityResult;
}

export interface EnhancedMasterFile extends MasterFile {
  aiGenerated: {
    organizationalStructure: boolean;
    businessDescription: boolean;
    intangibles: boolean;
    financialActivities: boolean;
  };
  generatedNarratives: {
    organizationalStructureNarrative?: string;
    businessDescriptionNarrative?: string;
    supplyChainNarrative?: string;
    intangiblesStrategyNarrative?: string;
    financialPolicyNarrative?: string;
    farAnalysisNarrative?: string;
  };
}

// =============================================================================
// MASTER FILE AI SERVICE
// =============================================================================

export class MasterFileAIService {
  private builder: MasterFileBuilder;
  private assessmentYear: string;

  constructor(assessmentYear: string = "2025-26") {
    this.assessmentYear = assessmentYear;
    this.builder = new MasterFileBuilder();
  }

  // ===========================================================================
  // ORGANIZATIONAL STRUCTURE
  // ===========================================================================

  /**
   * Generate AI-enhanced organizational structure narrative
   */
  async generateOrganizationalStructure(params: {
    groupName: string;
    ultimateParent: string;
    parentCountry: string;
    reportingEntity: string;
    entityType: EntityType;
    groupEntities: GroupEntity[];
    recentRestructuring?: string;
  }): Promise<OrganizationalStructureResult> {
    // Format group entities for prompt
    const entitiesStr = params.groupEntities
      .map(
        (e) =>
          `- ${e.name} (${e.country}): ${e.ownershipPercentage}% ownership, ` +
          `Legal Form: ${e.legalForm}, Activities: ${e.activities.join(", ")}`
      )
      .join("\n");

    if (isAIConfigured()) {
      try {
        const generator = getTPDocumentGenerator();
        const response = await generator.generateCustomPrompt(
          PromptType.ORGANIZATIONAL_STRUCTURE,
          {
            groupName: params.groupName,
            ultimateParent: params.ultimateParent,
            parentCountry: params.parentCountry,
            reportingEntity: params.reportingEntity,
            entityType: params.entityType,
            groupEntities: entitiesStr,
            assessmentYear: this.assessmentYear,
            recentRestructuring: params.recentRestructuring,
          }
        );

        if (response.success && response.content) {
          return {
            narrative: response.content,
            keyObservations: this.extractKeyObservations(response.content),
            materialChanges: params.recentRestructuring ? [params.recentRestructuring] : [],
            aiGenerated: true,
            qualityScore: response.qualityScore,
          };
        }
      } catch (error) {
        console.error("AI organizational structure generation failed:", error);
      }
    }

    // Fallback to template-based narrative
    return {
      narrative: this.generateTemplateOrgStructure(params),
      keyObservations: [
        `${params.groupName} is headquartered in ${params.parentCountry}`,
        `The group comprises ${params.groupEntities.length} operating entities`,
        `${params.reportingEntity} operates as a ${params.entityType} in India`,
      ],
      materialChanges: params.recentRestructuring ? [params.recentRestructuring] : [],
      aiGenerated: false,
    };
  }

  private generateTemplateOrgStructure(params: {
    groupName: string;
    ultimateParent: string;
    parentCountry: string;
    reportingEntity: string;
    entityType: EntityType;
    groupEntities: GroupEntity[];
  }): string {
    return `${params.groupName} Group Organizational Structure

The ${params.groupName} group is an international group of companies with ${params.ultimateParent} as the ultimate parent entity, incorporated and tax resident in ${params.parentCountry}.

The group comprises ${params.groupEntities.length} operating entities across multiple jurisdictions. ${params.reportingEntity}, the Indian constituent entity, operates as a ${params.entityType.replace(/_/g, " ")} within the group structure.

The ownership structure follows a traditional holding pattern with the ultimate parent holding direct or indirect stakes in all constituent entities. The Indian entity is engaged in activities aligned with the group's global business strategy.

Key entities in the group structure include:
${params.groupEntities.slice(0, 5).map((e) => `- ${e.name} (${e.country}): ${e.activities.join(", ")}`).join("\n")}`;
  }

  private extractKeyObservations(content: string): string[] {
    // Extract bullet points or key sentences from AI content
    const observations: string[] = [];
    const lines = content.split("\n");
    for (const line of lines) {
      if (line.trim().startsWith("-") || line.trim().startsWith("•")) {
        observations.push(line.trim().replace(/^[-•]\s*/, ""));
      }
    }
    return observations.slice(0, 5);
  }

  // ===========================================================================
  // BUSINESS DESCRIPTION
  // ===========================================================================

  /**
   * Generate AI-enhanced business description
   */
  async generateBusinessDescription(params: {
    groupName: string;
    industrySector: string;
    businessActivities: BusinessActivity[];
    entityCharacterization: string;
    revenue: number;
    exportRevenue: number;
    employeeCount: number;
    productsServices: ProductService[];
    geographicMarkets: string[];
    competitors?: string[];
    functions?: string[];
    assets?: string[];
    risks?: string[];
  }): Promise<BusinessDescriptionResult> {
    const productsStr = params.productsServices
      .map((p) => `- ${p.name}: ${p.description} (${p.revenuePercentage}% revenue)`)
      .join("\n");

    if (isAIConfigured()) {
      try {
        const generator = getTPDocumentGenerator();
        const response = await generator.generateCustomPrompt(
          PromptType.BUSINESS_DESCRIPTION,
          {
            groupName: params.groupName,
            industrySector: params.industrySector,
            businessActivities: params.businessActivities.join(", "),
            entityCharacterization: params.entityCharacterization,
            revenue: `INR ${(params.revenue / 10000000).toFixed(2)} Cr`,
            exportRevenue: `INR ${(params.exportRevenue / 10000000).toFixed(2)} Cr`,
            employeeCount: params.employeeCount.toString(),
            productsServices: productsStr,
            geographicMarkets: params.geographicMarkets.join(", "),
            competitors: params.competitors?.join(", ") || "Not specified",
            functionalProfile: params.functions ? "yes" : "",
            functions: params.functions?.join(", ") || "",
            assets: params.assets?.join(", ") || "",
            risks: params.risks?.join(", ") || "",
          }
        );

        if (response.success && response.content) {
          return {
            description: response.content,
            profitDrivers: this.extractProfitDrivers(response.content),
            supplyChainNarrative: this.extractSupplyChain(response.content),
            farAnalysis: {
              functions: params.functions || [],
              assets: params.assets || [],
              risks: params.risks || [],
            },
            aiGenerated: true,
            qualityScore: response.qualityScore,
          };
        }
      } catch (error) {
        console.error("AI business description generation failed:", error);
      }
    }

    // Fallback to template
    const template = this.getIndustryTemplate(params.industrySector);
    return {
      description: this.generateTemplateBusinessDescription(params, template),
      profitDrivers: template?.profitDrivers || [],
      supplyChainNarrative: template?.supplyChain || "",
      farAnalysis: {
        functions: template?.functions || params.functions || [],
        assets: template?.assets || params.assets || [],
        risks: template?.risks || params.risks || [],
      },
      aiGenerated: false,
    };
  }

  private getIndustryTemplate(industry: string): typeof MASTER_FILE_TEMPLATES.itServicesCaptive | null {
    const lowerIndustry = industry.toLowerCase();
    if (lowerIndustry.includes("it") || lowerIndustry.includes("software")) {
      return MASTER_FILE_TEMPLATES.itServicesCaptive;
    }
    if (lowerIndustry.includes("r&d") || lowerIndustry.includes("research")) {
      return MASTER_FILE_TEMPLATES.contractRD;
    }
    if (lowerIndustry.includes("distribution") || lowerIndustry.includes("trading")) {
      return MASTER_FILE_TEMPLATES.distributionEntity;
    }
    return null;
  }

  private generateTemplateBusinessDescription(
    params: {
      groupName: string;
      industrySector: string;
      entityCharacterization: string;
      revenue: number;
      productsServices: ProductService[];
      geographicMarkets: string[];
    },
    template: typeof MASTER_FILE_TEMPLATES.itServicesCaptive | null
  ): string {
    return `Business Description - ${params.groupName}

Industry Sector: ${params.industrySector}
Entity Characterization: ${params.entityCharacterization}

${params.groupName} operates in the ${params.industrySector} sector, providing services to group entities and third-party customers. The Indian entity is characterized as a ${params.entityCharacterization}.

Key Products/Services:
${params.productsServices.map((p) => `- ${p.name}: ${p.description}`).join("\n")}

Geographic Markets: ${params.geographicMarkets.join(", ")}

${template ? `\nSupply Chain:\n${template.supplyChain}` : ""}

The entity's operations are aligned with the group's global strategy, focusing on operational excellence and service delivery.`;
  }

  private extractProfitDrivers(content: string): string[] {
    const drivers: string[] = [];
    const profitSection = content.match(/profit drivers?:?\s*([\s\S]*?)(?=\n\n|supply chain|$)/i);
    if (profitSection) {
      const lines = profitSection[1].split("\n");
      for (const line of lines) {
        if (line.trim().startsWith("-") || line.trim().startsWith("•") || line.trim().match(/^\d+\./)) {
          drivers.push(line.trim().replace(/^[-•\d.]\s*/, ""));
        }
      }
    }
    return drivers.slice(0, 5);
  }

  private extractSupplyChain(content: string): string {
    const supplySection = content.match(/supply chain:?\s*([\s\S]*?)(?=\n\n|principal functions|$)/i);
    return supplySection ? supplySection[1].trim() : "";
  }

  // ===========================================================================
  // INTANGIBLES STRATEGY
  // ===========================================================================

  /**
   * Generate AI-enhanced intangibles strategy documentation
   */
  async generateIntangiblesStrategy(params: {
    groupName: string;
    industry: string;
    intangiblesList: IntangibleAsset[];
    rdFacilities: RDFacility[];
    rdManagementLocation: string;
    legalOwner: string;
    economicOwner: string;
    intangibleTransfers?: string;
    costContributionArrangements?: string;
  }): Promise<IntangiblesStrategyResult> {
    const intangiblesStr = params.intangiblesList
      .map(
        (i) =>
          `- ${i.type}: ${i.description} (Legal: ${i.legalOwner}, Economic: ${i.economicOwner})`
      )
      .join("\n");

    const rdStr = params.rdFacilities
      .map((r) => `- ${r.location} (${r.country}): ${r.activities.join(", ")}, ${r.employeeCount} employees`)
      .join("\n");

    if (isAIConfigured()) {
      try {
        const generator = getTPDocumentGenerator();
        const response = await generator.generateCustomPrompt(
          PromptType.INTANGIBLES_STRATEGY,
          {
            groupName: params.groupName,
            industry: params.industry,
            intangiblesList: intangiblesStr,
            rdFacilities: rdStr,
            rdManagementLocation: params.rdManagementLocation,
            legalOwner: params.legalOwner,
            economicOwner: params.economicOwner,
            intangibleTransfers: params.intangibleTransfers,
            costContributionArrangements: params.costContributionArrangements,
          }
        );

        if (response.success && response.content) {
          return {
            strategy: response.content,
            dempeAnalysis: this.extractDEMPE(response.content),
            tpPolicy: this.extractTPPolicy(response.content),
            aiGenerated: true,
            qualityScore: response.qualityScore,
          };
        }
      } catch (error) {
        console.error("AI intangibles strategy generation failed:", error);
      }
    }

    // Fallback
    return {
      strategy: this.generateTemplateIntangiblesStrategy(params),
      dempeAnalysis: {
        development: `R&D activities performed at ${params.rdManagementLocation}`,
        enhancement: "Ongoing enhancements directed by IP owner",
        maintenance: "Maintenance performed by development centers",
        protection: `Legal protection managed by ${params.legalOwner}`,
        exploitation: `Commercial exploitation by ${params.economicOwner}`,
      },
      tpPolicy: "Arm's length remuneration for contract R&D and cost plus for routine IP-related services",
      aiGenerated: false,
    };
  }

  private generateTemplateIntangiblesStrategy(params: {
    groupName: string;
    legalOwner: string;
    economicOwner: string;
    rdManagementLocation: string;
  }): string {
    return `Intangibles Strategy - ${params.groupName}

The group's intangibles strategy centers on centralized ownership and decentralized development. ${params.legalOwner} serves as the legal owner of key intellectual property, while economic ownership and strategic decisions rest with ${params.economicOwner}.

R&D activities are managed from ${params.rdManagementLocation}, with development centers contributing under contract R&D arrangements. The transfer pricing policy for intangibles ensures arm's length remuneration for all DEMPE functions performed by group entities.

The Indian entity participates in intangible development activities under a contract R&D model, receiving cost-plus remuneration for services rendered. All IP developed vests with the principal entity as per intercompany agreements.`;
  }

  private extractDEMPE(content: string): IntangiblesStrategyResult["dempeAnalysis"] {
    const dempe = {
      development: "",
      enhancement: "",
      maintenance: "",
      protection: "",
      exploitation: "",
    };

    const patterns = {
      development: /development:?\s*([^\n]+)/i,
      enhancement: /enhancement:?\s*([^\n]+)/i,
      maintenance: /maintenance:?\s*([^\n]+)/i,
      protection: /protection:?\s*([^\n]+)/i,
      exploitation: /exploitation:?\s*([^\n]+)/i,
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = content.match(pattern);
      if (match) {
        dempe[key as keyof typeof dempe] = match[1].trim();
      }
    }

    return dempe;
  }

  private extractTPPolicy(content: string): string {
    const policyMatch = content.match(/transfer pricing policy:?\s*([\s\S]*?)(?=\n\n|$)/i);
    return policyMatch ? policyMatch[1].trim() : "";
  }

  // ===========================================================================
  // FINANCIAL POLICY
  // ===========================================================================

  /**
   * Generate AI-enhanced financial policy documentation
   */
  async generateFinancialPolicy(params: {
    groupName: string;
    financingEntities: Array<{ entityName: string; country: string; function: string }>;
    financingArrangements: FinancingArrangement[];
    cashPooling?: string;
    guarantees?: string;
    interestRatePolicy: string;
    currencyManagement: string;
  }): Promise<FinancialPolicyResult> {
    const entitiesStr = params.financingEntities
      .map((e) => `- ${e.entityName} (${e.country}): ${e.function}`)
      .join("\n");

    const arrangementsStr = params.financingArrangements
      .map(
        (a) =>
          `- ${a.type}: ${a.lender} -> ${a.borrowers.join(", ")}, ` +
          `${a.currency} ${a.amount.toLocaleString()}, ${a.interestRate}%`
      )
      .join("\n");

    if (isAIConfigured()) {
      try {
        const generator = getTPDocumentGenerator();
        const response = await generator.generateCustomPrompt(
          PromptType.FINANCIAL_POLICY,
          {
            groupName: params.groupName,
            financingEntities: entitiesStr,
            financingArrangements: arrangementsStr,
            cashPooling: params.cashPooling,
            guarantees: params.guarantees,
            interestRatePolicy: params.interestRatePolicy,
            currencyManagement: params.currencyManagement,
          }
        );

        if (response.success && response.content) {
          return {
            description: response.content,
            financingEntitiesNarrative: this.extractFinancingEntities(response.content),
            tpPolicy: this.extractFinancialTPPolicy(response.content),
            aiGenerated: true,
            qualityScore: response.qualityScore,
          };
        }
      } catch (error) {
        console.error("AI financial policy generation failed:", error);
      }
    }

    // Fallback
    return {
      description: this.generateTemplateFinancialPolicy(params),
      financingEntitiesNarrative: `Central financing managed by ${params.financingEntities[0]?.entityName || "group treasury"}`,
      tpPolicy: params.interestRatePolicy,
      aiGenerated: false,
    };
  }

  private generateTemplateFinancialPolicy(params: {
    groupName: string;
    financingEntities: Array<{ entityName: string; country: string; function: string }>;
    interestRatePolicy: string;
    currencyManagement: string;
  }): string {
    const primaryFinancer = params.financingEntities[0];
    return `Intercompany Financial Activities - ${params.groupName}

The ${params.groupName} group's intercompany financing structure is designed to efficiently allocate capital across group entities while maintaining arm's length pricing.

Central Financing Function:
${primaryFinancer ? `${primaryFinancer.entityName} (${primaryFinancer.country}) serves as the primary financing entity, performing ${primaryFinancer.function}.` : "Group treasury manages intercompany financing activities."}

Interest Rate Policy:
${params.interestRatePolicy}

Currency Management:
${params.currencyManagement}

All intercompany financial transactions are priced at arm's length, with reference to applicable Safe Harbour rules under Rule 10TD-10TG of the Income Tax Rules for eligible transactions.`;
  }

  private extractFinancingEntities(content: string): string {
    const match = content.match(/financing entit(?:y|ies):?\s*([\s\S]*?)(?=\n\n|interest|$)/i);
    return match ? match[1].trim() : "";
  }

  private extractFinancialTPPolicy(content: string): string {
    const match = content.match(/transfer pricing policy:?\s*([\s\S]*?)(?=\n\n|$)/i);
    return match ? match[1].trim() : "";
  }

  // ===========================================================================
  // FAR ANALYSIS
  // ===========================================================================

  /**
   * Generate comprehensive FAR analysis
   */
  async generateFARAnalysis(params: {
    entityName: string;
    entityType: string;
    industry: string;
    principalActivity: string;
    functions: string[];
    assets: string[];
    risks: string[];
    relatedPartyTransactions: string;
  }): Promise<FARAnalysisResult> {
    if (isAIConfigured()) {
      try {
        const generator = getTPDocumentGenerator();
        const response = await generator.generateCustomPrompt(
          PromptType.FAR_ANALYSIS,
          {
            entityName: params.entityName,
            entityType: params.entityType,
            industry: params.industry,
            principalActivity: params.principalActivity,
            functions: params.functions.join("\n- "),
            assets: params.assets.join("\n- "),
            risks: params.risks.join("\n- "),
            relatedPartyTransactions: params.relatedPartyTransactions,
          }
        );

        if (response.success && response.content) {
          return {
            functionsAnalysis: params.functions.map((f) => ({
              function: f,
              significance: this.assessSignificance(f) as "high" | "medium" | "low",
              description: `${f} performed as part of ${params.principalActivity}`,
            })),
            assetsAnalysis: params.assets.map((a) => ({
              asset: a,
              type: this.classifyAsset(a),
              ownership: params.entityName,
              description: `${a} employed in business operations`,
            })),
            risksAnalysis: params.risks.map((r) => ({
              risk: r,
              bearer: params.entityName,
              mitigation: "Risk managed within operational parameters",
            })),
            entityCharacterization: this.deriveCharacterization(params),
            methodImplication: this.suggestMethod(params),
            aiGenerated: true,
            qualityScore: response.qualityScore,
          };
        }
      } catch (error) {
        console.error("AI FAR analysis generation failed:", error);
      }
    }

    // Fallback
    return {
      functionsAnalysis: params.functions.map((f) => ({
        function: f,
        significance: "medium" as const,
        description: `${f} performed as routine activity`,
      })),
      assetsAnalysis: params.assets.map((a) => ({
        asset: a,
        type: this.classifyAsset(a),
        ownership: params.entityName,
        description: `${a} employed in operations`,
      })),
      risksAnalysis: params.risks.map((r) => ({
        risk: r,
        bearer: params.entityName,
        mitigation: "Risk managed operationally",
      })),
      entityCharacterization: this.deriveCharacterization(params),
      methodImplication: this.suggestMethod(params),
      aiGenerated: false,
    };
  }

  private assessSignificance(func: string): string {
    const highSignificance = ["strategic", "management", "decision", "r&d", "development"];
    const lowSignificance = ["administrative", "routine", "support", "clerical"];

    const lowerFunc = func.toLowerCase();
    if (highSignificance.some((k) => lowerFunc.includes(k))) return "high";
    if (lowSignificance.some((k) => lowerFunc.includes(k))) return "low";
    return "medium";
  }

  private classifyAsset(asset: string): "tangible" | "intangible" {
    const intangibleKeywords = ["ip", "software", "patent", "trademark", "know-how", "license", "brand"];
    return intangibleKeywords.some((k) => asset.toLowerCase().includes(k)) ? "intangible" : "tangible";
  }

  private deriveCharacterization(params: { entityType: string; functions: string[] }): string {
    const funcStr = params.functions.join(" ").toLowerCase();
    if (funcStr.includes("r&d") || funcStr.includes("research")) {
      return "Contract R&D Service Provider";
    }
    if (funcStr.includes("software") || funcStr.includes("it services")) {
      return "Contract IT/ITeS Service Provider";
    }
    if (funcStr.includes("distribution") || funcStr.includes("sales")) {
      return "Limited Risk Distributor";
    }
    if (funcStr.includes("manufacturing")) {
      return "Contract Manufacturer";
    }
    return "Contract Service Provider";
  }

  private suggestMethod(params: { entityType: string }): string {
    return "TNMM with OP/OC as the PLI is the most appropriate method given the entity's characterization as a " +
      "routine service provider. The method allows comparison with functionally similar companies and " +
      "reliable data is available from Indian databases.";
  }

  // ===========================================================================
  // ENHANCED MASTER FILE BUILDER
  // ===========================================================================

  /**
   * Build complete Master File with AI-enhanced narratives
   */
  async buildEnhancedMasterFile(params: {
    reportingEntity: string;
    reportingPAN: string;
    entityType: EntityType;
    groupName: string;
    ultimateParent: string;
    parentCountry: string;
    groupEntities: GroupEntity[];
    industry: string;
    businessActivities: BusinessActivity[];
    productsServices: ProductService[];
    geographicMarkets: string[];
    revenue: number;
    exportRevenue: number;
    employeeCount: number;
    intangibles: IntangibleAsset[];
    rdFacilities: RDFacility[];
    financingArrangements: FinancingArrangement[];
    consolidatedRevenue: number;
    consolidatedPBT: number;
    consolidatedTax: number;
  }): Promise<EnhancedMasterFile> {
    // Generate AI-enhanced narratives in parallel
    const [orgStructure, businessDesc, intangiblesStrategy, financialPolicy] = await Promise.all([
      this.generateOrganizationalStructure({
        groupName: params.groupName,
        ultimateParent: params.ultimateParent,
        parentCountry: params.parentCountry,
        reportingEntity: params.reportingEntity,
        entityType: params.entityType,
        groupEntities: params.groupEntities,
      }),
      this.generateBusinessDescription({
        groupName: params.groupName,
        industrySector: params.industry,
        businessActivities: params.businessActivities,
        entityCharacterization: "Contract Service Provider",
        revenue: params.revenue,
        exportRevenue: params.exportRevenue,
        employeeCount: params.employeeCount,
        productsServices: params.productsServices,
        geographicMarkets: params.geographicMarkets,
      }),
      this.generateIntangiblesStrategy({
        groupName: params.groupName,
        industry: params.industry,
        intangiblesList: params.intangibles,
        rdFacilities: params.rdFacilities,
        rdManagementLocation: params.parentCountry,
        legalOwner: params.ultimateParent,
        economicOwner: params.ultimateParent,
      }),
      this.generateFinancialPolicy({
        groupName: params.groupName,
        financingEntities: [
          { entityName: params.ultimateParent, country: params.parentCountry, function: "Group Treasury" },
        ],
        financingArrangements: params.financingArrangements,
        interestRatePolicy: "Arm's length rates based on credit rating and market conditions",
        currencyManagement: "Natural hedging with selective forward contracts",
      }),
    ]);

    // Build base Master File
    this.builder
      .createNew(this.assessmentYear, params.reportingEntity, params.reportingPAN, params.entityType)
      .setUltimateParent(params.ultimateParent, params.parentCountry)
      .setMneGroupName(params.groupName)
      .setOwnershipChart(orgStructure.narrative)
      .setProfitDrivers(businessDesc.profitDrivers)
      .setSupplyChain(businessDesc.supplyChainNarrative)
      .setGeographicMarkets(params.geographicMarkets)
      .setFunctionalAnalysis(
        businessDesc.farAnalysis.functions,
        businessDesc.farAnalysis.risks,
        businessDesc.farAnalysis.assets
      )
      .setIntangiblesStrategy(intangiblesStrategy.strategy)
      .setIntangiblesTPPolicy(intangiblesStrategy.tpPolicy)
      .setFinancingDescription(financialPolicy.description)
      .setFinancialTPPolicy(financialPolicy.tpPolicy)
      .setConsolidatedFinancials(
        params.consolidatedRevenue,
        params.consolidatedPBT,
        params.consolidatedTax
      );

    // Add entities
    for (const entity of params.groupEntities) {
      this.builder.addGroupEntity(
        entity.name,
        entity.country,
        entity.countryCode,
        entity.ownershipPercentage,
        entity.legalForm,
        entity.activities
      );
    }

    // Add products/services
    for (const product of params.productsServices) {
      this.builder.addProductService(
        product.name,
        product.description,
        product.revenuePercentage,
        product.keyMarkets
      );
    }

    // Add intangibles
    for (const intangible of params.intangibles) {
      this.builder.addIntangible(
        intangible.type,
        intangible.description,
        intangible.legalOwner,
        intangible.economicOwner,
        intangible.developmentLocation,
        intangible.relatedAgreements
      );
    }

    // Add R&D facilities
    for (const facility of params.rdFacilities) {
      this.builder.addRDFacility(
        facility.location,
        facility.country,
        facility.activities,
        facility.employeeCount
      );
    }

    // Add financing arrangements
    for (const arrangement of params.financingArrangements) {
      this.builder.addFinancingArrangement(
        arrangement.type,
        arrangement.lender,
        arrangement.borrowers,
        arrangement.amount,
        arrangement.currency,
        arrangement.interestRate,
        arrangement.terms
      );
    }

    const baseMasterFile = this.builder.build();

    // Return enhanced Master File
    return {
      ...baseMasterFile,
      aiGenerated: {
        organizationalStructure: orgStructure.aiGenerated,
        businessDescription: businessDesc.aiGenerated,
        intangibles: intangiblesStrategy.aiGenerated,
        financialActivities: financialPolicy.aiGenerated,
      },
      generatedNarratives: {
        organizationalStructureNarrative: orgStructure.narrative,
        businessDescriptionNarrative: businessDesc.description,
        supplyChainNarrative: businessDesc.supplyChainNarrative,
        intangiblesStrategyNarrative: intangiblesStrategy.strategy,
        financialPolicyNarrative: financialPolicy.description,
      },
    };
  }

  /**
   * Validate Master File with AI suggestions
   */
  validateWithSuggestions(masterFile: MasterFile): {
    errors: Record<string, string[]>;
    suggestions: string[];
    completeness: number;
  } {
    const errors = validateMasterFile(masterFile);
    const suggestions: string[] = [];

    // Generate suggestions based on validation errors
    if (errors.organizationalStructure.length > 0) {
      suggestions.push("Add more details about group entities and their roles");
    }
    if (errors.businessDescription.length > 0) {
      suggestions.push("Expand profit drivers and supply chain description");
    }
    if (errors.intangibles.length > 0) {
      suggestions.push("Document intangibles strategy and DEMPE functions");
    }

    // Calculate completeness
    const totalErrors = Object.values(errors).flat().length;
    const maxErrors = 20; // Approximate max possible errors
    const completeness = Math.max(0, Math.round((1 - totalErrors / maxErrors) * 100));

    return { errors, suggestions, completeness };
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export function createMasterFileAIService(assessmentYear?: string): MasterFileAIService {
  return new MasterFileAIService(assessmentYear);
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

export {
  EntityType,
  BusinessActivity,
  IntangibleType,
  FinancingArrangementType,
  MASTER_FILE_TEMPLATES,
} from "./master-file-engine";
