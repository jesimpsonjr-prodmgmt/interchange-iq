'use strict';

// Pre-built transaction scenarios for all 6 tools

export const VALIDATOR_SCENARIOS = [
  {
    id: 'perfect-b2b',
    name: 'Perfect B2B Transaction',
    description: 'Fully qualified Level III commercial card purchase',
    transaction: {
      amount: 12500,
      network: 'Visa',
      cardType: 'Commercial',
      entryMode: 'ecommerce',
      mcc: '5045',
      avsResult: 'match',
      cvvResult: 'match',
      authAge: 4,
      salesTax: 937.50,
      customerCode: 'PO-2026-04418',
      merchantPostalCode: '60601',
      initiationType: 'human',
      lineItems: [
        { sku: 'MBP-16-M4', description: 'MacBook Pro 16" M4 Max', quantity: 5, unitPrice: 2199.00, unitOfMeasure: 'EA', commodityCode: '43211503' },
        { sku: 'APP-3YR', description: 'AppleCare+ 3-Year Coverage', quantity: 5, unitPrice: 299.00, unitOfMeasure: 'EA', commodityCode: '81112200' }
      ]
    }
  },
  {
    id: 'missing-level3',
    name: 'Missing Level III',
    description: 'Commercial card with Level II data but no line items',
    transaction: {
      amount: 8750,
      network: 'Visa',
      cardType: 'Commercial',
      entryMode: 'ecommerce',
      mcc: '5045',
      avsResult: 'match',
      cvvResult: 'match',
      authAge: 6,
      salesTax: 656.25,
      customerCode: 'PO-2026-03991',
      merchantPostalCode: '60601',
      initiationType: 'human',
      lineItems: []
    }
  },
  {
    id: 'stale-auth',
    name: 'Stale Authorization',
    description: 'Consumer credit settled 3 days after authorization',
    transaction: {
      amount: 249.99,
      network: 'Visa',
      cardType: 'Consumer Credit',
      entryMode: 'ecommerce',
      mcc: '5311',
      avsResult: 'match',
      cvvResult: 'match',
      authAge: 72,
      initiationType: 'human',
      lineItems: []
    }
  },
  {
    id: 'emv-retail',
    name: 'EMV Chip at POS',
    description: 'Consumer credit card dipped at a retail terminal',
    transaction: {
      amount: 87.42,
      network: 'Visa',
      cardType: 'Consumer Credit',
      entryMode: 'chip',
      mcc: '5311',
      avsResult: 'match',
      cvvResult: 'match',
      authAge: 2,
      initiationType: 'human',
      lineItems: []
    }
  },
  {
    id: 'contactless-restaurant',
    name: 'Contactless at Restaurant',
    description: 'Tap-to-pay at a quick-service restaurant with tip',
    transaction: {
      amount: 34.50,
      network: 'Mastercard',
      cardType: 'Consumer Credit',
      entryMode: 'contactless',
      mcc: '5814',
      avsResult: 'match',
      cvvResult: 'match',
      authAge: 1,
      initiationType: 'human',
      lineItems: []
    }
  },
  {
    id: 'agent-purchase',
    name: 'Agent-Initiated Purchase',
    description: 'AI purchasing agent buys office supplies on corporate card',
    transaction: {
      amount: 4200,
      network: 'Visa',
      cardType: 'Commercial',
      entryMode: 'ecommerce',
      mcc: '5943',
      avsResult: 'none',
      cvvResult: 'none',
      authAge: 2,
      salesTax: null,
      customerCode: '',
      merchantPostalCode: '',
      initiationType: 'agent',
      lineItems: []
    }
  }
];

