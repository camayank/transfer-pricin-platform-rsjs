import { PrismaClient, Role, Plan, EngagementStatus, Priority, DocumentType, DocStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clean existing data (optional - comment out in production)
  await prisma.document.deleteMany();
  await prisma.benchmarkingResult.deleteMany();
  await prisma.safeHarbourResult.deleteMany();
  await prisma.disputeCase.deleteMany();
  await prisma.internationalTransaction.deleteMany();
  await prisma.associatedEnterprise.deleteMany();
  await prisma.engagement.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.firm.deleteMany();

  // Create Demo Firm
  const firm = await prisma.firm.create({
    data: {
      name: 'Demo CA Firm LLP',
      registrationNumber: 'AAB-1234',
      email: 'admin@democafirm.com',
      phone: '9876543210',
      address: '123 Business Park, Mumbai',
      plan: Plan.PROFESSIONAL,
      maxClients: 50,
    },
  });
  console.log('Created firm:', firm.name);

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@democafirm.com',
      name: 'Admin User',
      password: hashedPassword,
      role: Role.ADMIN,
      firmId: firm.id,
      status: 'ACTIVE',
      department: 'Management',
      title: 'Partner',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@democafirm.com',
      name: 'Priya Sharma',
      password: hashedPassword,
      role: Role.MANAGER,
      firmId: firm.id,
      status: 'ACTIVE',
      department: 'Transfer Pricing',
      title: 'Senior Manager',
    },
  });

  const associate = await prisma.user.create({
    data: {
      email: 'associate@democafirm.com',
      name: 'Rahul Mehta',
      password: hashedPassword,
      role: Role.ASSOCIATE,
      firmId: firm.id,
      status: 'ACTIVE',
      department: 'Transfer Pricing',
      title: 'Associate',
    },
  });

  console.log('Created users:', admin.name, manager.name, associate.name);

  // Create Clients
  const client1 = await prisma.client.create({
    data: {
      name: 'TechCorp India Pvt Ltd',
      pan: 'AABCT1234A',
      tan: 'MUMT12345A',
      cin: 'U72200MH2010PTC123456',
      industry: 'IT Services',
      nicCode: '6201',
      nicDescription: 'Computer programming activities',
      contactPerson: 'Rajesh Kumar',
      contactEmail: 'rajesh@techcorp.com',
      contactPhone: '9876543210',
      address: '100 Tech Park, Whitefield',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560066',
      country: 'India',
      website: 'https://techcorp.com',
      parentCompany: 'TechCorp Inc',
      parentCountry: 'USA',
      ultimateParent: 'TechCorp Holdings Inc',
      ultimateParentCountry: 'USA',
      consolidatedRevenue: 500000000000, // 5000 Cr
      firmId: firm.id,
      assignedToId: manager.id,
      reviewerId: admin.id,
      status: 'active',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Pharma Solutions Ltd',
      pan: 'AABCP5678B',
      industry: 'Pharmaceuticals',
      nicCode: '2100',
      nicDescription: 'Manufacture of pharmaceuticals',
      contactPerson: 'Meera Patel',
      contactEmail: 'meera@pharmasol.com',
      contactPhone: '9876543211',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      parentCompany: 'Pharma Global AG',
      parentCountry: 'Switzerland',
      firmId: firm.id,
      assignedToId: associate.id,
      status: 'active',
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'Auto Parts Manufacturing Pvt Ltd',
      pan: 'AABCA9012C',
      industry: 'Auto Ancillary',
      nicCode: '2930',
      nicDescription: 'Manufacture of parts for motor vehicles',
      contactPerson: 'Amit Singh',
      contactEmail: 'amit@autoparts.com',
      contactPhone: '9876543212',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      parentCompany: 'Auto Global Corp',
      parentCountry: 'Japan',
      firmId: firm.id,
      assignedToId: manager.id,
      status: 'active',
    },
  });

  console.log('Created clients:', client1.name, client2.name, client3.name);

  // Create Associated Enterprises for Client 1
  const ae1 = await prisma.associatedEnterprise.create({
    data: {
      clientId: client1.id,
      name: 'TechCorp Inc',
      country: 'USA',
      relationship: 'PARENT',
      tin: '12-3456789',
      address: '1000 Tech Drive, San Jose, CA 95134',
    },
  });

  const ae2 = await prisma.associatedEnterprise.create({
    data: {
      clientId: client1.id,
      name: 'TechCorp UK Ltd',
      country: 'United Kingdom',
      relationship: 'FELLOW_SUBSIDIARY',
      tin: 'GB123456789',
      address: '100 Tech Street, London EC1A 1BB',
    },
  });

  const ae3 = await prisma.associatedEnterprise.create({
    data: {
      clientId: client1.id,
      name: 'TechCorp Singapore Pte Ltd',
      country: 'Singapore',
      relationship: 'FELLOW_SUBSIDIARY',
      tin: 'SG12345678A',
      address: '1 Marina Boulevard, Singapore 018989',
    },
  });

  console.log('Created associated enterprises');

  // Create Engagement for Client 1 - FY 2025-26
  const engagement1 = await prisma.engagement.create({
    data: {
      clientId: client1.id,
      financialYear: '2025-26',
      assessmentYear: '2026-27',
      status: EngagementStatus.DATA_COLLECTION,
      priority: Priority.HIGH,
      notes: 'Large IT services client with multiple international transactions',
      totalRevenue: 82000000000, // 820 Cr
      operatingCost: 65600000000, // 656 Cr
      operatingProfit: 16400000000, // 164 Cr (20% margin)
      employeeCost: 45000000000, // 450 Cr
      opOc: 0.25, // 25% OP/OC
      opOr: 0.20, // 20% OP/OR
      totalRptValue: 25000000000, // 250 Cr RPT
      dueDate: new Date('2025-11-30'),
    },
  });

  // Create Engagement for Client 2
  const engagement2 = await prisma.engagement.create({
    data: {
      clientId: client2.id,
      financialYear: '2025-26',
      assessmentYear: '2026-27',
      status: EngagementStatus.SAFE_HARBOUR_CHECK,
      priority: Priority.MEDIUM,
      totalRptValue: 15000000000, // 150 Cr
      dueDate: new Date('2025-11-30'),
    },
  });

  // Create Engagement for Client 3
  const engagement3 = await prisma.engagement.create({
    data: {
      clientId: client3.id,
      financialYear: '2025-26',
      assessmentYear: '2026-27',
      status: EngagementStatus.FILED,
      priority: Priority.LOW,
      totalRptValue: 4500000000, // 45 Cr
      dueDate: new Date('2025-11-30'),
      filedDate: new Date('2025-10-15'),
    },
  });

  console.log('Created engagements');

  // Create International Transactions for Engagement 1
  await prisma.internationalTransaction.create({
    data: {
      engagementId: engagement1.id,
      aeId: ae1.id,
      natureCode: '21',
      transactionType: 'SERVICE_INCOME',
      description: 'Software development services provided to parent',
      amount: 15000000000, // 150 Cr
      currency: 'INR',
      method: 'TNMM',
      testedParty: 'INDIAN_ENTITY',
      pliType: 'OP_OC',
      pliValue: 0.22,
    },
  });

  await prisma.internationalTransaction.create({
    data: {
      engagementId: engagement1.id,
      aeId: ae2.id,
      natureCode: '21',
      transactionType: 'SERVICE_INCOME',
      description: 'IT support services to UK entity',
      amount: 5000000000, // 50 Cr
      currency: 'INR',
      method: 'TNMM',
      testedParty: 'INDIAN_ENTITY',
      pliType: 'OP_OC',
      pliValue: 0.25,
    },
  });

  await prisma.internationalTransaction.create({
    data: {
      engagementId: engagement1.id,
      aeId: ae3.id,
      natureCode: '51',
      transactionType: 'INTEREST_INCOME',
      description: 'Interest on loan given to Singapore entity',
      amount: 500000000, // 5 Cr
      currency: 'INR',
      safeHarbourApplied: true,
      safeHarbourType: 'LOAN_FC',
    },
  });

  console.log('Created international transactions');

  // Create Safe Harbour Result
  await prisma.safeHarbourResult.create({
    data: {
      engagementId: engagement1.id,
      transactionType: 'IT_ITES',
      isEligible: true,
      turnover: 82000000000,
      opOcMargin: 0.22,
      appliedRate: 0.22,
      minimumRate: 0.17,
      recommendation: 'Entity is eligible for Safe Harbour. OP/OC margin of 22% exceeds minimum 17%.',
      analysis: {
        eligible: true,
        margin: 0.22,
        requiredMargin: 0.17,
        marginGap: 0.05,
      },
    },
  });

  console.log('Created safe harbour result');

  // Create a Dispute Case for Client 2
  await prisma.disputeCase.create({
    data: {
      engagementId: engagement2.id,
      caseNumber: 'TP/MUM/2024/1234',
      assessmentYear: '2024-25',
      stage: 'DRP',
      status: 'IN_PROGRESS',
      adjustmentByTPO: 5000000000, // 50 Cr
      amountAtStake: 5000000000,
      tpoOrderDate: new Date('2024-06-15'),
      drpFilingDate: new Date('2024-07-10'),
      successProbability: 65,
      notes: 'DRP objections filed. Hearing scheduled for March 2025.',
    },
  });

  console.log('Created dispute case');

  // Create Documents
  await prisma.document.create({
    data: {
      engagementId: engagement1.id,
      clientId: client1.id,
      type: DocumentType.FORM_3CEB,
      status: DocStatus.DRAFT,
      name: 'Form 3CEB FY 2025-26',
      data: {
        assesseeInfo: {
          name: client1.name,
          pan: client1.pan,
        },
      },
    },
  });

  await prisma.document.create({
    data: {
      engagementId: engagement3.id,
      clientId: client3.id,
      type: DocumentType.FORM_3CEB,
      status: DocStatus.FILED,
      name: 'Form 3CEB FY 2025-26',
      acknowledgmentNo: 'ACK123456789',
      filedAt: new Date('2025-10-15'),
    },
  });

  console.log('Created documents');

  // Create Audit Log Entry
  await prisma.immutableAuditLog.create({
    data: {
      firmId: firm.id,
      userId: admin.id,
      action: 'CREATE',
      entityType: 'Client',
      entityId: client1.id,
      newValues: { name: client1.name, pan: client1.pan },
      ipAddress: '192.168.1.1',
      currentHash: 'initial-hash-' + Date.now(),
    },
  });

  console.log('Created audit log');

  console.log('\n=== Seed Complete ===');
  console.log('Login credentials:');
  console.log('  Admin: admin@democafirm.com / password123');
  console.log('  Manager: manager@democafirm.com / password123');
  console.log('  Associate: associate@democafirm.com / password123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
