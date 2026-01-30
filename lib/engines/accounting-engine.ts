/**
 * ================================================================================
 * DIGICOMPLY TRANSFER PRICING PLATFORM
 * Financial/Accounting Engine
 *
 * Implements chart of accounts, journal entries, tax management,
 * bank reconciliation, and financial reporting.
 * ================================================================================
 */

import { Decimal } from "decimal.js";

// Types
export enum AccountType {
  ASSET = "ASSET",
  LIABILITY = "LIABILITY",
  EQUITY = "EQUITY",
  REVENUE = "REVENUE",
  EXPENSE = "EXPENSE",
}

export enum JournalStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  POSTED = "POSTED",
  REVERSED = "REVERSED",
}

export interface ChartOfAccountInput {
  firmId: string;
  accountCode: string;
  name: string;
  accountType: AccountType;
  parentId?: string;
  description?: string;
  normalBalance?: "DEBIT" | "CREDIT";
}

export interface JournalEntryInput {
  firmId: string;
  entryDate: Date;
  description: string;
  reference?: string;
  entryType?: "STANDARD" | "ADJUSTING" | "CLOSING" | "REVERSING";
  lines: JournalLineInput[];
}

export interface JournalLineInput {
  accountId: string;
  description?: string;
  debitAmount: number;
  creditAmount: number;
  taxCode?: string;
}

export interface TaxConfigInput {
  firmId: string;
  taxType: "GST" | "TDS" | "TCS";
  code: string;
  name: string;
  rate: number;
  accountId?: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
}

export interface BankTransactionInput {
  bankAccountId: string;
  transactionDate: Date;
  valueDate?: Date;
  description: string;
  reference?: string;
  debitAmount: number;
  creditAmount: number;
  balance?: number;
  category?: string;
}

export interface TrialBalanceEntry {
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  debitBalance: number;
  creditBalance: number;
}

export interface LedgerEntry {
  date: Date;
  description: string;
  reference?: string;
  debitAmount: number;
  creditAmount: number;
  runningBalance: number;
}

export interface ReconciliationMatch {
  bankTransactionId: string;
  journalEntryId: string;
  confidence: number;
  matchReason: string;
}

// =============================================================================
// CHART OF ACCOUNTS SERVICE
// =============================================================================

export class ChartOfAccountsService {
  /**
   * Validate account code format
   */
  validateAccountCode(code: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!code || code.length < 4) {
      errors.push("Account code must be at least 4 characters");
    }