export const DOWNGRADE_SCENARIOS = [
  {
    id: 'firmware-update',
    name: 'The ERP Integration Story',
    description: 'An ERP payment module update stopped sending sales tax on commercial cards',
    narrative: [
      'Your merchant processes $2M monthly in B2B transactions on commercial cards at Level III rates.',
      'On March 15, the ERP vendor pushes a payment module update. A bug in the update drops the sales tax field from authorization messages.',
      'Transactions start falling from Commercial Level III ($2.10% + $0.10) to Commercial Standard ($2.95% + $0.10).',
      'Over 30 days, 6,200 transactions worth $1.8M downgrade. The monthly interchange increase: $15,300.',
      'The root cause was one missing field in an ERP-to-gateway integration. It took 18 days to identify because the processor statement has a 45-day lag.'
    ],
    transaction: {
      amount: 5000,
      network: 'Visa',
      cardType: 'Commercial',
      entryMode: 'swiped',
      mcc: '5045',
      avsResult: 'match',
      cvvResult: 'match',
      authAge: 4,
      salesTax: 375.00,
      customerCode: 'PO-2026-05512',
      merchantPostalCode: '30301',
      lineItems: [
        { sku: 'TONER-BK', description: 'HP LaserJet Toner Black', quantity: 20, unitPrice: 89.99, unitOfMeasure: 'EA', commodityCode: '44103103' },
        { sku: 'TONER-CL', description: 'HP LaserJet Toner Color 3-Pack', quantity: 10, unitPrice: 219.99, unitOfMeasure: 'EA', commodityCode: '44103103' }
      ]
    },
    toggleSequence: ['salesTax', 'lineItems', 'customerCode']
  }
];

export const ROUTING_SCENARIOS = [
  {
    id: 'b2b-invoice',
    name: '$25,000 B2B Invoice',
    description: 'Compare commercial card vs. ACH for a large B2B payment',
    transaction: {
      amount: 25000,
      network: 'Visa',
      cardType: 'Commercial',
      entryMode: 'ecommerce',
      mcc: '5045',
      salesTax: 1875.00,
      customerCode: 'INV-2026-0892',
      merchantPostalCode: '10001',
      lineItems: [
        { sku: 'SRV-CONSULT', description: 'IT Consulting Services - April', quantity: 200, unitPrice: 125.00, unitOfMeasure: 'HR', commodityCode: '81111800' }
      ]
    }
  },
  {
    id: 'retail-consumer',
    name: '$150 Retail Purchase',
    description: 'Standard consumer credit card at POS',
    transaction: {
      amount: 150,
      network: 'Visa',
      cardType: 'Consumer Credit',
      entryMode: 'chip',
      mcc: '5311',
      salesTax: 11.25,
      merchantPostalCode: '90210'
    }
  },
  {
    id: 'grocery-contactless',
    name: '$62 Grocery (Contactless)',
    description: 'Tap-to-pay at a supermarket',
    transaction: {
      amount: 62.18,
      network: 'Visa',
      cardType: 'Consumer Credit',
      entryMode: 'contactless',
      mcc: '5411',
      salesTax: 0,
      merchantPostalCode: '60614'
    }
  },
  {
    id: 'recurring-sub',
    name: '$49.99 Monthly Subscription',
    description: 'Recurring SaaS billing',
    transaction: {
      amount: 49.99,
      network: 'Mastercard',
      cardType: 'Consumer Credit',
      entryMode: 'ecommerce',
      mcc: '5818',
      avsResult: 'match',
      cvvResult: 'match',
      isRecurring: true
    }
  }
];

