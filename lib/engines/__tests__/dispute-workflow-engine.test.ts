/**
 * Dispute Workflow Engine - Unit Tests
 * Tests DRP/ITAT workflow management
 */

import { describe, test, expect, beforeEach } from "@jest/globals";
import {
  DisputeWorkflowEngine,
  createDisputeWorkflowEngine,
  TPOOrder,
  TaxpayerDetails,
  DraftAssessmentOrder,
  DRPObjection,
  GroundsOfAppeal,
} from "../dispute-workflow-engine";
import {
  DISPUTE_TIMELINES,
  FORM_REQUIREMENTS,
  STANDARD_TP_GROUNDS,
  DisputeStage,
  DisputeStatus,
  FormType,
  calculateDeadline,
  isWithinTimeLimit,
  calculateAppealFee,
} from "../constants/dispute-timelines";

describe("Dispute Workflow Engine", () => {
  let engine: DisputeWorkflowEngine;

  beforeEach(() => {
    engine = createDisputeWorkflowEngine(new Date());
  });

  describe("Engine Instantiation", () => {
    test("should create engine instance", () => {
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(DisputeWorkflowEngine);
    });

    test("should create engine with custom date", () => {
      const customDate = new Date("2024-06-15");
      const customEngine = createDisputeWorkflowEngine(customDate);
      expect(customEngine).toBeDefined();
    });
  });

  describe("DRP Eligibility", () => {
    test("should validate DRP eligibility within timeline", () => {
      const tpoOrder: TPOOrder = {
        orderNumber: "TPO/DEL/2024/001",
        orderDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        assessmentYear: "2024-25",
        primaryAdjustment: 50000000,
        transactionWiseAdjustments: [
          {
            transactionType: "IT Services",
            reportedValue: 100000000,
            alpDetermined: 150000000,
            adjustmentAmount: 50000000,
            natureCode: "01",
            relatedParty: "Foreign AE",
          },
        ],
        reasonsForAdjustment: ["Rejection of comparables"],
        comparablesSelected: ["Company A", "Company B"],
        comparablesRejected: ["Company C"],
        methodApplied: "TNMM",
        taxpayerDetails: {
          name: "Test Company Pvt Ltd",
          pan: "AABCT1234A",
          address: "123 Business Park, Mumbai",
        },
      };

      const draftOrder: DraftAssessmentOrder = {
        orderNumber: "DO/DEL/2024/001",
        orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        assessmentYear: "2024-25",
        tpoOrderReference: "TPO/DEL/2024/001",
        totalIncome: 100000000,
        tpAdjustment: 50000000,
        otherAdditions: 0,
        demandRaised: 15000000,
        interestComputed: 3000000,
      };

      const eligibility = engine.validateDRPEligibility(tpoOrder, draftOrder);

      expect(eligibility).toBeDefined();
      expect(eligibility.isEligible).toBeDefined();
    });
  });

  describe("DRP Application Creation", () => {
    test("should create DRP application", () => {
      const tpoOrder: TPOOrder = {
        orderNumber: "TPO/DEL/2024/001",
        orderDate: new Date(),
        assessmentYear: "2024-25",
        primaryAdjustment: 50000000,
        transactionWiseAdjustments: [
          {
            transactionType: "IT Services",
            reportedValue: 100000000,
            alpDetermined: 150000000,
            adjustmentAmount: 50000000,
            natureCode: "01",
            relatedParty: "Foreign AE",
          },
        ],
        reasonsForAdjustment: ["Rejection of comparables"],
        comparablesSelected: ["Company A", "Company B"],
        comparablesRejected: ["Company C"],
        methodApplied: "TNMM",
        taxpayerDetails: {
          name: "Test Company Pvt Ltd",
          pan: "AABCT1234A",
          address: "123 Business Park, Mumbai",
          email: "test@company.com",
        },
      };

      const draftOrder: DraftAssessmentOrder = {
        orderNumber: "DO/DEL/2024/001",
        orderDate: new Date(),
        assessmentYear: "2024-25",
        tpoOrderReference: "TPO/DEL/2024/001",
        totalIncome: 100000000,
        tpAdjustment: 50000000,
        otherAdditions: 0,
        demandRaised: 15000000,
        interestComputed: 3000000,
      };

      const objections: DRPObjection[] = [
        {
          objectionNumber: 1,
          issueCategory: "Comparables",
          briefDescription: "Incorrect rejection of comparables",
          detailedObjection: "The TPO incorrectly rejected comparable companies...",
          legalBasis: ["Rule 10B(4)"],
          caseLawCitations: ["Sony India vs. DCIT"],
          reliefSought: 50000000,
        },
      ];

      const application = engine.createDRPApplication(tpoOrder, draftOrder, objections);

      expect(application).toBeDefined();
      expect(application.applicationId).toBeDefined();
    });
  });

  describe("DRP Timeline", () => {
    test("should calculate DRP timeline", () => {
      const filingDate = new Date();
      const timeline = engine.calculateDRPTimeline(filingDate);

      expect(timeline).toBeDefined();
      expect(timeline.filingDate).toBeDefined();
    });
  });

  describe("ITAT Appeal Creation", () => {
    test("should create ITAT appeal", () => {
      const orderAppealed = {
        orderNumber: "AO/DEL/2024/001",
        orderDate: new Date(),
      };

      const taxpayer: TaxpayerDetails = {
        name: "Test Company Pvt Ltd",
        pan: "AABCT1234A",
        address: "123 Business Park, Mumbai",
        email: "test@company.com",
      };

      const groundsOfAppeal: GroundsOfAppeal = {
        generalGrounds: [
          "The order is bad in law",
          "The order is against principles of natural justice",
        ],
        specificGrounds: [
          {
            groundNumber: 1,
            category: "TP Adjustment",
            ground: "The TPO erred in rejecting comparables",
            relatedLegalSections: ["Section 92CA"],
            precedentsCited: ["Sony India vs. DCIT"],
          },
        ],
        reliefPrayer: "Delete the addition made",
      };

      const appeal = engine.createITATAppeal(
        orderAppealed,
        taxpayer,
        "2024-25",
        groundsOfAppeal,
        50000000
      );

      expect(appeal).toBeDefined();
      expect(appeal.appealNumber).toBeDefined();
    });
  });

  describe("Form Generation", () => {
    test("should generate Form 35 data", () => {
      const taxpayer: TaxpayerDetails = {
        name: "Test Company Pvt Ltd",
        pan: "AABCT1234A",
        address: "Mumbai",
        email: "test@company.com",
      };

      const orderAppealed = {
        orderNumber: "AO/DEL/2024/001",
        orderDate: new Date(),
        authority: "AO",
      };

      const grounds: GroundsOfAppeal = {
        generalGrounds: ["Ground 1", "Ground 2"],
        specificGrounds: [],
        reliefPrayer: "Delete the addition",
      };

      const formData = engine.generateForm35(
        taxpayer,
        orderAppealed,
        "2024-25",
        grounds,
        50000000
      );

      expect(formData).toBeDefined();
    });

    test("should generate Form 36 data", () => {
      const taxpayer: TaxpayerDetails = {
        name: "Test Company Pvt Ltd",
        pan: "AABCT1234A",
        address: "Mumbai",
        email: "test@company.com",
      };

      const lowerOrder = {
        orderNumber: "CIT(A)/DEL/2024/001",
        orderDate: new Date(),
        authority: "CIT(A)",
      };

      const grounds: GroundsOfAppeal = {
        generalGrounds: ["Ground 1"],
        specificGrounds: [],
        reliefPrayer: "Delete the addition",
      };

      const formData = engine.generateForm36(
        taxpayer,
        lowerOrder,
        "2024-25",
        grounds,
        50000000
      );

      expect(formData).toBeDefined();
    });
  });

  describe("Deadline Calculation Helper", () => {
    test("should calculate deadline correctly", () => {
      const startDate = new Date("2024-06-01");
      const deadline = calculateDeadline(startDate, 30);

      expect(deadline).toBeDefined();
      expect(deadline.getTime()).toBeGreaterThan(startDate.getTime());
    });
  });

  describe("Time Limit Check Helper", () => {
    test("should check if within time limit", () => {
      const orderDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000); // 20 days ago
      const filingDate = new Date();
      const limitDays = 30;

      const result = isWithinTimeLimit(orderDate, filingDate, limitDays);

      expect(result).toBeDefined();
      expect(result.isValid).toBe(true);
      expect(result.daysUsed).toBeDefined();
      expect(result.daysRemaining).toBeDefined();
    });

    test("should detect exceeded time limit", () => {
      const orderDate = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000); // 40 days ago
      const filingDate = new Date();
      const limitDays = 30;

      const result = isWithinTimeLimit(orderDate, filingDate, limitDays);

      expect(result.isValid).toBe(false);
    });
  });

  describe("Appeal Fee Calculation", () => {
    test("should calculate appeal fee for ITAT", () => {
      const fee = calculateAppealFee(50000000, "itat");

      expect(fee).toBeDefined();
      expect(fee).toBeGreaterThan(0);
    });

    test("should calculate appeal fee for CIT(A)", () => {
      const fee = calculateAppealFee(150000, "citA");

      expect(fee).toBeDefined();
      expect(fee).toBeGreaterThan(0);
    });
  });

  describe("Constants - Dispute Timelines", () => {
    test("should have DRP timelines defined", () => {
      expect(DISPUTE_TIMELINES.drp).toBeDefined();
      expect(DISPUTE_TIMELINES.drp.filingDeadline).toBe(30);
    });

    test("should have ITAT timelines defined", () => {
      expect(DISPUTE_TIMELINES.itat).toBeDefined();
      expect(DISPUTE_TIMELINES.itat.filingDeadline).toBe(60);
    });

    test("should have High Court timelines defined", () => {
      expect(DISPUTE_TIMELINES.highCourt).toBeDefined();
      expect(DISPUTE_TIMELINES.highCourt.filingDeadline).toBe(120);
    });
  });

  describe("Constants - Form Requirements", () => {
    test("should have form requirements defined", () => {
      expect(FORM_REQUIREMENTS).toBeDefined();
      expect(FORM_REQUIREMENTS[FormType.FORM_35A]).toBeDefined();
      expect(FORM_REQUIREMENTS[FormType.FORM_35]).toBeDefined();
      expect(FORM_REQUIREMENTS[FormType.FORM_36]).toBeDefined();
    });
  });

  describe("Constants - Standard Grounds", () => {
    test("should have standard TP grounds defined", () => {
      expect(STANDARD_TP_GROUNDS).toBeDefined();
      expect(STANDARD_TP_GROUNDS.general).toBeDefined();
    });
  });

  describe("Dispute Stages", () => {
    test("should have all dispute stages defined", () => {
      expect(DisputeStage.TPO_ORDER).toBeDefined();
      expect(DisputeStage.DRP_FILING).toBeDefined();
      expect(DisputeStage.ITAT_APPEAL).toBeDefined();
      expect(DisputeStage.HIGH_COURT).toBeDefined();
    });
  });

  describe("Dispute Status", () => {
    test("should have all dispute statuses defined", () => {
      expect(DisputeStatus.NOT_STARTED).toBeDefined();
      expect(DisputeStatus.IN_PROGRESS).toBeDefined();
      expect(DisputeStatus.COMPLETED).toBeDefined();
    });
  });

  describe("Progress Tracking", () => {
    test("should track DRP progress", () => {
      const tpoOrder: TPOOrder = {
        orderNumber: "TPO/DEL/2024/001",
        orderDate: new Date(),
        assessmentYear: "2024-25",
        primaryAdjustment: 50000000,
        transactionWiseAdjustments: [],
        reasonsForAdjustment: [],
        comparablesSelected: [],
        comparablesRejected: [],
        methodApplied: "TNMM",
        taxpayerDetails: {
          name: "Test Company Pvt Ltd",
          pan: "AABCT1234A",
          address: "123 Business Park, Mumbai",
        },
      };

      const draftOrder: DraftAssessmentOrder = {
        orderNumber: "DO/DEL/2024/001",
        orderDate: new Date(),
        assessmentYear: "2024-25",
        tpoOrderReference: "TPO/DEL/2024/001",
        totalIncome: 100000000,
        tpAdjustment: 50000000,
        otherAdditions: 0,
        demandRaised: 15000000,
        interestComputed: 3000000,
      };

      const objections: DRPObjection[] = [
        {
          objectionNumber: 1,
          issueCategory: "Comparables",
          briefDescription: "Test objection",
          detailedObjection: "Detailed test...",
          legalBasis: ["Rule 10B"],
          caseLawCitations: [],
          reliefSought: 50000000,
        },
      ];

      const application = engine.createDRPApplication(tpoOrder, draftOrder, objections);
      const progress = engine.trackDRPProgress(application);

      expect(progress).toBeDefined();
    });
  });
});