    if (!/^[A-Z0-9-]+$/.test(code)) {
      errors.push("Account code can only contain uppercase letters, numbers, and hyphens");
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Get default normal balance for account type
   */
  getDefaultNormalBalance(accountType: AccountType): "DEBIT" | "CREDIT" {
    switch (accountType) {
      case AccountType.ASSET:
      case AccountType.EXPENSE:
        return "DEBIT";
      case AccountType.LIABILITY:
      case AccountType.EQUITY:
      case AccountType.REVENUE:
        return "CREDIT";
      default:
        return "DEBIT";
    }
  }

  /**
   * Generate standard chart of accounts
   */
  generateStandardCoA(firmId: string): ChartOfAccountInput[] {
    return [
      // Assets
      { firmId, accountCode: "1000", name: "Assets", accountType: AccountType.ASSET },
      { firmId, accountCode: "1100", name: "Cash and Bank", accountType: AccountType.ASSET },
      { firmId, accountCode: "1110", name: "Petty Cash", accountType: AccountType.ASSET },
      { firmId, accountCode: "1120", name: "Bank - Current Account", accountType: AccountType.ASSET },
      { firmId, accountCode: "1200", name: "Accounts Receivable", accountType: AccountType.ASSET },
      { firmId, accountCode: "1300", name: "Inventory", accountType: AccountType.ASSET },
      { firmId, accountCode: "1400", name: "Prepaid Expenses", accountType: AccountType.ASSET },
      { firmId, accountCode: "1500", name: "Fixed Assets", accountType: AccountType.ASSET },
      { firmId, accountCode: "1510", name: "Equipment", accountType: AccountType.ASSET },
      { firmId, accountCode: "1520", name: "Accumulated Depreciation - Equipment", accountType: AccountType.ASSET },

      // Liabilities
      { firmId, accountCode: "2000", name: "Liabilities", accountType: AccountType.LIABILITY },
      { firmId, accountCode: "2100", name: "Accounts Payable", accountType: AccountType.LIABILITY },
      { firmId, accountCode: "2200", name: "GST Payable", accountType: AccountType.LIABILITY },
      { firmId, accountCode: "2210", name: "CGST Payable", accountType: AccountType.LIABILITY },
      { firmId, accountCode: "2220", name: "SGST Payable", accountType: AccountType.LIABILITY },
      { firmId, accountCode: "2230", name: "IGST Payable", accountType: AccountType.LIABILITY },
      { firmId, accountCode: "2300", name: "TDS Payable", accountType: AccountType.LIABILITY },
      { firmId, accountCode: "2400", name: "Loans Payable", accountType: AccountType.LIABILITY },

      // Equity
      { firmId, accountCode: "3000", name: "Equity", accountType: AccountType.EQUITY },
      { firmId, accountCode: "3100", name: "Capital", accountType: AccountType.EQUITY },
      { firmId, accountCode: "3200", name: "Retained Earnings", accountType: AccountType.EQUITY },

      // Revenue
      { firmId, accountCode: "4000", name: "Revenue", accountType: AccountType.REVENUE },
      { firmId, accountCode: "4100", name: "Professional Fees", accountType: AccountType.REVENUE },
      { firmId, accountCode: "4200", name: "Consulting Income", accountType: AccountType.REVENUE },
      { firmId, accountCode: "4300", name: "Other Income", accountType: AccountType.REVENUE },

      // Expenses
      { firmId, accountCode: "5000", name: "Expenses", accountType: AccountType.EXPENSE },
      { firmId, accountCode: "5100", name: "Salaries and Wages", accountType: AccountType.EXPENSE },
      { firmId, accountCode: "5200", name: "Rent Expense", accountType: AccountType.EXPENSE },
      { firmId, accountCode: "5300", name: "Utilities Expense", accountType: AccountType.EXPENSE },
      { firmId, accountCode: "5400", name: "Office Supplies", accountType: AccountType.EXPENSE },
      { firmId, accountCode: "5500", name: "Professional Fees Expense", accountType: AccountType.EXPENSE },
      { firmId, accountCode: "5600", name: "Depreciation Expense", accountType: AccountType.EXPENSE },
      { firmId, accountCode: "5700", name: "Bank Charges", accountType: AccountType.EXPENSE },
      { firmId, accountCode: "5800", name: "Other Expenses", accountType: AccountType.EXPENSE },
    ];
  }

  /**
   * Build account hierarchy tree
   */
  buildAccountTree(
    accounts: Array<{
      id: string;
      accountCode: string;
      name: string;
      accountType: AccountType;
      parentId?: string;
    }>
  ): Array<{
    id: string;
    accountCode: string;
    name: string;
    accountType: AccountType;
    children: unknown[];
  }> {
    const rootAccounts = accounts.filter((a) => !a.parentId);
    const childMap = new Map<string, typeof accounts>();

    accounts.forEach((a) => {
      if (a.parentId) {
        if (!childMap.has(a.parentId)) {
          childMap.set(a.parentId, []);
        }
        childMap.get(a.parentId)!.push(a);
      }
    });

    const buildChildren = (parentId: string): unknown[] => {
      const children = childMap.get(parentId) || [];
      return children.map((child) => ({
        id: child.id,
        accountCode: child.accountCode,
        name: child.name,
        accountType: child.accountType,
        children: buildChildren(child.id),
      }));
    };

    return rootAccounts.map((account) => ({
      id: account.id,
      accountCode: account.accountCode,
      name: account.name,
      accountType: account.accountType,
      children: buildChildren(account.id),
    }));
  }
}

// =============================================================================
// JOURNAL ENTRY SERVICE
// =============================================================================

export class JournalEntryService {
  /**
   * Validate journal entry (debits = credits)
   */
  validateEntry(lines: JournalLineInput[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!lines || lines.length < 2) {
      errors.push("Journal entry must have at least 2 lines");
    }

    // Calculate totals using Decimal for precision
    let totalDebit = new Decimal(0);
    let totalCredit = new Decimal(0);

    for (const line of lines) {
      if (line.debitAmount < 0 || line.creditAmount < 0) {
        errors.push("Amounts cannot be negative");
      }

      if (line.debitAmount > 0 && line.creditAmount > 0) {
        errors.push("A line cannot have both debit and credit amounts");
      }

      if (line.debitAmount === 0 && line.creditAmount === 0) {
        errors.push("Each line must have either a debit or credit amount");
      }

      totalDebit = totalDebit.plus(line.debitAmount);
      totalCredit = totalCredit.plus(line.creditAmount);
    }

    if (!totalDebit.equals(totalCredit)) {
      errors.push(
        `Debits (${totalDebit.toFixed(2)}) must equal credits (${totalCredit.toFixed(2)})`
      );
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Calculate entry totals
   */
  calculateTotals(lines: JournalLineInput[]): { totalDebit: number; totalCredit: number } {
    let totalDebit = new Decimal(0);
    let totalCredit = new Decimal(0);

    for (const line of lines) {
      totalDebit = totalDebit.plus(line.debitAmount);
      totalCredit = totalCredit.plus(line.creditAmount);
    }

    return {
      totalDebit: totalDebit.toNumber(),
      totalCredit: totalCredit.toNumber(),
    };
  }

  /**
   * Generate entry number
   */
  generateEntryNumber(firmId: string, date: Date, sequence: number): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const seq = sequence.toString().padStart(5, "0");
    return `JE-${year}${month}-${seq}`;
  }

  /**
   * Create reversal entry
   */
  createReversalEntry(
    originalEntry: JournalEntryInput,
    reversalDate: Date
  ): JournalEntryInput {
    return {
      firmId: originalEntry.firmId,
      entryDate: reversalDate,
      description: `Reversal of: ${originalEntry.description}`,
      reference: originalEntry.reference,
      entryType: "REVERSING",
      lines: originalEntry.lines.map((line) => ({
        accountId: line.accountId,
        description: `Reversal: ${line.description || ""}`,
        debitAmount: line.creditAmount, // Swap debit and credit
        creditAmount: line.debitAmount,
        taxCode: line.taxCode,
      })),
    };
  }
}

// =============================================================================
// TAX SERVICE
// =============================================================================

export class TaxService {
  /**
   * Calculate tax amount
   */
  calculateTax(baseAmount: number, rate: number): number {
    return new Decimal(baseAmount).times(rate).dividedBy(100).toDecimalPlaces(2).toNumber();
  }

