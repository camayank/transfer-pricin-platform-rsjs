import { PrismaClient, Role, Plan, EngagementStatus, Priority, DocumentType, DocStatus, TPMethod, DisputeStage, DisputeStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting comprehensive seed...\n');

  // Clean existing data
  console.log('Cleaning existing data...');
  await prisma.immutableAuditLog.deleteMany();
  await prisma.document.deleteMany();
  await prisma.benchmarkingResult.deleteMany();
  await prisma.safeHarbourResult.deleteMany();
  await prisma.disputeCase.deleteMany();
  await prisma.internationalTransaction.deleteMany();
  await prisma.engagement.deleteMany();
  await prisma.associatedEnterprise.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.firm.deleteMany();

  // ============== FIRM 1: Demo CA Firm LLP ==============
  console.log('\n--- Creating Firm 1: Demo CA Firm LLP ---');

  const firm1 = await prisma.firm.create({
    data: {
      name: 'Demo CA Firm LLP',
      registrationNumber: 'AAB-1234',
      email: 'admin@democafirm.com',
      phone: '022-12345678',
      address: '123 Business Park, Andheri East, Mumbai - 400069',
      plan: Plan.PROFESSIONAL,
      maxClients: 50,
    },
  });
  console.log('Created firm:', firm1.name);

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Firm 1 Users
  const user1_admin = await prisma.user.create({
    data: {
      email: 'admin@democafirm.com',
      name: 'Rajesh Kumar',
      password: hashedPassword,
      role: Role.ADMIN,
      firmId: firm1.id,
      status: 'ACTIVE',
      department: 'Management',
      title: 'Managing Partner',
      phone: '9876543210',
    },
  });

  const user1_manager = await prisma.user.create({
    data: {
      email: 'manager@democafirm.com',
      name: 'Priya Sharma',
      password: hashedPassword,
      role: Role.MANAGER,
      firmId: firm1.id,
      status: 'ACTIVE',
      department: 'Transfer Pricing',
      title: 'Senior Manager',
      phone: '9876543211',
    },
  });

  const user1_associate = await prisma.user.create({
    data: {
      email: 'associate@democafirm.com',
      name: 'Rahul Mehta',
      password: hashedPassword,
      role: Role.ASSOCIATE,
      firmId: firm1.id,
      status: 'ACTIVE',
      department: 'Transfer Pricing',
      title: 'Associate',
      phone: '9876543212',
    },
  });

  console.log('Created users:', user1_admin.name, user1_manager.name, user1_associate.name);

  // ============== FIRM 2: Elite Tax Advisors ==============
  console.log('\n--- Creating Firm 2: Elite Tax Advisors ---');

  const firm2 = await prisma.firm.create({
    data: {
      name: 'Elite Tax Advisors',
      registrationNumber: 'AAC-5678',
      email: 'admin@elitetax.com',
      phone: '080-87654321',
      address: '456 Tech Tower, Whitefield, Bangalore - 560066',
      plan: Plan.ENTERPRISE,
      maxClients: 100,
    },
  });
  console.log('Created firm:', firm2.name);

  const user2_admin = await prisma.user.create({
    data: {
      email: 'admin@elitetax.com',
      name: 'Vikram Singh',
      password: hashedPassword,
      role: Role.ADMIN,
      firmId: firm2.id,
      status: 'ACTIVE',
      department: 'Management',
      title: 'Founding Partner',
      phone: '9988776655',
    },
  });

  const user2_manager = await prisma.user.create({
    data: {
      email: 'manager@elitetax.com',
      name: 'Ananya Reddy',
      password: hashedPassword,
      role: Role.MANAGER,
      firmId: firm2.id,
      status: 'ACTIVE',
      department: 'International Tax',
      title: 'Manager',
      phone: '9988776656',
    },
  });

  console.log('Created users:', user2_admin.name, user2_manager.name);

  // ============== FIRM 1 CLIENTS ==============
  console.log('\n--- Creating Clients for Demo CA Firm ---');

  // Client 1: IT Services Company
  const client1 = await prisma.client.create({
    data: {
      name: 'TechCorp India Pvt Ltd',
      pan: 'AABCT1234A',
      tan: 'MUMT12345A',
      cin: 'U72200MH2010PTC123456',
      industry: 'IT Services',
      nicCode: '6201',
      nicDescription: 'Computer programming activities',
      contactPerson: 'Suresh Menon',
      contactEmail: 'suresh@techcorp.com',
      contactPhone: '9876543220',
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
      consolidatedRevenue: 500000000000,
      firmId: firm1.id,
      assignedToId: user1_manager.id,
      reviewerId: user1_admin.id,
      status: 'active',
    },
  });

  // Client 2: Pharmaceutical Company
  const client2 = await prisma.client.create({
    data: {
      name: 'Pharma Solutions Ltd',
      pan: 'AABCP5678B',
      tan: 'MUMP56789B',
      cin: 'U24200MH2005PLC156789',
      industry: 'Pharmaceuticals',
      nicCode: '2100',
      nicDescription: 'Manufacture of pharmaceuticals',
      contactPerson: 'Meera Patel',
      contactEmail: 'meera@pharmasol.com',
      contactPhone: '9876543221',
      address: '200 Pharma Zone, Thane',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400601',
      country: 'India',
      website: 'https://pharmasol.com',
      parentCompany: 'Pharma Global AG',
      parentCountry: 'Switzerland',
      ultimateParent: 'Pharma Global AG',
      ultimateParentCountry: 'Switzerland',
      consolidatedRevenue: 800000000000,
      firmId: firm1.id,
      assignedToId: user1_associate.id,
      reviewerId: user1_manager.id,
      status: 'active',
    },
  });

  // Client 3: Auto Parts Company
  const client3 = await prisma.client.create({
    data: {
      name: 'Auto Parts Manufacturing Pvt Ltd',
      pan: 'AABCA9012C',
      tan: 'CHEA90123C',
      industry: 'Auto Ancillary',
      nicCode: '2930',
      nicDescription: 'Manufacture of parts for motor vehicles',
      contactPerson: 'Amit Singh',
      contactEmail: 'amit@autoparts.com',
      contactPhone: '9876543222',
      address: '300 Industrial Estate, Sriperumbudur',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '602105',
      country: 'India',
      parentCompany: 'Auto Global Corp',
      parentCountry: 'Japan',
      ultimateParent: 'Nippon Auto Holdings',
      ultimateParentCountry: 'Japan',
      consolidatedRevenue: 300000000000,
      firmId: firm1.id,
      assignedToId: user1_manager.id,
      reviewerId: user1_admin.id,
      status: 'active',
    },
  });

  console.log('Created clients:', client1.name, client2.name, client3.name);

  // ============== FIRM 2 CLIENTS ==============
  console.log('\n--- Creating Clients for Elite Tax Advisors ---');

  // Client 4: Financial Services
  const client4 = await prisma.client.create({
    data: {
      name: 'Global Finance India Ltd',
      pan: 'AABCG3456D',
      tan: 'BLRG34567D',
      cin: 'U65100KA2012PLC065432',
      industry: 'Financial Services',
      nicCode: '6419',
      nicDescription: 'Other monetary intermediation',
      contactPerson: 'Kiran Rao',
      contactEmail: 'kiran@globalfinance.com',
      contactPhone: '9876543230',
      address: '400 Finance Tower, MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India',
      parentCompany: 'Global Finance Holdings LLC',
      parentCountry: 'USA',
      ultimateParent: 'Global Finance Holdings LLC',
      ultimateParentCountry: 'USA',
      consolidatedRevenue: 1200000000000,
      firmId: firm2.id,
      assignedToId: user2_manager.id,
      reviewerId: user2_admin.id,
      status: 'active',
    },
  });

  // Client 5: E-commerce Company
  const client5 = await prisma.client.create({
    data: {
      name: 'ShopEasy India Pvt Ltd',
      pan: 'AABCS7890E',
      tan: 'DELS78901E',
      cin: 'U52100DL2015PTC178901',
      industry: 'E-commerce',
      nicCode: '4791',
      nicDescription: 'Retail sale via mail order houses or via Internet',
      contactPerson: 'Neha Gupta',
      contactEmail: 'neha@shopeasy.com',
      contactPhone: '9876543231',
      address: '500 Commerce Hub, Cyber City',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      country: 'India',
      parentCompany: 'ShopEasy Global Inc',
      parentCountry: 'Singapore',
      ultimateParent: 'ShopEasy Global Inc',
      ultimateParentCountry: 'Singapore',
      consolidatedRevenue: 2000000000000,
      firmId: firm2.id,
      assignedToId: user2_manager.id,
      reviewerId: user2_admin.id,
      status: 'active',
    },
  });

  // Client 6: FMCG Company
  const client6 = await prisma.client.create({
    data: {
      name: 'Consumer Goods India Ltd',
      pan: 'AABCC1234F',
      tan: 'MUMC12345F',
      cin: 'U15400MH2008PLC189012',
      industry: 'FMCG',
      nicCode: '1080',
      nicDescription: 'Manufacture of other food products',
      contactPerson: 'Ravi Krishnan',
      contactEmail: 'ravi@consumergoods.com',
      contactPhone: '9876543240',
      address: '600 FMCG Park, Powai',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400076',
      country: 'India',
      parentCompany: 'Consumer Global PLC',
      parentCountry: 'United Kingdom',
      ultimateParent: 'Consumer Global PLC',
      ultimateParentCountry: 'United Kingdom',
      consolidatedRevenue: 650000000000,
      firmId: firm1.id,
      assignedToId: user1_associate.id,
      reviewerId: user1_manager.id,
      status: 'active',
    },
  });

  // Client 7: Telecom Company
  const client7 = await prisma.client.create({
    data: {
      name: 'TeleCom Services India Pvt Ltd',
      pan: 'AABCT5678G',
      tan: 'DELT56789G',
      cin: 'U64200DL2010PTC201234',
      industry: 'Telecommunications',
      nicCode: '6110',
      nicDescription: 'Wired telecommunications activities',
      contactPerson: 'Sanjay Verma',
      contactEmail: 'sanjay@telecomservices.com',
      contactPhone: '9876543241',
      address: '700 Telecom Tower, Nehru Place',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110019',
      country: 'India',
      parentCompany: 'TeleCom Holdings BV',
      parentCountry: 'Netherlands',
      ultimateParent: 'TeleCom Holdings BV',
      ultimateParentCountry: 'Netherlands',
      consolidatedRevenue: 1500000000000,
      firmId: firm2.id,
      assignedToId: user2_manager.id,
      reviewerId: user2_admin.id,
      status: 'active',
    },
  });

  // Client 8: Renewable Energy Company
  const client8 = await prisma.client.create({
    data: {
      name: 'GreenPower India Ltd',
      pan: 'AABCG9012H',
      tan: 'CHEG90123H',
      cin: 'U40100TN2015PLC212345',
      industry: 'Renewable Energy',
      nicCode: '3511',
      nicDescription: 'Production of electricity',
      contactPerson: 'Lakshmi Sundaram',
      contactEmail: 'lakshmi@greenpower.com',
      contactPhone: '9876543242',
      address: '800 Green Energy Park, Coimbatore',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641014',
      country: 'India',
      parentCompany: 'GreenPower International SA',
      parentCountry: 'Spain',
      ultimateParent: 'GreenPower International SA',
      ultimateParentCountry: 'Spain',
      consolidatedRevenue: 400000000000,
      firmId: firm1.id,
      assignedToId: user1_manager.id,
      reviewerId: user1_admin.id,
      status: 'active',
    },
  });

  // Client 9: Healthcare/Hospital Chain
  const client9 = await prisma.client.create({
    data: {
      name: 'MediCare Hospitals Pvt Ltd',
      pan: 'AABCM3456I',
      tan: 'BLRM34567I',
      cin: 'U85110KA2012PTC223456',
      industry: 'Healthcare',
      nicCode: '8610',
      nicDescription: 'Hospital activities',
      contactPerson: 'Dr. Arun Sharma',
      contactEmail: 'arun@medicarehospitals.com',
      contactPhone: '9876543243',
      address: '900 Healthcare Complex, Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560034',
      country: 'India',
      parentCompany: 'MediCare Global Inc',
      parentCountry: 'USA',
      ultimateParent: 'MediCare Global Inc',
      ultimateParentCountry: 'USA',
      consolidatedRevenue: 350000000000,
      firmId: firm2.id,
      assignedToId: user2_manager.id,
      reviewerId: user2_admin.id,
      status: 'active',
    },
  });

  // Client 10: Logistics Company
  const client10 = await prisma.client.create({
    data: {
      name: 'FastLogix India Pvt Ltd',
      pan: 'AABCF7890J',
      tan: 'MUMF78901J',
      cin: 'U63000MH2014PTC234567',
      industry: 'Logistics & Supply Chain',
      nicCode: '5210',
      nicDescription: 'Warehousing and storage',
      contactPerson: 'Deepak Malhotra',
      contactEmail: 'deepak@fastlogix.com',
      contactPhone: '9876543244',
      address: '1000 Logistics Hub, Bhiwandi',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '421302',
      country: 'India',
      parentCompany: 'FastLogix Global GmbH',
      parentCountry: 'Germany',
      ultimateParent: 'FastLogix Global GmbH',
      ultimateParentCountry: 'Germany',
      consolidatedRevenue: 280000000000,
      firmId: firm1.id,
      assignedToId: user1_associate.id,
      reviewerId: user1_manager.id,
      status: 'active',
    },
  });

  console.log('Created clients:', client4.name, client5.name);
  console.log('Created clients:', client6.name, client7.name, client8.name);
  console.log('Created clients:', client9.name, client10.name);

  // ============== ASSOCIATED ENTERPRISES ==============
  console.log('\n--- Creating Associated Enterprises ---');

  // Client 1 AEs
  const ae1_parent = await prisma.associatedEnterprise.create({
    data: {
      clientId: client1.id,
      name: 'TechCorp Inc',
      country: 'USA',
      relationship: 'PARENT',
      tin: '12-3456789',
      address: '1000 Tech Drive, San Jose, CA 95134',
    },
  });

  const ae1_uk = await prisma.associatedEnterprise.create({
    data: {
      clientId: client1.id,
      name: 'TechCorp UK Ltd',
      country: 'United Kingdom',
      relationship: 'FELLOW_SUBSIDIARY',
      tin: 'GB123456789',
      address: '100 Tech Street, London EC1A 1BB',
    },
  });

  const ae1_singapore = await prisma.associatedEnterprise.create({
    data: {
      clientId: client1.id,
      name: 'TechCorp Singapore Pte Ltd',
      country: 'Singapore',
      relationship: 'FELLOW_SUBSIDIARY',
      tin: 'SG12345678A',
      address: '1 Marina Boulevard, Singapore 018989',
    },
  });

  // Client 2 AEs
  const ae2_parent = await prisma.associatedEnterprise.create({
    data: {
      clientId: client2.id,
      name: 'Pharma Global AG',
      country: 'Switzerland',
      relationship: 'PARENT',
      tin: 'CHE-123.456.789',
      address: 'Pharma Strasse 50, 8001 Zurich',
    },
  });

  const ae2_germany = await prisma.associatedEnterprise.create({
    data: {
      clientId: client2.id,
      name: 'Pharma Deutschland GmbH',
      country: 'Germany',
      relationship: 'FELLOW_SUBSIDIARY',
      tin: 'DE123456789',
      address: 'Pharma Allee 20, 60598 Frankfurt',
    },
  });

  // Client 3 AEs
  const ae3_parent = await prisma.associatedEnterprise.create({
    data: {
      clientId: client3.id,
      name: 'Auto Global Corp',
      country: 'Japan',
      relationship: 'PARENT',
      tin: 'JP1234567890',
      address: '1-1-1 Shibuya, Tokyo 150-0002',
    },
  });

  // Client 4 AEs
  const ae4_parent = await prisma.associatedEnterprise.create({
    data: {
      clientId: client4.id,
      name: 'Global Finance Holdings LLC',
      country: 'USA',
      relationship: 'PARENT',
      tin: '98-7654321',
      address: '1 Wall Street, New York, NY 10005',
    },
  });

  const ae4_cayman = await prisma.associatedEnterprise.create({
    data: {
      clientId: client4.id,
      name: 'Global Finance Cayman Ltd',
      country: 'Cayman Islands',
      relationship: 'FELLOW_SUBSIDIARY',
      address: 'Grand Cayman, KY1-1000',
    },
  });

  // Client 5 AEs
  const ae5_parent = await prisma.associatedEnterprise.create({
    data: {
      clientId: client5.id,
      name: 'ShopEasy Global Inc',
      country: 'Singapore',
      relationship: 'PARENT',
      tin: 'SG98765432B',
      address: '8 Marina View, Singapore 018960',
    },
  });

  // Client 6 AEs (FMCG)
  const ae6_parent = await prisma.associatedEnterprise.create({
    data: {
      clientId: client6.id,
      name: 'Consumer Global PLC',
      country: 'United Kingdom',
      relationship: 'PARENT',
      tin: 'GB987654321',
      address: '100 Consumer House, London SW1A 1AA',
    },
  });

  const ae6_dubai = await prisma.associatedEnterprise.create({
    data: {
      clientId: client6.id,
      name: 'Consumer MENA FZE',
      country: 'UAE',
      relationship: 'FELLOW_SUBSIDIARY',
      address: 'Dubai Internet City, Dubai',
    },
  });

  // Client 7 AEs (Telecom)
  const ae7_parent = await prisma.associatedEnterprise.create({
    data: {
      clientId: client7.id,
      name: 'TeleCom Holdings BV',
      country: 'Netherlands',
      relationship: 'PARENT',
      tin: 'NL123456789B01',
      address: 'Telecom Plaza, Amsterdam',
    },
  });

  // Client 8 AEs (Renewable Energy)
  const ae8_parent = await prisma.associatedEnterprise.create({
    data: {
      clientId: client8.id,
      name: 'GreenPower International SA',
      country: 'Spain',
      relationship: 'PARENT',
      tin: 'ES12345678A',
      address: 'Paseo de la Castellana, Madrid',
    },
  });

  // Client 9 AEs (Healthcare)
  const ae9_parent = await prisma.associatedEnterprise.create({
    data: {
      clientId: client9.id,
      name: 'MediCare Global Inc',
      country: 'USA',
      relationship: 'PARENT',
      tin: '45-6789012',
      address: '500 Healthcare Drive, Boston, MA 02101',
    },
  });

  // Client 10 AEs (Logistics)
  const ae10_parent = await prisma.associatedEnterprise.create({
    data: {
      clientId: client10.id,
      name: 'FastLogix Global GmbH',
      country: 'Germany',
      relationship: 'PARENT',
      tin: 'DE987654321',
      address: 'Logistik Strasse 1, Hamburg',
    },
  });

  console.log('Created associated enterprises for all clients');

  // ============== ENGAGEMENTS ==============
  console.log('\n--- Creating Engagements ---');

  // Client 1 Engagements (2 years)
  const engagement1_current = await prisma.engagement.create({
    data: {
      clientId: client1.id,
      financialYear: '2025-26',
      assessmentYear: '2026-27',
      status: EngagementStatus.BENCHMARKING,
      priority: Priority.HIGH,
      notes: 'Large IT services client with multiple international transactions. Safe Harbour applied for IT/ITeS services.',
      totalRevenue: 82000000000,
      operatingCost: 65600000000,
      operatingProfit: 16400000000,
      employeeCost: 45000000000,
      opOc: 0.25,
      opOr: 0.20,
      safeHarbourEligible: true,
      totalRptValue: 25000000000,
      dueDate: new Date('2025-11-30'),
    },
  });

  const engagement1_prior = await prisma.engagement.create({
    data: {
      clientId: client1.id,
      financialYear: '2024-25',
      assessmentYear: '2025-26',
      status: EngagementStatus.FILED,
      priority: Priority.MEDIUM,
      totalRevenue: 75000000000,
      operatingCost: 60000000000,
      operatingProfit: 15000000000,
      employeeCost: 41000000000,
      opOc: 0.25,
      opOr: 0.20,
      safeHarbourEligible: true,
      totalRptValue: 22000000000,
      dueDate: new Date('2024-11-30'),
      filedDate: new Date('2024-11-15'),
    },
  });

  // Client 2 Engagements
  const engagement2_current = await prisma.engagement.create({
    data: {
      clientId: client2.id,
      financialYear: '2025-26',
      assessmentYear: '2026-27',
      status: EngagementStatus.SAFE_HARBOUR_CHECK,
      priority: Priority.HIGH,
      notes: 'Pharma company with significant royalty payments. Need to check if Safe Harbour applies.',
      totalRevenue: 120000000000,
      operatingCost: 96000000000,
      operatingProfit: 24000000000,
      opOc: 0.25,
      opOr: 0.20,
      totalRptValue: 35000000000,
      dueDate: new Date('2025-11-30'),
    },
  });

  // Client 3 Engagements
  const engagement3_current = await prisma.engagement.create({
    data: {
      clientId: client3.id,
      financialYear: '2025-26',
      assessmentYear: '2026-27',
      status: EngagementStatus.DATA_COLLECTION,
      priority: Priority.MEDIUM,
      notes: 'Auto parts manufacturer. Purchase of raw materials from parent company.',
      totalRevenue: 45000000000,
      operatingCost: 40500000000,
      operatingProfit: 4500000000,
      opOc: 0.111,
      opOr: 0.10,
      totalRptValue: 15000000000,
      dueDate: new Date('2025-11-30'),
    },
  });

  // Client 4 Engagements
  const engagement4_current = await prisma.engagement.create({
    data: {
      clientId: client4.id,
      financialYear: '2025-26',
      assessmentYear: '2026-27',
      status: EngagementStatus.DOCUMENTATION,
      priority: Priority.CRITICAL,
      notes: 'Financial services company with intra-group loans and guarantees. Thin cap analysis required.',
      totalRevenue: 180000000000,
      operatingCost: 144000000000,
      operatingProfit: 36000000000,
      opOc: 0.25,
      opOr: 0.20,
      totalRptValue: 80000000000,
      dueDate: new Date('2025-11-30'),
    },
  });

  // Client 5 Engagements
  const engagement5_current = await prisma.engagement.create({
    data: {
      clientId: client5.id,
      financialYear: '2025-26',
      assessmentYear: '2026-27',
      status: EngagementStatus.REVIEW,
      priority: Priority.HIGH,
      notes: 'E-commerce platform with technology payments and management fees.',
      totalRevenue: 250000000000,
      operatingCost: 237500000000,
      operatingProfit: 12500000000,
      opOc: 0.053,
      opOr: 0.05,
      totalRptValue: 45000000000,
      dueDate: new Date('2025-11-30'),
    },
  });

  // Client 6 Engagements (FMCG)
  const engagement6_current = await prisma.engagement.create({
    data: {
      clientId: client6.id,
      financialYear: '2025-26',
      assessmentYear: '2026-27',
      status: EngagementStatus.BENCHMARKING,
      priority: Priority.HIGH,
      notes: 'FMCG company with royalty payments for brand usage and distribution agreements.',
      totalRevenue: 95000000000,
      operatingCost: 80750000000,
      operatingProfit: 14250000000,
      opOc: 0.176,
      opOr: 0.15,
      totalRptValue: 28000000000,
      dueDate: new Date('2025-11-30'),
    },
  });

  // Client 7 Engagements (Telecom)
  const engagement7_current = await prisma.engagement.create({
    data: {
      clientId: client7.id,
      financialYear: '2025-26',
      assessmentYear: '2026-27',
      status: EngagementStatus.DOCUMENTATION,
      priority: Priority.CRITICAL,
      notes: 'Telecom company with significant equipment purchases and spectrum fees from parent.',
      totalRevenue: 220000000000,
      operatingCost: 187000000000,
      operatingProfit: 33000000000,
      opOc: 0.176,
      opOr: 0.15,
      totalRptValue: 65000000000,
      dueDate: new Date('2025-11-30'),
    },
  });

  // Client 8 Engagements (Renewable Energy)
  const engagement8_current = await prisma.engagement.create({
    data: {
      clientId: client8.id,
      financialYear: '2025-26',
      assessmentYear: '2026-27',
      status: EngagementStatus.SAFE_HARBOUR_CHECK,
      priority: Priority.MEDIUM,
      notes: 'Renewable energy company with EPC contracts and technical services from parent.',
      totalRevenue: 55000000000,
      operatingCost: 46750000000,
      operatingProfit: 8250000000,
      opOc: 0.176,
      opOr: 0.15,
      totalRptValue: 18000000000,
      dueDate: new Date('2025-11-30'),
    },
  });

  // Client 9 Engagements (Healthcare)
  const engagement9_current = await prisma.engagement.create({
    data: {
      clientId: client9.id,
      financialYear: '2025-26',
      assessmentYear: '2026-27',
      status: EngagementStatus.DATA_COLLECTION,
      priority: Priority.HIGH,
      notes: 'Hospital chain with management fees and medical equipment purchases from US parent.',
      totalRevenue: 48000000000,
      operatingCost: 40800000000,
      operatingProfit: 7200000000,
      opOc: 0.176,
      opOr: 0.15,
      totalRptValue: 12000000000,
      dueDate: new Date('2025-11-30'),
    },
  });

  // Client 10 Engagements (Logistics)
  const engagement10_current = await prisma.engagement.create({
    data: {
      clientId: client10.id,
      financialYear: '2025-26',
      assessmentYear: '2026-27',
      status: EngagementStatus.APPROVED,
      priority: Priority.LOW,
      notes: 'Logistics company with IT services and management fees to German parent.',
      totalRevenue: 38000000000,
      operatingCost: 34200000000,
      operatingProfit: 3800000000,
      opOc: 0.111,
      opOr: 0.10,
      totalRptValue: 8500000000,
      dueDate: new Date('2025-11-30'),
    },
  });

  console.log('Created engagements for all clients');

  // ============== INTERNATIONAL TRANSACTIONS ==============
  console.log('\n--- Creating International Transactions ---');

  // Client 1 Transactions
  await prisma.internationalTransaction.createMany({
    data: [
      {
        engagementId: engagement1_current.id,
        aeId: ae1_parent.id,
        natureCode: '21',
        transactionType: 'SERVICE_INCOME',
        description: 'Software development services provided to parent company',
        amount: 15000000000,
        currency: 'INR',
        method: TPMethod.TNMM,
        testedParty: 'INDIAN_ENTITY',
        pliType: 'OP_OC',
        pliValue: 0.22,
        safeHarbourApplied: true,
        safeHarbourType: 'IT_ITES',
      },
      {
        engagementId: engagement1_current.id,
        aeId: ae1_uk.id,
        natureCode: '21',
        transactionType: 'SERVICE_INCOME',
        description: 'IT support services to UK entity',
        amount: 5000000000,
        currency: 'INR',
        method: TPMethod.TNMM,
        testedParty: 'INDIAN_ENTITY',
        pliType: 'OP_OC',
        pliValue: 0.25,
        safeHarbourApplied: true,
        safeHarbourType: 'IT_ITES',
      },
      {
        engagementId: engagement1_current.id,
        aeId: ae1_singapore.id,
        natureCode: '51',
        transactionType: 'INTEREST_INCOME',
        description: 'Interest on loan given to Singapore entity',
        amount: 500000000,
        currency: 'INR',
        safeHarbourApplied: true,
        safeHarbourType: 'LOAN_FC',
      },
      {
        engagementId: engagement1_current.id,
        aeId: ae1_parent.id,
        natureCode: '22',
        transactionType: 'ROYALTY_PAYMENT',
        description: 'Royalty for use of brand and technology',
        amount: 2000000000,
        currency: 'INR',
        method: TPMethod.CUP,
        testedParty: 'INDIAN_ENTITY',
      },
    ],
  });

  // Client 2 Transactions
  await prisma.internationalTransaction.createMany({
    data: [
      {
        engagementId: engagement2_current.id,
        aeId: ae2_parent.id,
        natureCode: '12',
        transactionType: 'PURCHASE',
        description: 'Purchase of Active Pharmaceutical Ingredients',
        amount: 20000000000,
        currency: 'INR',
        method: TPMethod.TNMM,
        testedParty: 'INDIAN_ENTITY',
        pliType: 'OP_OC',
        pliValue: 0.25,
      },
      {
        engagementId: engagement2_current.id,
        aeId: ae2_parent.id,
        natureCode: '22',
        transactionType: 'ROYALTY_PAYMENT',
        description: 'Royalty for pharmaceutical formulations and patents',
        amount: 8000000000,
        currency: 'INR',
        method: TPMethod.CUP,
        testedParty: 'INDIAN_ENTITY',
      },
      {
        engagementId: engagement2_current.id,
        aeId: ae2_germany.id,
        natureCode: '21',
        transactionType: 'SERVICE_INCOME',
        description: 'Contract research services provided to Germany',
        amount: 3000000000,
        currency: 'INR',
        method: TPMethod.TNMM,
        testedParty: 'INDIAN_ENTITY',
        pliType: 'OP_OC',
        pliValue: 0.28,
      },
    ],
  });

  // Client 3 Transactions
  await prisma.internationalTransaction.createMany({
    data: [
      {
        engagementId: engagement3_current.id,
        aeId: ae3_parent.id,
        natureCode: '12',
        transactionType: 'PURCHASE',
        description: 'Purchase of precision auto components',
        amount: 12000000000,
        currency: 'INR',
        method: TPMethod.CPM,
        testedParty: 'INDIAN_ENTITY',
        pliType: 'OP_OC',
        pliValue: 0.08,
      },
      {
        engagementId: engagement3_current.id,
        aeId: ae3_parent.id,
        natureCode: '23',
        transactionType: 'TECHNICAL_FEE',
        description: 'Technical know-how fees',
        amount: 1500000000,
        currency: 'INR',
        method: TPMethod.CUP,
        testedParty: 'INDIAN_ENTITY',
      },
    ],
  });

  // Client 4 Transactions
  await prisma.internationalTransaction.createMany({
    data: [
      {
        engagementId: engagement4_current.id,
        aeId: ae4_parent.id,
        natureCode: '51',
        transactionType: 'INTEREST_PAYMENT',
        description: 'Interest on external commercial borrowing from parent',
        amount: 25000000000,
        currency: 'INR',
        method: TPMethod.CUP,
        testedParty: 'INDIAN_ENTITY',
      },
      {
        engagementId: engagement4_current.id,
        aeId: ae4_cayman.id,
        natureCode: '52',
        transactionType: 'GUARANTEE_FEE',
        description: 'Corporate guarantee fee paid',
        amount: 5000000000,
        currency: 'INR',
        safeHarbourApplied: true,
        safeHarbourType: 'GUARANTEE',
      },
      {
        engagementId: engagement4_current.id,
        aeId: ae4_parent.id,
        natureCode: '25',
        transactionType: 'MANAGEMENT_FEE',
        description: 'Group management and shared services allocation',
        amount: 8000000000,
        currency: 'INR',
        method: TPMethod.TNMM,
        testedParty: 'INDIAN_ENTITY',
      },
    ],
  });

  // Client 5 Transactions
  await prisma.internationalTransaction.createMany({
    data: [
      {
        engagementId: engagement5_current.id,
        aeId: ae5_parent.id,
        natureCode: '22',
        transactionType: 'ROYALTY_PAYMENT',
        description: 'Technology platform license fee',
        amount: 15000000000,
        currency: 'INR',
        method: TPMethod.TNMM,
        testedParty: 'INDIAN_ENTITY',
        pliType: 'OP_OR',
        pliValue: 0.05,
      },
      {
        engagementId: engagement5_current.id,
        aeId: ae5_parent.id,
        natureCode: '25',
        transactionType: 'MANAGEMENT_FEE',
        description: 'Regional headquarters support services',
        amount: 10000000000,
        currency: 'INR',
        method: TPMethod.TNMM,
        testedParty: 'INDIAN_ENTITY',
      },
      {
        engagementId: engagement5_current.id,
        aeId: ae5_parent.id,
        natureCode: '13',
        transactionType: 'PURCHASE',
        description: 'Purchase of merchandise from group companies',
        amount: 20000000000,
        currency: 'INR',
        method: TPMethod.RPM,
        testedParty: 'INDIAN_ENTITY',
        pliType: 'GROSS_PROFIT',
        pliValue: 0.15,
      },
    ],
  });

  // Client 6 Transactions (FMCG)
  await prisma.internationalTransaction.createMany({
    data: [
      {
        engagementId: engagement6_current.id,
        aeId: ae6_parent.id,
        natureCode: '22',
        transactionType: 'ROYALTY_PAYMENT',
        description: 'Brand royalty for FMCG products',
        amount: 12000000000,
        currency: 'INR',
        method: TPMethod.CUP,
        testedParty: 'INDIAN_ENTITY',
      },
      {
        engagementId: engagement6_current.id,
        aeId: ae6_dubai.id,
        natureCode: '11',
        transactionType: 'SALE',
        description: 'Export of finished goods to MENA region',
        amount: 8000000000,
        currency: 'INR',
        method: TPMethod.TNMM,
        testedParty: 'INDIAN_ENTITY',
        pliType: 'OP_OC',
        pliValue: 0.18,
      },
    ],
  });

  // Client 7 Transactions (Telecom)
  await prisma.internationalTransaction.createMany({
    data: [
      {
        engagementId: engagement7_current.id,
        aeId: ae7_parent.id,
        natureCode: '12',
        transactionType: 'PURCHASE',
        description: 'Purchase of telecom equipment',
        amount: 35000000000,
        currency: 'INR',
        method: TPMethod.TNMM,
        testedParty: 'INDIAN_ENTITY',
        pliType: 'OP_OC',
        pliValue: 0.15,
      },
      {
        engagementId: engagement7_current.id,
        aeId: ae7_parent.id,
        natureCode: '22',
        transactionType: 'ROYALTY_PAYMENT',
        description: 'Technology license and spectrum management fees',
        amount: 18000000000,
        currency: 'INR',
        method: TPMethod.CUP,
        testedParty: 'INDIAN_ENTITY',
      },
      {
        engagementId: engagement7_current.id,
        aeId: ae7_parent.id,
        natureCode: '25',
        transactionType: 'MANAGEMENT_FEE',
        description: 'Group support services allocation',
        amount: 5000000000,
        currency: 'INR',
        method: TPMethod.TNMM,
        testedParty: 'INDIAN_ENTITY',
      },
    ],
  });

  // Client 8 Transactions (Renewable Energy)
  await prisma.internationalTransaction.createMany({
    data: [
      {
        engagementId: engagement8_current.id,
        aeId: ae8_parent.id,
        natureCode: '21',
        transactionType: 'SERVICE_INCOME',
        description: 'Engineering and project management services',
        amount: 10000000000,
        currency: 'INR',
        method: TPMethod.TNMM,
        testedParty: 'INDIAN_ENTITY',
        pliType: 'OP_OC',
        pliValue: 0.20,
      },
      {
        engagementId: engagement8_current.id,
        aeId: ae8_parent.id,
        natureCode: '23',
        transactionType: 'TECHNICAL_FEE',
        description: 'Technical know-how for solar panel manufacturing',
        amount: 4000000000,
        currency: 'INR',
        method: TPMethod.CUP,
        testedParty: 'INDIAN_ENTITY',
      },
    ],
  });

  // Client 9 Transactions (Healthcare)
  await prisma.internationalTransaction.createMany({
    data: [
      {
        engagementId: engagement9_current.id,
        aeId: ae9_parent.id,
        natureCode: '12',
        transactionType: 'PURCHASE',
        description: 'Import of medical equipment and devices',
        amount: 6000000000,
        currency: 'INR',
        method: TPMethod.TNMM,
        testedParty: 'INDIAN_ENTITY',
        pliType: 'OP_OC',
        pliValue: 0.15,
      },
      {
        engagementId: engagement9_current.id,
        aeId: ae9_parent.id,
        natureCode: '25',
        transactionType: 'MANAGEMENT_FEE',
        description: 'Hospital management and quality assurance services',
        amount: 3500000000,
        currency: 'INR',
        method: TPMethod.TNMM,
        testedParty: 'INDIAN_ENTITY',
      },
      {
        engagementId: engagement9_current.id,
        aeId: ae9_parent.id,
        natureCode: '22',
        transactionType: 'ROYALTY_PAYMENT',
        description: 'Brand and operating system royalty',
        amount: 2000000000,
        currency: 'INR',
        method: TPMethod.CUP,
        testedParty: 'INDIAN_ENTITY',
      },
    ],
  });

  // Client 10 Transactions (Logistics)
  await prisma.internationalTransaction.createMany({
    data: [
      {
        engagementId: engagement10_current.id,
        aeId: ae10_parent.id,
        natureCode: '21',
        transactionType: 'SERVICE_EXPENSE',
        description: 'IT and logistics software services',
        amount: 4500000000,
        currency: 'INR',
        method: TPMethod.TNMM,
        testedParty: 'INDIAN_ENTITY',
        pliType: 'OP_OC',
        pliValue: 0.12,
      },
      {
        engagementId: engagement10_current.id,
        aeId: ae10_parent.id,
        natureCode: '25',
        transactionType: 'MANAGEMENT_FEE',
        description: 'Global operations management support',
        amount: 2500000000,
        currency: 'INR',
        method: TPMethod.TNMM,
        testedParty: 'INDIAN_ENTITY',
      },
    ],
  });

  console.log('Created international transactions for all engagements');

  // ============== SAFE HARBOUR RESULTS ==============
  console.log('\n--- Creating Safe Harbour Results ---');

  await prisma.safeHarbourResult.createMany({
    data: [
      {
        engagementId: engagement1_current.id,
        transactionType: 'IT_ITES',
        isEligible: true,
        turnover: 82000000000,
        opOcMargin: 0.25,
        appliedRate: 0.195,
        minimumRate: 0.18,
        recommendation: 'Entity is eligible for Safe Harbour. OP/OC margin of 25% exceeds minimum 18% for IT/ITeS services (per CBDT Notification 117/2023).',
        analysis: {
          eligible: true,
          margin: 0.25,
          requiredMargin: 0.18,
          marginGap: 0.07,
          transactionsCovered: ['Software development services', 'IT support services'],
        },
      },
      {
        engagementId: engagement1_current.id,
        transactionType: 'LOAN_FC',
        isEligible: true,
        interestRate: 0.055,
        minimumRate: 0.05,
        recommendation: 'Loan qualifies for Safe Harbour. Interest rate of 5.5% is within LIBOR+300bps range.',
        analysis: {
          eligible: true,
          loanAmount: 5000000000,
          currency: 'USD',
          rateApplied: 0.055,
          benchmark: 'SOFR+300bps',
        },
      },
      {
        engagementId: engagement2_current.id,
        transactionType: 'KPO',
        isEligible: false,
        turnover: 120000000000,
        opOcMargin: 0.25,
        minimumRate: 0.24,
        recommendation: 'Safe Harbour not applicable - Royalty transactions are not eligible for Safe Harbour regime.',
        analysis: {
          eligible: false,
          reason: 'Pharma royalty transactions outside Safe Harbour scope',
          alternativeApproach: 'Apply TNMM with external comparables',
        },
      },
      {
        engagementId: engagement4_current.id,
        transactionType: 'GUARANTEE',
        isEligible: true,
        guaranteeFee: 0.02,
        minimumRate: 0.01,
        recommendation: 'Corporate guarantee qualifies for Safe Harbour at 2% fee rate.',
        analysis: {
          eligible: true,
          guaranteeAmount: 50000000000,
          rateApplied: 0.02,
          minimumRate: 0.01,
        },
      },
    ],
  });

  console.log('Created safe harbour results');

  // ============== BENCHMARKING RESULTS ==============
  console.log('\n--- Creating Benchmarking Results ---');

  await prisma.benchmarkingResult.createMany({
    data: [
      {
        engagementId: engagement1_current.id,
        method: TPMethod.TNMM,
        pliType: 'OP_OC',
        testedPartyPLI: 0.25,
        lowerQuartile: 0.12,
        median: 0.18,
        upperQuartile: 0.24,
        isWithinRange: true,
        comparablesCount: 15,
        comparablesList: [
          { name: 'Infosys BPM Ltd', margin: 0.22 },
          { name: 'Wipro Technologies', margin: 0.19 },
          { name: 'HCL BPO Services', margin: 0.17 },
          { name: 'Tech Mahindra BPS', margin: 0.21 },
          { name: 'Cognizant India', margin: 0.20 },
        ],
        adjustmentsApplied: {
          workingCapital: true,
          riskAdjustment: false,
          capacityUtilization: false,
        },
      },
      {
        engagementId: engagement2_current.id,
        method: TPMethod.TNMM,
        pliType: 'OP_OC',
        testedPartyPLI: 0.25,
        lowerQuartile: 0.15,
        median: 0.22,
        upperQuartile: 0.28,
        isWithinRange: true,
        comparablesCount: 12,
        comparablesList: [
          { name: 'Sun Pharma Advanced', margin: 0.24 },
          { name: 'Cipla Contract', margin: 0.21 },
          { name: 'Lupin Biotech', margin: 0.26 },
        ],
        adjustmentsApplied: {
          workingCapital: true,
          riskAdjustment: true,
        },
      },
      {
        engagementId: engagement3_current.id,
        method: TPMethod.CPM,
        pliType: 'OP_OC',
        testedPartyPLI: 0.111,
        lowerQuartile: 0.06,
        median: 0.09,
        upperQuartile: 0.12,
        isWithinRange: true,
        comparablesCount: 10,
        comparablesList: [
          { name: 'Bosch Automotive', margin: 0.10 },
          { name: 'Denso India', margin: 0.08 },
          { name: 'Continental Auto', margin: 0.11 },
        ],
      },
      {
        engagementId: engagement5_current.id,
        method: TPMethod.TNMM,
        pliType: 'OP_OR',
        testedPartyPLI: 0.05,
        lowerQuartile: 0.02,
        median: 0.04,
        upperQuartile: 0.06,
        isWithinRange: true,
        adjustment: 0,
        comparablesCount: 8,
        comparablesList: [
          { name: 'Amazon Seller Services', margin: 0.03 },
          { name: 'Flipkart Internet', margin: 0.04 },
          { name: 'Myntra Designs', margin: 0.05 },
        ],
      },
    ],
  });

  // Additional benchmarking results for new clients
  await prisma.benchmarkingResult.createMany({
    data: [
      {
        engagementId: engagement6_current.id,
        method: TPMethod.CUP,
        pliType: 'ROYALTY_RATE',
        testedPartyPLI: 0.05,
        lowerQuartile: 0.03,
        median: 0.045,
        upperQuartile: 0.06,
        isWithinRange: true,
        comparablesCount: 8,
        comparablesList: [
          { name: 'Nestle India', rate: 0.04 },
          { name: 'Hindustan Unilever', rate: 0.05 },
          { name: 'ITC Limited', rate: 0.035 },
        ],
      },
      {
        engagementId: engagement7_current.id,
        method: TPMethod.TNMM,
        pliType: 'OP_OC',
        testedPartyPLI: 0.176,
        lowerQuartile: 0.10,
        median: 0.15,
        upperQuartile: 0.20,
        isWithinRange: true,
        comparablesCount: 6,
        comparablesList: [
          { name: 'Bharti Airtel', margin: 0.18 },
          { name: 'Vodafone Idea', margin: 0.12 },
          { name: 'Reliance Jio', margin: 0.22 },
        ],
      },
      {
        engagementId: engagement10_current.id,
        method: TPMethod.TNMM,
        pliType: 'OP_OC',
        testedPartyPLI: 0.111,
        lowerQuartile: 0.05,
        median: 0.08,
        upperQuartile: 0.12,
        isWithinRange: true,
        comparablesCount: 9,
        comparablesList: [
          { name: 'Blue Dart Express', margin: 0.09 },
          { name: 'Delhivery', margin: 0.07 },
          { name: 'Gati Ltd', margin: 0.10 },
        ],
      },
    ],
  });

  console.log('Created benchmarking results');

  // ============== DISPUTE CASES ==============
  console.log('\n--- Creating Dispute Cases ---');

  await prisma.disputeCase.createMany({
    data: [
      {
        engagementId: engagement1_prior.id,
        caseNumber: 'TP/BLR/2024/1234',
        assessmentYear: '2023-24',
        stage: DisputeStage.DRP,
        status: DisputeStatus.IN_PROGRESS,
        adjustmentByTPO: 5000000000,
        amountAtStake: 5000000000,
        tpoOrderDate: new Date('2024-06-15'),
        drpFilingDate: new Date('2024-07-10'),
        nextHearingDate: new Date('2025-03-15'),
        successProbability: 65,
        notes: 'DRP objections filed. Key issue: Comparability adjustments rejected by TPO.',
      },
      {
        engagementId: engagement2_current.id,
        caseNumber: 'TP/MUM/2023/5678',
        assessmentYear: '2022-23',
        stage: DisputeStage.ITAT,
        status: DisputeStatus.PENDING_HEARING,
        adjustmentByTPO: 8000000000,
        adjustmentByDRP: 5000000000,
        amountAtStake: 5000000000,
        tpoOrderDate: new Date('2023-08-20'),
        drpFilingDate: new Date('2023-09-15'),
        drpDirectionDate: new Date('2024-02-28'),
        itatFilingDate: new Date('2024-04-15'),
        nextHearingDate: new Date('2025-06-20'),
        successProbability: 70,
        notes: 'ITAT appeal filed after DRP partially allowed relief. Royalty rate issue pending.',
      },
      {
        engagementId: engagement4_current.id,
        caseNumber: 'TP/BLR/2024/9012',
        assessmentYear: '2024-25',
        stage: DisputeStage.TPO,
        status: DisputeStatus.OPEN,
        adjustmentByTPO: 12000000000,
        amountAtStake: 12000000000,
        tpoOrderDate: new Date('2025-01-10'),
        successProbability: 55,
        notes: 'TPO order received. Interest rate on ECB challenged. Need to file DRP objections.',
      },
    ],
  });

  console.log('Created dispute cases');

  // ============== DOCUMENTS ==============
  console.log('\n--- Creating Documents ---');

  await prisma.document.createMany({
    data: [
      // Client 1 Documents
      {
        engagementId: engagement1_current.id,
        clientId: client1.id,
        type: DocumentType.FORM_3CEB,
        status: DocStatus.IN_PROGRESS,
        name: 'Form 3CEB FY 2025-26',
        data: {
          assesseeInfo: { name: client1.name, pan: client1.pan },
          financialYear: '2025-26',
          totalTransactions: 4,
        },
      },
      {
        engagementId: engagement1_current.id,
        clientId: client1.id,
        type: DocumentType.FORM_3CEFA,
        status: DocStatus.DRAFT,
        name: 'Safe Harbour Form 3CEFA FY 2025-26',
        data: {
          safeHarbourType: 'IT_ITES',
          eligible: true,
        },
      },
      {
        engagementId: engagement1_prior.id,
        clientId: client1.id,
        type: DocumentType.FORM_3CEB,
        status: DocStatus.FILED,
        name: 'Form 3CEB FY 2024-25',
        acknowledgmentNo: 'ACK202411150001234',
        filedAt: new Date('2024-11-15'),
      },
      // Client 2 Documents
      {
        engagementId: engagement2_current.id,
        clientId: client2.id,
        type: DocumentType.FORM_3CEB,
        status: DocStatus.DRAFT,
        name: 'Form 3CEB FY 2025-26',
        data: {
          assesseeInfo: { name: client2.name, pan: client2.pan },
        },
      },
      {
        engagementId: engagement2_current.id,
        clientId: client2.id,
        type: DocumentType.TP_STUDY,
        status: DocStatus.IN_PROGRESS,
        name: 'TP Study Report FY 2025-26',
      },
      // Client 3 Documents
      {
        engagementId: engagement3_current.id,
        clientId: client3.id,
        type: DocumentType.FORM_3CEB,
        status: DocStatus.DRAFT,
        name: 'Form 3CEB FY 2025-26',
      },
      // Client 4 Documents
      {
        engagementId: engagement4_current.id,
        clientId: client4.id,
        type: DocumentType.FORM_3CEB,
        status: DocStatus.PENDING_REVIEW,
        name: 'Form 3CEB FY 2025-26',
        data: {
          assesseeInfo: { name: client4.name, pan: client4.pan },
          totalTransactions: 3,
        },
      },
      {
        engagementId: engagement4_current.id,
        clientId: client4.id,
        type: DocumentType.FORM_3CEAA,
        status: DocStatus.IN_PROGRESS,
        name: 'Master File Part A FY 2025-26',
      },
      {
        engagementId: engagement4_current.id,
        clientId: client4.id,
        type: DocumentType.BENCHMARKING_REPORT,
        status: DocStatus.DRAFT,
        name: 'Benchmarking Study FY 2025-26',
      },
      // Client 5 Documents
      {
        engagementId: engagement5_current.id,
        clientId: client5.id,
        type: DocumentType.FORM_3CEB,
        status: DocStatus.REVIEW,
        name: 'Form 3CEB FY 2025-26',
        data: {
          assesseeInfo: { name: client5.name, pan: client5.pan },
          totalTransactions: 3,
        },
      },
      {
        engagementId: engagement5_current.id,
        clientId: client5.id,
        type: DocumentType.LOCAL_FILE,
        status: DocStatus.IN_PROGRESS,
        name: 'Local File Documentation FY 2025-26',
      },
    ],
  });

  // Documents for new clients
  await prisma.document.createMany({
    data: [
      // Client 6 Documents (FMCG)
      {
        engagementId: engagement6_current.id,
        clientId: client6.id,
        type: DocumentType.FORM_3CEB,
        status: DocStatus.IN_PROGRESS,
        name: 'Form 3CEB FY 2025-26',
        data: {
          assesseeInfo: { name: 'Consumer Goods India Ltd', pan: 'AABCC1234F' },
          totalTransactions: 2,
        },
      },
      {
        engagementId: engagement6_current.id,
        clientId: client6.id,
        type: DocumentType.BENCHMARKING_REPORT,
        status: DocStatus.DRAFT,
        name: 'Benchmarking Study - Royalty FY 2025-26',
      },
      // Client 7 Documents (Telecom)
      {
        engagementId: engagement7_current.id,
        clientId: client7.id,
        type: DocumentType.FORM_3CEB,
        status: DocStatus.PENDING_REVIEW,
        name: 'Form 3CEB FY 2025-26',
        data: {
          assesseeInfo: { name: 'TeleCom Services India Pvt Ltd', pan: 'AABCT5678G' },
          totalTransactions: 3,
        },
      },
      {
        engagementId: engagement7_current.id,
        clientId: client7.id,
        type: DocumentType.FORM_3CEAA,
        status: DocStatus.DRAFT,
        name: 'Master File Part A FY 2025-26',
      },
      {
        engagementId: engagement7_current.id,
        clientId: client7.id,
        type: DocumentType.LOCAL_FILE,
        status: DocStatus.IN_PROGRESS,
        name: 'Local File Documentation FY 2025-26',
      },
      // Client 8 Documents (Renewable Energy)
      {
        engagementId: engagement8_current.id,
        clientId: client8.id,
        type: DocumentType.FORM_3CEB,
        status: DocStatus.DRAFT,
        name: 'Form 3CEB FY 2025-26',
      },
      // Client 9 Documents (Healthcare)
      {
        engagementId: engagement9_current.id,
        clientId: client9.id,
        type: DocumentType.FORM_3CEB,
        status: DocStatus.DRAFT,
        name: 'Form 3CEB FY 2025-26',
      },
      {
        engagementId: engagement9_current.id,
        clientId: client9.id,
        type: DocumentType.TP_STUDY,
        status: DocStatus.DRAFT,
        name: 'TP Study Report FY 2025-26',
      },
      // Client 10 Documents (Logistics)
      {
        engagementId: engagement10_current.id,
        clientId: client10.id,
        type: DocumentType.FORM_3CEB,
        status: DocStatus.APPROVED,
        name: 'Form 3CEB FY 2025-26',
        data: {
          assesseeInfo: { name: 'FastLogix India Pvt Ltd', pan: 'AABCF7890J' },
          totalTransactions: 2,
        },
      },
    ],
  });

  console.log('Created documents');

  // ============== AUDIT LOGS ==============
  console.log('\n--- Creating Audit Logs ---');

  const now = new Date();

  await prisma.immutableAuditLog.createMany({
    data: [
      // Firm 1 Audit Logs
      {
        firmId: firm1.id,
        userId: user1_admin.id,
        action: 'CREATE',
        entityType: 'Client',
        entityId: client1.id,
        newValues: { name: client1.name, pan: client1.pan },
        ipAddress: '192.168.1.100',
        currentHash: 'hash-' + Date.now() + '-1',
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      },
      {
        firmId: firm1.id,
        userId: user1_manager.id,
        action: 'UPDATE',
        entityType: 'Engagement',
        entityId: engagement1_current.id,
        oldValues: { status: 'DATA_COLLECTION' },
        newValues: { status: 'BENCHMARKING' },
        ipAddress: '192.168.1.101',
        currentHash: 'hash-' + Date.now() + '-2',
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        firmId: firm1.id,
        userId: user1_associate.id,
        action: 'CREATE',
        entityType: 'Document',
        entityId: 'doc-temp-1',
        newValues: { type: 'FORM_3CEB', name: 'Form 3CEB FY 2025-26' },
        ipAddress: '192.168.1.102',
        currentHash: 'hash-' + Date.now() + '-3',
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        firmId: firm1.id,
        userId: user1_admin.id,
        action: 'VIEW',
        entityType: 'DisputeCase',
        entityId: 'dispute-temp-1',
        ipAddress: '192.168.1.100',
        currentHash: 'hash-' + Date.now() + '-4',
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      // Firm 2 Audit Logs
      {
        firmId: firm2.id,
        userId: user2_admin.id,
        action: 'CREATE',
        entityType: 'Client',
        entityId: client4.id,
        newValues: { name: client4.name, pan: client4.pan },
        ipAddress: '10.0.0.50',
        currentHash: 'hash-' + Date.now() + '-5',
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      },
      {
        firmId: firm2.id,
        userId: user2_manager.id,
        action: 'UPDATE',
        entityType: 'Engagement',
        entityId: engagement5_current.id,
        oldValues: { status: 'DOCUMENTATION' },
        newValues: { status: 'REVIEW' },
        ipAddress: '10.0.0.51',
        currentHash: 'hash-' + Date.now() + '-6',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    ],
  });

  console.log('Created audit logs');

  // ============== SUMMARY ==============
  console.log('\n' + '='.repeat(60));
  console.log('SEED COMPLETE - DATA SUMMARY');
  console.log('='.repeat(60));

  console.log('\n--- FIRMS ---');
  console.log('1. Demo CA Firm LLP (Professional Plan)');
  console.log('2. Elite Tax Advisors (Enterprise Plan)');

  console.log('\n--- USERS (All passwords: password123) ---');
  console.log('\nFirm 1: Demo CA Firm LLP');
  console.log('  1. admin@democafirm.com     - Rajesh Kumar (Admin)');
  console.log('  2. manager@democafirm.com   - Priya Sharma (Manager)');
  console.log('  3. associate@democafirm.com - Rahul Mehta (Associate)');
  console.log('\nFirm 2: Elite Tax Advisors');
  console.log('  4. admin@elitetax.com       - Vikram Singh (Admin)');
  console.log('  5. manager@elitetax.com     - Ananya Reddy (Manager)');

  console.log('\n--- CLIENTS (10 Total - Different Industries) ---');
  console.log('\nFirm 1 (6 clients):');
  console.log('  1. TechCorp India Pvt Ltd        - IT Services');
  console.log('  2. Pharma Solutions Ltd          - Pharmaceuticals');
  console.log('  3. Auto Parts Manufacturing      - Auto Ancillary');
  console.log('  4. Consumer Goods India Ltd      - FMCG');
  console.log('  5. GreenPower India Ltd          - Renewable Energy');
  console.log('  6. FastLogix India Pvt Ltd       - Logistics');
  console.log('\nFirm 2 (4 clients):');
  console.log('  7. Global Finance India Ltd      - Financial Services');
  console.log('  8. ShopEasy India Pvt Ltd        - E-commerce');
  console.log('  9. TeleCom Services India        - Telecommunications');
  console.log(' 10. MediCare Hospitals            - Healthcare');

  console.log('\n--- DATA ISOLATION TEST ---');
  console.log('Users from Firm 1 should ONLY see: TechCorp, Pharma, Auto Parts, Consumer Goods, GreenPower, FastLogix');
  console.log('Users from Firm 2 should ONLY see: Global Finance, ShopEasy, TeleCom, MediCare');

  console.log('\n--- ENGAGEMENT STATUSES ---');
  console.log('TechCorp:       BENCHMARKING (current), FILED (prior year)');
  console.log('Pharma:         SAFE_HARBOUR_CHECK');
  console.log('Auto Parts:     DATA_COLLECTION');
  console.log('Consumer Goods: BENCHMARKING');
  console.log('GreenPower:     SAFE_HARBOUR_CHECK');
  console.log('FastLogix:      APPROVED');
  console.log('Global Finance: DOCUMENTATION');
  console.log('ShopEasy:       REVIEW');
  console.log('TeleCom:        DOCUMENTATION');
  console.log('MediCare:       DATA_COLLECTION');

  console.log('\n--- FEATURES TO TEST ---');
  console.log('1. Dashboard - Shows clients, engagements, deadlines');
  console.log('2. Clients - Full CRUD with assigned users');
  console.log('3. Safe Harbour - Pre-calculated results for IT/ITeS, Loans');
  console.log('4. Benchmarking - Results with comparables');
  console.log('5. Disputes - Cases at TPO, DRP, ITAT stages');
  console.log('6. Documents - Various statuses (Draft, In Progress, Filed)');
  console.log('7. Team - User management per firm');

  console.log('\n--- WHERE TO VIEW COMPLETE CLIENT RECORDS ---');
  console.log('1. Go to: /dashboard/clients');
  console.log('2. Click on any client name to see full details');
  console.log('3. Client detail page shows:');
  console.log('   - Company Information (PAN, CIN, Industry, Contact)');
  console.log('   - Group Structure (Parent, Ultimate Parent)');
  console.log('   - Associated Enterprises');
  console.log('   - Engagements (all years)');
  console.log('   - International Transactions');
  console.log('   - Documents');
  console.log('   - Dispute Cases');
  console.log('4. OR use Prisma Studio: npx prisma studio');
  console.log('\n' + '='.repeat(60));
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
