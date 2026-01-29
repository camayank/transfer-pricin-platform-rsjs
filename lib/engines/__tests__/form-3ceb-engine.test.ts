/**
 * Form 3CEB Engine - Unit Tests
 * Tests form generation, validation, and transaction nature codes
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  Form3CEBBuilder,
  Form3CEBValidator,
  createForm3CEBBuilder,
  createForm3CEBValidator,
  TransactionNature,
  TPMethod,
  RelationshipType,
  SDTNature,
  TRANSACTION_NATURE_DESCRIPTIONS,
  ValidationSeverity,
} from '../form-3ceb-engine';

describe('Form 3CEB Engine', () => {
  describe('Transaction Nature Enum', () => {
    test('should have purchase transaction codes', () => {
      expect(TransactionNature.PURCHASE_RAW_MATERIALS).toBe('01');
      expect(TransactionNature.PURCHASE_FINISHED_GOODS).toBe('02');
      expect(TransactionNature.PURCHASE_CAPITAL_GOODS).toBe('03');
    });

    test('should have sale transaction codes', () => {
      expect(TransactionNature.SALE_RAW_MATERIALS).toBe('11');
      expect(TransactionNature.SALE_FINISHED_GOODS).toBe('12');
      expect(TransactionNature.SALE_CAPITAL_GOODS).toBe('13');
    });

    test('should have service payment codes', () => {
      expect(TransactionNature.PAYMENT_SOFTWARE_SERVICES).toBe('21');
      expect(TransactionNature.PAYMENT_TECHNICAL_SERVICES).toBe('22');
      expect(TransactionNature.PAYMENT_MANAGEMENT_SERVICES).toBe('23');
    });

    test('should have service receipt codes', () => {
      expect(TransactionNature.RECEIPT_SOFTWARE_SERVICES).toBe('31');
      expect(TransactionNature.RECEIPT_TECHNICAL_SERVICES).toBe('32');
      expect(TransactionNature.RECEIPT_MANAGEMENT_SERVICES).toBe('33');
    });

    test('should have royalty codes', () => {
      expect(TransactionNature.PAYMENT_ROYALTY).toBe('41');
      expect(TransactionNature.RECEIPT_ROYALTY).toBe('42');
      expect(TransactionNature.PAYMENT_LICENSE_FEE).toBe('43');
      expect(TransactionNature.RECEIPT_LICENSE_FEE).toBe('44');
    });

    test('should have financial transaction codes', () => {
      expect(TransactionNature.LOAN_GIVEN).toBe('51');
      expect(TransactionNature.LOAN_TAKEN).toBe('52');
      expect(TransactionNature.INTEREST_PAID).toBe('53');
      expect(TransactionNature.INTEREST_RECEIVED).toBe('54');
      expect(TransactionNature.GUARANTEE_GIVEN).toBe('55');
      expect(TransactionNature.GUARANTEE_RECEIVED).toBe('56');
    });

    test('should have capital transaction codes', () => {
      expect(TransactionNature.PURCHASE_SHARES).toBe('61');
      expect(TransactionNature.SALE_SHARES).toBe('62');
      expect(TransactionNature.PURCHASE_INTANGIBLES).toBe('63');
      expect(TransactionNature.SALE_INTANGIBLES).toBe('64');
    });

    test('should have cost sharing codes', () => {
      expect(TransactionNature.COST_SHARING_PAYMENT).toBe('71');
      expect(TransactionNature.COST_SHARING_RECEIPT).toBe('72');
    });

    test('should have other transaction code', () => {
      expect(TransactionNature.OTHER_TRANSACTION).toBe('99');
    });
  });

  describe('TP Method Enum', () => {
    test('should have all TP methods', () => {
      expect(TPMethod.CUP).toBe('CUP');
      expect(TPMethod.RPM).toBe('RPM');
      expect(TPMethod.CPM).toBe('CPM');
      expect(TPMethod.PSM).toBe('PSM');
      expect(TPMethod.TNMM).toBe('TNMM');
      expect(TPMethod.OTHER).toBe('OTHER');
    });
  });

  describe('Relationship Type Enum', () => {
    test('should have all relationship types', () => {
      expect(RelationshipType.HOLDING_COMPANY).toBe('01');
      expect(RelationshipType.SUBSIDIARY).toBe('02');
      expect(RelationshipType.FELLOW_SUBSIDIARY).toBe('03');
      expect(RelationshipType.JOINT_VENTURE).toBe('04');
      expect(RelationshipType.COMMON_CONTROL).toBe('05');
      expect(RelationshipType.OTHER).toBe('99');
    });
  });

  describe('SDT Nature Enum', () => {
    test('should have SDT section codes', () => {
      expect(SDTNature.SECTION_80A).toBe('80A');
      expect(SDTNature.SECTION_80IA).toBe('80IA');
      expect(SDTNature.SECTION_10AA).toBe('10AA');
      expect(SDTNature.SECTION_115BAB).toBe('115BAB');
      expect(SDTNature.OTHER).toBe('OTHER');
    });
  });

  describe('Transaction Nature Descriptions', () => {
    test('should have descriptions for all codes', () => {
      expect(TRANSACTION_NATURE_DESCRIPTIONS['01']).toBeDefined();
      expect(TRANSACTION_NATURE_DESCRIPTIONS['11']).toBeDefined();
      expect(TRANSACTION_NATURE_DESCRIPTIONS['21']).toBeDefined();
      expect(TRANSACTION_NATURE_DESCRIPTIONS['31']).toBeDefined();
      expect(TRANSACTION_NATURE_DESCRIPTIONS['41']).toBeDefined();
      expect(TRANSACTION_NATURE_DESCRIPTIONS['51']).toBeDefined();
      expect(TRANSACTION_NATURE_DESCRIPTIONS['61']).toBeDefined();
      expect(TRANSACTION_NATURE_DESCRIPTIONS['71']).toBeDefined();
      expect(TRANSACTION_NATURE_DESCRIPTIONS['99']).toBeDefined();
    });

    test('should have meaningful descriptions', () => {
      expect(TRANSACTION_NATURE_DESCRIPTIONS['01'].length).toBeGreaterThan(0);
      expect(TRANSACTION_NATURE_DESCRIPTIONS['01'].toLowerCase()).toContain('raw');
    });
  });

  describe('Form3CEBBuilder', () => {
    let builder: Form3CEBBuilder;

    beforeEach(() => {
      builder = createForm3CEBBuilder();
    });

    test('should create builder instance', () => {
      expect(builder).toBeDefined();
      expect(builder).toBeInstanceOf(Form3CEBBuilder);
    });

    test('should create new form with assessee details', () => {
      const result = builder.createNewForm({
        name: 'Test Company Ltd',
        pan: 'ABCDE1234F',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400001',
        email: 'test@company.com',
        phone: '9876543210',
        status: 'Company',
        principalBusinessActivity: 'IT Services',
        nicCode: '62011',
        previousYearFrom: '2023-04-01',
        previousYearTo: '2024-03-31',
        assessmentYear: '2024-25',
      }, '2024-25');

      expect(result).toBe(builder); // Should return self for chaining
    });

    test('should add associated enterprise', () => {
      builder.createNewForm({
        name: 'Test Company Ltd',
        pan: 'ABCDE1234F',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400001',
        email: 'test@company.com',
        phone: '9876543210',
        status: 'Company',
        principalBusinessActivity: 'IT Services',
        nicCode: '62011',
        previousYearFrom: '2023-04-01',
        previousYearTo: '2024-03-31',
        assessmentYear: '2024-25',
      }, '2024-25');

      const aeRef = builder.addAssociatedEnterprise(
        'Parent Corp',
        'United States',
        'US',
        '456 Parent Ave, NY',
        RelationshipType.HOLDING_COMPANY,
        'Parent company holding 100% shares',
        '123456789'
      );

      expect(aeRef).toBe('AE001');
    });

    test('should add international transaction', () => {
      builder.createNewForm({
        name: 'Test Company Ltd',
        pan: 'ABCDE1234F',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400001',
        email: 'test@company.com',
        phone: '9876543210',
        status: 'Company',
        principalBusinessActivity: 'IT Services',
        nicCode: '62011',
        previousYearFrom: '2023-04-01',
        previousYearTo: '2024-03-31',
        assessmentYear: '2024-25',
      }, '2024-25');

      const aeRef = builder.addAssociatedEnterprise(
        'Parent Corp',
        'United States',
        'US',
        '456 Parent Ave',
        RelationshipType.HOLDING_COMPANY,
        'Parent company'
      );

      const result = builder.addInternationalTransaction(
        aeRef,
        'Parent Corp',
        'US',
        TransactionNature.RECEIPT_SOFTWARE_SERVICES,
        'Software development services',
        10000000,
        10000000,
        TPMethod.TNMM,
        'TNMM is the most appropriate method as...',
        5
      );

      expect(result).toBe(builder); // Should return self for chaining
    });

    test('should add CA certification', () => {
      builder.createNewForm({
        name: 'Test Company Ltd',
        pan: 'ABCDE1234F',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400001',
        email: 'test@company.com',
        phone: '9876543210',
        status: 'Company',
        principalBusinessActivity: 'IT Services',
        nicCode: '62011',
        previousYearFrom: '2023-04-01',
        previousYearTo: '2024-03-31',
        assessmentYear: '2024-25',
      }, '2024-25');

      const result = builder.addCACertification(
        'CA Test Name',
        '123456',
        'Test CA Firm',
        '123456N',
        '789 CA Street',
        'Delhi',
        '110001',
        '24123456ABCDEFGHIJ',
        '2024-11-30'
      );

      expect(result).toBe(builder); // Should return self for chaining
    });

    test('should build complete form', () => {
      builder.createNewForm({
        name: 'Test Company Ltd',
        pan: 'ABCDE1234F',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400001',
        email: 'test@company.com',
        phone: '9876543210',
        status: 'Company',
        principalBusinessActivity: 'IT Services',
        nicCode: '62011',
        previousYearFrom: '2023-04-01',
        previousYearTo: '2024-03-31',
        assessmentYear: '2024-25',
      }, '2024-25');

      const aeRef = builder.addAssociatedEnterprise(
        'Parent Corp',
        'United States',
        'US',
        '456 Parent Ave',
        RelationshipType.HOLDING_COMPANY,
        'Parent company'
      );

      builder.addInternationalTransaction(
        aeRef,
        'Parent Corp',
        'US',
        TransactionNature.RECEIPT_SOFTWARE_SERVICES,
        'Software development services',
        10000000,
        10000000,
        TPMethod.TNMM,
        'TNMM is the most appropriate method',
        5
      );

      builder.addCACertification(
        'CA Test Name',
        '123456',
        'Test CA Firm',
        '123456N',
        '789 CA Street',
        'Delhi',
        '110001',
        '24123456ABCDEFGHIJ',
        '2024-11-30'
      );

      const form = builder.build();

      expect(form).toBeDefined();
      expect(form.partA).toBeDefined();
      expect(form.associatedEnterprises).toBeDefined();
      expect(form.partB).toBeDefined();
      expect(form.formDetails.formName).toBe('3CEB');
    });

    test('should throw error when building without assessee', () => {
      expect(() => builder.build()).toThrow('Assessee details not provided');
    });

    test('should generate hash for form', () => {
      builder.createNewForm({
        name: 'Test Company Ltd',
        pan: 'ABCDE1234F',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400001',
        email: 'test@company.com',
        phone: '9876543210',
        status: 'Company',
        principalBusinessActivity: 'IT Services',
        nicCode: '62011',
        previousYearFrom: '2023-04-01',
        previousYearTo: '2024-03-31',
        assessmentYear: '2024-25',
      }, '2024-25');

      const form = builder.build();
      const hash = builder.generateHash(form);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64); // SHA-256 produces 64 hex characters
    });
  });

  describe('Form3CEBValidator', () => {
    let validator: Form3CEBValidator;
    let builder: Form3CEBBuilder;

    beforeEach(() => {
      validator = createForm3CEBValidator();
      builder = createForm3CEBBuilder();
    });

    test('should create validator instance', () => {
      expect(validator).toBeDefined();
      expect(validator).toBeInstanceOf(Form3CEBValidator);
    });

    test('should validate PAN format - invalid', () => {
      builder.createNewForm({
        name: 'Test Company',
        pan: 'INVALID',
        address: 'Test',
        city: 'Test',
        state: 'Test',
        pinCode: '400001',
        email: 'test@test.com',
        phone: '9876543210',
        status: 'Company',
        principalBusinessActivity: 'IT',
        nicCode: '62011',
        previousYearFrom: '2023-04-01',
        previousYearTo: '2024-03-31',
        assessmentYear: '2024-25',
      }, '2024-25');

      builder.addCACertification(
        'CA Test',
        '123456',
        'Firm',
        '123456N',
        'Test',
        'Test',
        '110001',
        '24123456ABCDEFGHIJ',
        '2024-11-30'
      );

      const form = builder.build();
      const results = validator.validateForm(form);

      const panError = results.find(r => r.field === 'pan');
      expect(panError).toBeDefined();
      expect(panError?.severity).toBe(ValidationSeverity.CRITICAL);
    });

    test('should validate PAN format - valid', () => {
      builder.createNewForm({
        name: 'Test Company Ltd',
        pan: 'ABCDE1234F',
        address: 'Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400001',
        email: 'test@company.com',
        phone: '9876543210',
        status: 'Company',
        principalBusinessActivity: 'IT',
        nicCode: '62011',
        previousYearFrom: '2023-04-01',
        previousYearTo: '2024-03-31',
        assessmentYear: '2024-25',
      }, '2024-25');

      builder.addCACertification(
        'CA Test',
        '123456',
        'Firm',
        '123456N',
        'Test',
        'Test',
        '110001',
        '24123456ABCDEFGHIJ',
        '2024-11-30'
      );

      const form = builder.build();
      const results = validator.validateForm(form);

      const panError = results.find(r => r.field === 'pan' && r.severity === ValidationSeverity.CRITICAL);
      expect(panError).toBeUndefined();
    });

    test('should validate PIN code format', () => {
      builder.createNewForm({
        name: 'Test Company',
        pan: 'ABCDE1234F',
        address: 'Test',
        city: 'Test',
        state: 'Test',
        pinCode: '123', // Invalid PIN
        email: 'test@test.com',
        phone: '9876543210',
        status: 'Company',
        principalBusinessActivity: 'IT',
        nicCode: '62011',
        previousYearFrom: '2023-04-01',
        previousYearTo: '2024-03-31',
        assessmentYear: '2024-25',
      }, '2024-25');

      builder.addCACertification(
        'CA Test',
        '123456',
        'Firm',
        '123456N',
        'Test',
        'Test',
        '110001',
        '24123456ABCDEFGHIJ',
        '2024-11-30'
      );

      const form = builder.build();
      const results = validator.validateForm(form);

      const pinError = results.find(r => r.field === 'pinCode');
      expect(pinError).toBeDefined();
    });

    test('should validate email format', () => {
      builder.createNewForm({
        name: 'Test Company',
        pan: 'ABCDE1234F',
        address: 'Test',
        city: 'Test',
        state: 'Test',
        pinCode: '400001',
        email: 'invalid-email', // Invalid email
        phone: '9876543210',
        status: 'Company',
        principalBusinessActivity: 'IT',
        nicCode: '62011',
        previousYearFrom: '2023-04-01',
        previousYearTo: '2024-03-31',
        assessmentYear: '2024-25',
      }, '2024-25');

      builder.addCACertification(
        'CA Test',
        '123456',
        'Firm',
        '123456N',
        'Test',
        'Test',
        '110001',
        '24123456ABCDEFGHIJ',
        '2024-11-30'
      );

      const form = builder.build();
      const results = validator.validateForm(form);

      const emailError = results.find(r => r.field === 'email');
      expect(emailError).toBeDefined();
    });

    test('should provide summary', () => {
      builder.createNewForm({
        name: 'Test Company',
        pan: 'INVALID',
        address: 'Test',
        city: 'Test',
        state: 'Test',
        pinCode: '123',
        email: 'invalid-email',
        phone: '9876543210',
        status: 'Company',
        principalBusinessActivity: 'IT',
        nicCode: '62011',
        previousYearFrom: '2023-04-01',
        previousYearTo: '2024-03-31',
        assessmentYear: '2024-25',
      }, '2024-25');

      builder.addCACertification(
        'CA Test',
        '123456',
        'Firm',
        '123456N',
        'Test',
        'Test',
        '110001',
        '24123456ABCDEFGHIJ',
        '2024-11-30'
      );

      const form = builder.build();
      validator.validateForm(form);
      const summary = validator.getSummary();

      expect(summary).toBeDefined();
      expect(summary.totalIssues).toBeGreaterThan(0);
      expect(summary.canFile).toBe(false); // Has critical errors
    });
  });

  describe('Factory Functions', () => {
    test('createForm3CEBBuilder should return builder', () => {
      const builder = createForm3CEBBuilder();
      expect(builder).toBeDefined();
      expect(builder).toBeInstanceOf(Form3CEBBuilder);
      expect(typeof builder.createNewForm).toBe('function');
      expect(typeof builder.addAssociatedEnterprise).toBe('function');
      expect(typeof builder.addInternationalTransaction).toBe('function');
      expect(typeof builder.addCACertification).toBe('function');
      expect(typeof builder.build).toBe('function');
    });

    test('createForm3CEBValidator should return validator', () => {
      const validator = createForm3CEBValidator();
      expect(validator).toBeDefined();
      expect(validator).toBeInstanceOf(Form3CEBValidator);
      expect(typeof validator.validateForm).toBe('function');
      expect(typeof validator.getSummary).toBe('function');
    });
  });
});