  /**
   * Get GST breakdown (CGST + SGST or IGST)
   */
  getGstBreakdown(
    baseAmount: number,
    gstRate: number,
    isInterState: boolean
  ): {
    cgst?: number;
    sgst?: number;
    igst?: number;
    totalTax: number;
  } {
    const totalTax = this.calculateTax(baseAmount, gstRate);

    if (isInterState) {
      return { igst: totalTax, totalTax };
    }

    const halfRate = new Decimal(gstRate).dividedBy(2).toNumber();
    const halfTax = this.calculateTax(baseAmount, halfRate);

    return {
      cgst: halfTax,
      sgst: halfTax,
      totalTax: halfTax * 2,
    };
  }

  /**
   * Calculate TDS
   */
  calculateTds(
    baseAmount: number,
    tdsRate: number,
    threshold: number = 0
  ): { tdsAmount: number; netAmount: number; thresholdExceeded: boolean } {
    if (baseAmount <= threshold) {
      return { tdsAmount: 0, netAmount: baseAmount, thresholdExceeded: false };
    }

    const tdsAmount = this.calculateTax(baseAmount, tdsRate);
    return {
      tdsAmount,
      netAmount: baseAmount - tdsAmount,
      thresholdExceeded: true,
    };
  }

  /**
   * Get GSTR-3B summary structure
   */
  getGstr3bSummary(
    transactions: Array<{
      type: "OUTPUT" | "INPUT";
      taxableAmount: number;
      cgst: number;
      sgst: number;
      igst: number;
    }>
  ): {
    outwardSupplies: { taxable: number; cgst: number; sgst: number; igst: number };
    inwardSupplies: { taxable: number; cgst: number; sgst: number; igst: number };
    netPayable: { cgst: number; sgst: number; igst: number };
  } {
    const outward = { taxable: 0, cgst: 0, sgst: 0, igst: 0 };
    const inward = { taxable: 0, cgst: 0, sgst: 0, igst: 0 };

    for (const txn of transactions) {
      if (txn.type === "OUTPUT") {
        outward.taxable += txn.taxableAmount;
        outward.cgst += txn.cgst;
        outward.sgst += txn.sgst;
        outward.igst += txn.igst;
      } else {
        inward.taxable += txn.taxableAmount;
        inward.cgst += txn.cgst;
        inward.sgst += txn.sgst;
        inward.igst += txn.igst;
      }
    }

    return {
      outwardSupplies: outward,
      inwardSupplies: inward,
      netPayable: {
        cgst: Math.max(0, outward.cgst - inward.cgst),
        sgst: Math.max(0, outward.sgst - inward.sgst),
        igst: Math.max(0, outward.igst - inward.igst),
      },
    };
  }
}

// =============================================================================
// BANK RECONCILIATION SERVICE
// =============================================================================

export class BankReconciliationService {
  /**
   * Parse bank statement CSV
   */
  parseBankStatement(
    csvData: string,
    columnMapping: Record<string, number>
  ): BankTransactionInput[] {
    const lines = csvData.split("\n").slice(1); // Skip header
    const transactions: BankTransactionInput[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      const columns = this.parseCSVLine(line);

      try {
        const txn: BankTransactionInput = {
          bankAccountId: "", // Will be set by caller
          transactionDate: new Date(columns[columnMapping.date]),
          valueDate: columnMapping.valueDate
            ? new Date(columns[columnMapping.valueDate])
            : undefined,
          description: columns[columnMapping.description] || "",
          reference: columnMapping.reference
            ? columns[columnMapping.reference]
            : undefined,
          debitAmount: parseFloat(columns[columnMapping.debit] || "0") || 0,
          creditAmount: parseFloat(columns[columnMapping.credit] || "0") || 0,
          balance: columnMapping.balance
            ? parseFloat(columns[columnMapping.balance]) || undefined
            : undefined,
        };

        transactions.push(txn);
      } catch {
        // Skip invalid lines
        console.warn("Skipping invalid bank statement line:", line);
      }
    }

    return transactions;
  }