export const CEDP_SCENARIOS = {
  passing: {
    name: 'CEDP Pass: Real Line Items',
    lineItems: [
      { sku: 'DL-XPS15', description: 'Dell XPS 15 Laptop 32GB RAM', quantity: 3, unitPrice: 1899.99, unitOfMeasure: 'EA', commodityCode: '43211503', extendedAmount: 5699.97 },
      { sku: 'DL-DOCK', description: 'Dell WD22TB4 Thunderbolt Dock', quantity: 3, unitPrice: 289.99, unitOfMeasure: 'EA', commodityCode: '43211708', extendedAmount: 869.97 },
      { sku: 'DL-MON27', description: 'Dell U2723QE 27" 4K Monitor', quantity: 6, unitPrice: 519.99, unitOfMeasure: 'EA', commodityCode: '43211902', extendedAmount: 3119.94 }
    ],
    salesTax: 726.74,
    totalAmount: 10416.62
  },
  failing: {
    name: 'CEDP Fail: Templated Data',
    lineItems: [
      { sku: '001', description: 'MISC MERCHANDISE', quantity: 1, unitPrice: 9689.88, unitOfMeasure: 'EA', commodityCode: '00000000', extendedAmount: 9689.88 },
      { sku: '002', description: 'TAX', quantity: 1, unitPrice: 726.74, unitOfMeasure: 'EA', commodityCode: '00000000', extendedAmount: 726.74 }
    ],
    salesTax: 0,
    totalAmount: 10416.62
  }
};

export const AGENTIC_SCENARIOS = [
  {
    id: 'office-supplies',
    name: 'Office Supplies Procurement',
    description: 'AI agent orders $10,000 in office supplies on a corporate purchasing card',
    transaction: {
      amount: 10000,
      network: 'Visa',
      cardType: 'Purchasing',
      entryMode: 'ecommerce',
      mcc: '5943'
    },
    humanBehavior: {
      avsResult: 'match',
      cvvResult: 'match',
      salesTax: 750.00,
      customerCode: 'PO-2026-08821',
      merchantPostalCode: '30301',
      lineItems: [
        { sku: 'PPR-LTR', description: 'Copy Paper Letter 10-Ream Case', quantity: 50, unitPrice: 42.99, unitOfMeasure: 'CS', commodityCode: '14111514' },
        { sku: 'PEN-BLK', description: 'Pilot G2 Gel Pen Black 12-Pack', quantity: 20, unitPrice: 14.99, unitOfMeasure: 'PK', commodityCode: '44121706' },
        { sku: 'BINDER-3', description: '3-Ring Binder 2" White', quantity: 100, unitPrice: 5.49, unitOfMeasure: 'EA', commodityCode: '44122003' },
        { sku: 'LABELS', description: 'Avery Shipping Labels 2x4" 1000ct', quantity: 10, unitPrice: 34.99, unitOfMeasure: 'BX', commodityCode: '44102402' }
      ],
      authAge: 2
    },
    agentDefaults: {
      omitsAvs: true,
      skipsCvv: true,
      skipsLevelIII: true,
      skipsLevelII: false,
      delaysSettlement: false,
      incorrectMcc: false
    }
  },
  {
    id: 'saas-renewal',
    name: 'SaaS License Renewal',
    description: 'AI agent auto-renews enterprise software licenses',
    transaction: {
      amount: 48000,
      network: 'Visa',
      cardType: 'Commercial',
      entryMode: 'ecommerce',
      mcc: '5818'
    },
    humanBehavior: {
      avsResult: 'match',
      cvvResult: 'match',
      salesTax: 3600.00,
      customerCode: 'REN-2026-ANNUAL',
      merchantPostalCode: '94105',
      lineItems: [
        { sku: 'LIC-ENT-500', description: 'Enterprise License 500 seats', quantity: 1, unitPrice: 48000.00, unitOfMeasure: 'EA', commodityCode: '43232701' }
      ],
      authAge: 1
    },
    agentDefaults: {
      omitsAvs: false,
      skipsCvv: false,
      skipsLevelIII: true,
      skipsLevelII: true,
      delaysSettlement: true,
      incorrectMcc: true
    }
  },
  {
    id: 'travel-booking',
    name: 'Corporate Travel Booking',
    description: 'AI travel agent books flights and hotel for a team of 4',
    transaction: {
      amount: 8400,
      network: 'Mastercard',
      cardType: 'Commercial',
      entryMode: 'ecommerce',
      mcc: '4722'
    },
    humanBehavior: {
      avsResult: 'match',
      cvvResult: 'match',
      salesTax: 630.00,
      customerCode: 'TRAVEL-Q2-2026',
      merchantPostalCode: '33139',
      lineItems: [
        { sku: 'FLT-ORD-MIA', description: 'Round-trip ORD to MIA x4 pax', quantity: 4, unitPrice: 489.00, unitOfMeasure: 'EA', commodityCode: '78111502' },
        { sku: 'HTL-MIA-4N', description: 'Hotel 4 nights double occupancy x2', quantity: 2, unitPrice: 1240.00, unitOfMeasure: 'EA', commodityCode: '90121502' },
        { sku: 'CAR-MIA-4D', description: 'Mid-size rental car 4 days', quantity: 1, unitPrice: 296.00, unitOfMeasure: 'EA', commodityCode: '78111801' }
      ],
      authAge: 1
    },
    agentDefaults: {
      omitsAvs: true,
      skipsCvv: true,
      skipsLevelIII: false,
      skipsLevelII: false,
      delaysSettlement: true,
      incorrectMcc: false
    }
  },
  {
    id: 'consumer-personal-shopper',
    name: 'AI Personal Shopper (B2C)',
    description: 'AI agent buys clothing on a consumer credit card via e-commerce',
    transaction: {
      amount: 284.97,
      network: 'Visa',
      cardType: 'Consumer Credit',
      entryMode: 'ecommerce',
      mcc: '5651'
    },
    humanBehavior: {
      avsResult: 'match',
      cvvResult: 'match',
      salesTax: 21.37,
      customerCode: '',
      merchantPostalCode: '10001',
      lineItems: [],
      authAge: 1
    },
    agentDefaults: {
      omitsAvs: true,
      skipsCvv: true,
      skipsLevelIII: false,
      skipsLevelII: false,
      delaysSettlement: false,
      incorrectMcc: true
    }
  }
];