  private parseCSVLine(line: string): string[] {
    const columns: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        columns.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    columns.push(current.trim());

    return columns;
  }

  /**
   * Find potential matches for reconciliation
   */
  findPotentialMatches(
    bankTransaction: BankTransactionInput,
    journalEntries: Array<{
      id: string;
      entryDate: Date;
      description: string;
      reference?: string;
      totalDebit: number;
      totalCredit: number;
    }>
  ): ReconciliationMatch[] {
    const matches: ReconciliationMatch[] = [];
    const txnAmount = bankTransaction.creditAmount || bankTransaction.debitAmount;
    const isCredit = bankTransaction.creditAmount > 0;

    for (const entry of journalEntries) {
      let confidence = 0;
      const reasons: string[] = [];

      // Amount match
      const entryAmount = isCredit ? entry.totalDebit : entry.totalCredit;
      if (Math.abs(txnAmount - entryAmount) < 0.01) {
        confidence += 50;
        reasons.push("Amount matches");
      } else if (Math.abs(txnAmount - entryAmount) < 1) {
        confidence += 30;
        reasons.push("Amount close match");
      }

      // Date match
      const dateDiff = Math.abs(
        new Date(bankTransaction.transactionDate).getTime() -
          new Date(entry.entryDate).getTime()
      );
      const daysDiff = dateDiff / (1000 * 60 * 60 * 24);
      if (daysDiff === 0) {
        confidence += 25;
        reasons.push("Same date");
      } else if (daysDiff <= 3) {
        confidence += 15;
        reasons.push("Date within 3 days");
      } else if (daysDiff <= 7) {
        confidence += 5;
        reasons.push("Date within 7 days");
      }

      // Reference match
      if (
        bankTransaction.reference &&
        entry.reference &&
        bankTransaction.reference
          .toLowerCase()
          .includes(entry.reference.toLowerCase())
      ) {
        confidence += 25;
        reasons.push("Reference matches");
      }

      // Description similarity
      if (this.stringSimilarity(bankTransaction.description, entry.description) > 0.5) {
        confidence += 10;
        reasons.push("Description similar");
      }

      if (confidence >= 50) {
        matches.push({
          bankTransactionId: "", // Will be set after creation
          journalEntryId: entry.id,
          confidence,
          matchReason: reasons.join(", "),
        });
      }
    }

    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  private stringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    const commonWords = words1.filter((w) => words2.includes(w));
    return (commonWords.length * 2) / (words1.length + words2.length);
  }

  /**
   * Get reconciliation summary
   */
  getReconciliationSummary(
    bankBalance: number,
    transactions: Array<{
      isReconciled: boolean;
      debitAmount: number;
      creditAmount: number;
    }>
  ): {
    bankBalance: number;
    unreconciledCredits: number;
    unreconciledDebits: number;
    adjustedBookBalance: number;
    unreconciledCount: number;
  } {
    let unreconciledCredits = 0;
    let unreconciledDebits = 0;
    let unreconciledCount = 0;

    for (const txn of transactions) {
      if (!txn.isReconciled) {
        unreconciledCount++;
        unreconciledCredits += txn.creditAmount;
        unreconciledDebits += txn.debitAmount;
      }
    }

    return {
      bankBalance,
      unreconciledCredits,
      unreconciledDebits,
      adjustedBookBalance: bankBalance - unreconciledCredits + unreconciledDebits,
      unreconciledCount,
    };
  }
}

// =============================================================================
// FINANCIAL REPORTING SERVICE
// =============================================================================

export class FinancialReportingService {
  /**
   * Generate trial balance
   */
  generateTrialBalance(
    accounts: Array<{
      accountCode: string;
      accountName: string;
      accountType: AccountType;
      normalBalance: "DEBIT" | "CREDIT";
    }>,
    ledgerBalances: Map<string, number>
  ): TrialBalanceEntry[] {
    const entries: TrialBalanceEntry[] = [];

    for (const account of accounts) {
      const balance = ledgerBalances.get(account.accountCode) || 0;

      let debitBalance = 0;
      let creditBalance = 0;

      if (balance > 0) {
        if (account.normalBalance === "DEBIT") {
          debitBalance = balance;
        } else {
          creditBalance = balance;
        }
      } else if (balance < 0) {
        if (account.normalBalance === "DEBIT") {
          creditBalance = Math.abs(balance);
        } else {
          debitBalance = Math.abs(balance);
        }
      }

      if (debitBalance !== 0 || creditBalance !== 0) {
        entries.push({
          accountCode: account.accountCode,
          accountName: account.accountName,
          accountType: account.accountType,
          debitBalance,
          creditBalance,
        });
      }
    }

    return entries.sort((a, b) => a.accountCode.localeCompare(b.accountCode));
  }

  /**
   * Generate profit & loss statement
   */
  generateProfitLoss(
    trialBalance: TrialBalanceEntry[]
  ): {
    revenue: Array<{ name: string; amount: number }>;
    expenses: Array<{ name: string; amount: number }>;
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
  } {
    const revenue: Array<{ name: string; amount: number }> = [];
    const expenses: Array<{ name: string; amount: number }> = [];

    for (const entry of trialBalance) {
      const amount = entry.creditBalance - entry.debitBalance;

      if (entry.accountType === AccountType.REVENUE) {
        revenue.push({ name: entry.accountName, amount });
      } else if (entry.accountType === AccountType.EXPENSE) {
        expenses.push({ name: entry.accountName, amount: entry.debitBalance - entry.creditBalance });
      }
    }

    const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      revenue,
      expenses,
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
    };
  }

  /**
   * Generate balance sheet
   */
  generateBalanceSheet(
    trialBalance: TrialBalanceEntry[],
    netProfit: number
  ): {
    assets: Array<{ name: string; amount: number }>;
    liabilities: Array<{ name: string; amount: number }>;
    equity: Array<{ name: string; amount: number }>;
    totalAssets: number;
    totalLiabilitiesAndEquity: number;
  } {
    const assets: Array<{ name: string; amount: number }> = [];
    const liabilities: Array<{ name: string; amount: number }> = [];
    const equity: Array<{ name: string; amount: number }> = [];

    for (const entry of trialBalance) {
      const amount = entry.debitBalance - entry.creditBalance;

      if (entry.accountType === AccountType.ASSET) {
        assets.push({ name: entry.accountName, amount });
      } else if (entry.accountType === AccountType.LIABILITY) {
        liabilities.push({ name: entry.accountName, amount: -amount });
      } else if (entry.accountType === AccountType.EQUITY) {
        equity.push({ name: entry.accountName, amount: -amount });
      }
    }

    // Add current period profit to equity
    equity.push({ name: "Current Period Profit/Loss", amount: netProfit });

    const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
    const totalEquity = equity.reduce((sum, e) => sum + e.amount, 0);

    return {
      assets,
      liabilities,
      equity,
      totalAssets,
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
    };
  }
}

// Export instances for convenience
export const chartOfAccountsService = new ChartOfAccountsService();
export const journalEntryService = new JournalEntryService();
export const taxService = new TaxService();
export const bankReconciliationService = new BankReconciliationService();
export const financialReportingService = new FinancialReportingService();