// ============ GUIDED TOUR STEPS ============

export const TOUR_STEPS = [
  {
    tab: null,
    target: '#hero',
    title: 'Welcome to InterchangeIQ',
    body: 'This demo shows six tools for optimizing interchange fees. Every card transaction pays interchange to the issuing bank. The rate you pay depends on data quality, card type, and how you process the transaction. Let me walk you through each tool.'
  },
  {
    tab: 'validator',
    target: '#section-validator .section-header',
    title: 'Transaction Validator',
    body: 'The validator checks every field of a transaction against interchange qualification rules. It predicts which category you will land in and what rate you will pay.'
  },
  {
    tab: 'validator',
    target: '.scenario-buttons',
    title: 'Try a Scenario',
    body: 'Click "Perfect B2B Transaction" to see a fully qualified Level III commercial card purchase. Every field passes, and you get the lowest possible rate.',
    action: () => {
      const btn = document.querySelector('[data-scenario="perfect-b2b"]');
      if (btn) btn.click();
    }
  },
  {
    tab: 'validator',
    target: '.scenario-buttons',
    title: 'Now Break It',
    body: 'Click "Missing Level III" to see what happens when line items are missing. Same card, same amount, but the rate jumps 40+ basis points because Visa cannot verify the purchase details.',
    action: () => {
      const btn = document.querySelector('[data-scenario="missing-level3"]');
      if (btn) btn.click();
    }
  },
  {
    tab: 'validator',
    target: '.scenario-buttons',
    title: 'B2C at the POS',
    body: 'Interchange optimization is not just B2B. Try "EMV Chip at POS" or "Contactless at Restaurant" to see how card-present consumer transactions qualify. Entry mode, MCC, and settlement timing all affect the rate, even on a $35 dinner.',
    action: () => {
      const btn = document.querySelector('[data-scenario="emv-retail"]');
      if (btn) btn.click();
    }
  },
  {
    tab: 'downgrade',
    target: '#section-downgrade .section-header',
    title: 'Downgrade Simulator',
    body: 'Downgrades happen when a transaction fails to meet qualification requirements. This tool shows the cost cascade as you remove data fields from a qualified transaction.'
  },
  {
    tab: 'downgrade',
    target: '#downgrade-content',
    title: 'Watch the Waterfall',
    body: 'Toggle off the sales tax field. Watch the transaction fall from Level III to Level II, then to Commercial Standard. Each step costs more. This is the waterfall effect that makes interchange optimization so valuable.'
  },
  {
    tab: 'downgrade',
    target: '#downgrade-content',
    title: 'The ERP Integration Story',
    body: 'Click "Tell me a story" to see a real-world downgrade scenario: an ERP payment module update that silently dropped a field and cost a merchant $15,300 per month in excess interchange.'
  },
  {
    tab: 'routing',
    target: '#section-routing .section-header',
    title: 'Routing Comparison',
    body: 'Same transaction, different rails. This tool compares total cost across processors and payment methods. IC++ vs. tiered pricing, cards vs. ACH, all broken down to the penny.'
  },
  {
    tab: 'routing',
    target: '#routing-content',
    title: 'B2B Invoice Comparison',
    body: 'A $25,000 B2B invoice is the perfect test case. Commercial card interchange can exceed $500, while ACH costs under $1. But cards offer float, rebates, and purchase controls that ACH cannot match. The right answer depends on the business.',
    action: () => {
      const btn = document.querySelector('[data-routing-scenario="b2b-invoice"]');
      if (btn) btn.click();
    }
  },
  {
    tab: 'cedp',
    target: '#section-cedp .section-header',
    title: 'CEDP Readiness',
    body: 'Visa launched its Commercial Enhanced Data Program in April 2026. CEDP uses AI to audit Level III line items. Templated or placeholder data that used to pass manual checks will now trigger downgrades.'
  },
  {
    tab: 'cedp',
    target: '#cedp-content',
    title: 'Pass vs. Fail',
    body: 'Compare two transactions with the same total. One has real product descriptions and valid commodity codes. The other uses "MISC MERCHANDISE" and placeholder codes. Under CEDP, the second one fails and downgrades to Commercial Standard.',
  },
  {
    tab: 'lookup',
    target: '#section-lookup .section-header',
    title: 'Rate Lookup',
    body: 'A reference table of 50 Visa and Mastercard interchange categories. Filter by network, card type, or entry mode. Expand any row to see qualification requirements and downgrade paths.'
  },
  {
    tab: 'lookup',
    target: '#lookup-table',
    title: 'Find the Spread',
    body: 'Sort by rate to see the full range. Regulated debit (0.05% + $0.21) to downgraded commercial (3.00% + $0.10). On a $10,000 transaction, that is the difference between $5.21 and $300.10. Understanding this spread is the foundation of interchange optimization.'
  },
  {
    tab: 'agentic',
    target: '#section-agentic .section-header',
    title: 'Agentic Commerce',
    body: 'AI agents are starting to initiate purchases autonomously. But most agent frameworks skip the data fields that keep interchange costs low. This tool quantifies the risk.'
  },
  {
    tab: 'agentic',
    target: '#agentic-content',
    title: 'Human vs. Agent',
    body: 'Compare a human buyer to an AI agent buying the same $10,000 in office supplies. The agent skips AVS, omits Level III data, and costs the merchant an extra $85 per transaction in interchange.',
    action: () => {
      const btn = document.querySelector('[data-agentic-scenario="office-supplies"]');
      if (btn) btn.click();
    }
  },
  {
    tab: 'agentic',
    target: '#agentic-content',
    title: 'Guardrails Matter',
    body: 'The recommendation is not "do not use AI agents." It is "build interchange-aware guardrails." Require AVS data, pass Level III line items, and settle within 24 hours. Visa\'s Agentic Ready program will formalize this in late 2026.'
  },
  {
    tab: null,
    target: '#hero',
    title: 'Tour Complete',
    body: 'You have seen all six tools. Each one addresses a different dimension of interchange optimization: data quality, qualification tiers, processor selection, compliance, rate awareness, and emerging transaction types. Explore any tool on your own, or reach out to discuss how these concepts apply to your payments stack.'
  }
];
