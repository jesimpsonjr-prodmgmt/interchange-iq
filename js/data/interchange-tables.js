// Visa and Mastercard interchange rate tables
// Based on April 2026 published rate schedules
// 50 categories covering consumer, commercial, regulated debit, and e-commerce

export const INTERCHANGE_CATEGORIES = [
  // ==================== VISA CONSUMER CREDIT ====================
  {
    id: 'visa-cps-retail',
    network: 'Visa',
    name: 'CPS/Retail',
    cardType: 'Consumer Credit',
    rate: 1.65,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip'],
    qualificationRules: [
      'Card-present transaction',
      'Single electronic authorization',
      'Authorization settled within 1 day',
      'Valid AVS response'
    ],
    downgradeTo: 'visa-eirf',
    cedpApplicable: false,
    description: 'Standard card-present consumer credit transactions at retail POS.'
  },
  {
    id: 'visa-cps-retail-preferred',
    network: 'Visa',
    name: 'CPS/Retail 2 - Preferred',
    cardType: 'Consumer Credit',
    rate: 1.54,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip'],
    qualificationRules: [
      'Card-present transaction',
      'Single electronic authorization',
      'Settled within 1 day',
      'Merchant registered as Preferred'
    ],
    downgradeTo: 'visa-cps-retail',
    cedpApplicable: false,
    description: 'Lower rate for high-volume preferred retail merchants.'
  },
  {
    id: 'visa-cps-ecommerce-basic',
    network: 'Visa',
    name: 'CPS/E-Commerce Basic',
    cardType: 'Consumer Credit',
    rate: 1.80,
    perTxn: 0.10,
    entryModes: ['ecommerce'],
    qualificationRules: [
      'Card-not-present e-commerce transaction',
      'AVS response provided',
      'CVV2 match',
      'Settled within 2 days of authorization',
      'Single authorization per transaction'
    ],
    downgradeTo: 'visa-standard',
    cedpApplicable: false,
    description: 'Base rate for e-commerce consumer credit with basic fraud data.'
  },
  {
    id: 'visa-cps-ecommerce-preferred',
    network: 'Visa',
    name: 'CPS/E-Commerce Preferred',
    cardType: 'Consumer Credit',
    rate: 1.75,
    perTxn: 0.10,
    entryModes: ['ecommerce'],
    qualificationRules: [
      'Card-not-present e-commerce transaction',
      'AVS full match',
      'CVV2 match',
      '3D Secure authentication',
      'Settled within 1 day of authorization'
    ],
    downgradeTo: 'visa-cps-ecommerce-basic',
    cedpApplicable: false,
    description: 'Lower e-commerce rate with 3D Secure and full AVS match.'
  },
  {
    id: 'visa-cps-card-not-present',
    network: 'Visa',
    name: 'CPS/Card Not Present',
    cardType: 'Consumer Credit',
    rate: 1.80,
    perTxn: 0.10,
    entryModes: ['keyed', 'ecommerce'],
    qualificationRules: [
      'Card-not-present or keyed entry',
      'AVS response provided',
      'Settled within 2 days'
    ],
    downgradeTo: 'visa-standard',
    cedpApplicable: false,
    description: 'MOTO and keyed-entry consumer credit transactions.'
  },
  {
    id: 'visa-cps-supermarket',
    network: 'Visa',
    name: 'CPS/Supermarket',
    cardType: 'Consumer Credit',
    rate: 1.22,
    perTxn: 0.05,
    entryModes: ['swiped', 'contactless', 'chip'],
    qualificationRules: [
      'MCC 5411 (Grocery Stores/Supermarkets)',
      'Card-present',
      'Settled within 1 day'
    ],
    downgradeTo: 'visa-cps-retail',
    cedpApplicable: false,
    description: 'Reduced rate for grocery/supermarket merchants.'
  },
  {
    id: 'visa-cps-restaurant',
    network: 'Visa',
    name: 'CPS/Restaurant',
    cardType: 'Consumer Credit',
    rate: 1.54,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip'],
    qualificationRules: [
      'MCC 5812 or 5814 (Eating Places/Fast Food)',
      'Card-present',
      'Settled within 1 day',
      'Tip adjustment within 20% of original auth'
    ],
    downgradeTo: 'visa-cps-retail',
    cedpApplicable: false,
    description: 'Specific rate for restaurant and food service merchants.'
  },
  {
    id: 'visa-cps-rewards-1',
    network: 'Visa',
    name: 'CPS/Rewards 1',
    cardType: 'Consumer Credit',
    rate: 1.95,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce'],
    qualificationRules: [
      'Visa Signature or Visa Infinite card',
      'Meets CPS/Retail or CPS/E-Commerce requirements'
    ],
    downgradeTo: 'visa-standard',
    cedpApplicable: false,
    description: 'Premium cards (Signature, Infinite) carry higher interchange to fund rewards programs.'
  },

  // ==================== VISA COMMERCIAL ====================
  {
    id: 'visa-commercial-level2',
    network: 'Visa',
    name: 'Commercial Level II',
    cardType: 'Commercial',
    rate: 2.50,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce', 'keyed'],
    qualificationRules: [
      'Commercial or purchasing card',
      'Sales tax amount included',
      'Customer code / PO number provided',
      'Merchant postal code provided',
      'Settled within 2 days'
    ],
    downgradeTo: 'visa-commercial-standard',
    cedpApplicable: true,
    description: 'B2B transactions with Level II data (tax, customer code). Common for corporate cards.'
  },
  {
    id: 'visa-commercial-level3',
    network: 'Visa',
    name: 'Commercial Level III',
    cardType: 'Commercial',
    rate: 2.10,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce', 'keyed'],
    qualificationRules: [
      'Commercial or purchasing card',
      'All Level II fields present',
      'Line-item detail: SKU, description, quantity, unit price, unit of measure',
      'Commodity code per line item',
      'Line item totals match transaction total',
      'Settled within 2 days'
    ],
    downgradeTo: 'visa-commercial-level2',
    cedpApplicable: true,
    description: 'Lowest commercial rate. Requires full line-item detail. Up to 40 bps savings over Level II.'
  },
  {
    id: 'visa-purchasing-level3',
    network: 'Visa',
    name: 'Purchasing Card Level III',
    cardType: 'Purchasing',
    rate: 1.90,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce', 'keyed'],
    qualificationRules: [
      'Visa Purchasing card (not standard commercial)',
      'All Level II fields',
      'Full line-item Level III detail',
      'Commodity codes must be valid (not placeholder)',
      'CEDP validation passing (April 2026+)',
      'Settled within 2 days'
    ],
    downgradeTo: 'visa-commercial-level2',
    cedpApplicable: true,
    description: 'Best rate for purchasing cards with complete Level III and CEDP compliance.'
  },
  {
    id: 'visa-commercial-te-level2',
    network: 'Visa',
    name: 'Commercial T&E Level II',
    cardType: 'Commercial',
    rate: 2.40,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce', 'keyed'],
    qualificationRules: [
      'Commercial card in T&E MCC (airlines, hotels, car rental)',
      'Folio/ticket number included',
      'Check-in and check-out dates (lodging)',
      'Sales tax amount',
      'Settled within 2 days'
    ],
    downgradeTo: 'visa-commercial-standard',
    cedpApplicable: true,
    description: 'Travel and entertainment on commercial cards with industry-specific data.'
  },
  {
    id: 'visa-commercial-standard',
    network: 'Visa',
    name: 'Commercial Standard',
    cardType: 'Commercial',
    rate: 2.95,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce', 'keyed'],
    qualificationRules: [
      'Commercial card transaction',
      'Does not meet Level II or Level III requirements'
    ],
    downgradeTo: 'visa-standard',
    cedpApplicable: false,
    description: 'Default rate when commercial card data requirements are not met. Most expensive tier.'
  },

  // ==================== VISA DOWNGRADE / FALLBACK ====================
  {
    id: 'visa-eirf',
    network: 'Visa',
    name: 'EIRF (Electronic Interchange Reimbursement Fee)',
    cardType: 'Consumer Credit',
    rate: 2.30,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce', 'keyed'],
    qualificationRules: [
      'Electronic authorization obtained',
      'Does not qualify for any CPS category',
      'Common causes: late settlement, missing AVS, partial auth issues'
    ],
    downgradeTo: 'visa-standard',
    cedpApplicable: false,
    description: 'First downgrade tier. Transaction was authorized electronically but missed CPS qualification.'
  },
  {
    id: 'visa-standard',
    network: 'Visa',
    name: 'Standard',
    cardType: 'Consumer Credit',
    rate: 2.70,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce', 'keyed'],
    qualificationRules: [
      'Catch-all category',
      'Transaction failed to qualify for CPS or EIRF',
      'Common causes: voice authorization, no electronic auth, extremely late settlement'
    ],
    downgradeTo: null,
    cedpApplicable: false,
    description: 'Worst-case Visa rate. No qualification requirements met. Over 100 bps more than CPS/Retail.'
  },

  // ==================== VISA REGULATED DEBIT ====================
  {
    id: 'visa-regulated-debit',
    network: 'Visa',
    name: 'Regulated Debit (Durbin)',
    cardType: 'Regulated Debit',
    rate: 0.05,
    perTxn: 0.21,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce', 'keyed'],
    qualificationRules: [
      'Debit card from bank with $10B+ assets',
      'Subject to Durbin Amendment rate cap',
      'Electronic authorization'
    ],
    downgradeTo: null,
    cedpApplicable: false,
    description: 'Durbin-regulated debit cap: 0.05% + $0.21. Applies to large bank issuers.'
  },
  {
    id: 'visa-exempt-debit',
    network: 'Visa',
    name: 'Non-Regulated Debit',
    cardType: 'Non-Regulated Debit',
    rate: 0.80,
    perTxn: 0.15,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce', 'keyed'],
    qualificationRules: [
      'Debit card from bank with under $10B assets',
      'Exempt from Durbin Amendment',
      'Electronic authorization'
    ],
    downgradeTo: null,
    cedpApplicable: false,
    description: 'Small-bank debit cards not subject to Durbin cap. Higher than regulated debit.'
  },
  {
    id: 'visa-debit-check-card',
    network: 'Visa',
    name: 'Check Card II',
    cardType: 'Non-Regulated Debit',
    rate: 1.05,
    perTxn: 0.15,
    entryModes: ['swiped', 'contactless', 'chip'],
    qualificationRules: [
      'Non-regulated debit card',
      'Card-present',
      'Signature-authenticated',
      'Settled within 2 days'
    ],
    downgradeTo: null,
    cedpApplicable: false,
    description: 'Signature debit at the POS. Higher rate than PIN debit due to signature network routing.'
  },

  // ==================== VISA SPECIAL ====================
  {
    id: 'visa-infinite',
    network: 'Visa',
    name: 'Visa Infinite',
    cardType: 'Consumer Credit',
    rate: 2.10,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce', 'keyed'],
    qualificationRules: [
      'Visa Infinite card product',
      'Meets CPS/Retail or CPS/E-Commerce base requirements'
    ],
    downgradeTo: 'visa-standard',
    cedpApplicable: false,
    description: 'Top-tier consumer card. Highest consumer interchange to fund premium benefits.'
  },
  {
    id: 'visa-business-enhanced',
    network: 'Visa',
    name: 'Business Enhanced',
    cardType: 'Commercial',
    rate: 2.20,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce', 'keyed'],
    qualificationRules: [
      'Visa Business Enhanced card',
      'Level II data provided (tax, customer code)',
      'Settled within 2 days'
    ],
    downgradeTo: 'visa-commercial-standard',
    cedpApplicable: true,
    description: 'Small business card with enhanced data. Sits between Level II and Level III rates.'
  },
  {
    id: 'visa-recurring',
    network: 'Visa',
    name: 'CPS/Recurring Payments',
    cardType: 'Consumer Credit',
    rate: 1.75,
    perTxn: 0.10,
    entryModes: ['ecommerce'],
    qualificationRules: [
      'Recurring/subscription billing indicator set',
      'Cardholder agreement on file',
      'Transaction identified as recurring',
      'Settled within 2 days'
    ],
    downgradeTo: 'visa-cps-card-not-present',
    cedpApplicable: false,
    description: 'Subscription and recurring billing transactions with proper recurring flags.'
  },

  // ==================== MASTERCARD CONSUMER CREDIT ====================
  {
    id: 'mc-core-merit1',
    network: 'Mastercard',
    name: 'Core / Merit I',
    cardType: 'Consumer Credit',
    rate: 1.58,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip'],
    qualificationRules: [
      'Card-present transaction',
      'Electronic authorization',
      'Settled within 1 day',
      'Single clearing record per authorization'
    ],
    downgradeTo: 'mc-merit3',
    cedpApplicable: false,
    description: 'Mastercard baseline card-present rate. Equivalent to Visa CPS/Retail.'
  },
  {
    id: 'mc-core-merit3',
    network: 'Mastercard',
    name: 'Core / Merit III',
    cardType: 'Consumer Credit',
    rate: 1.89,
    perTxn: 0.10,
    entryModes: ['ecommerce', 'keyed'],
    qualificationRules: [
      'Card-not-present transaction',
      'Electronic authorization',
      'Settled within 2 days',
      'AVS data provided'
    ],
    downgradeTo: 'mc-standard',
    cedpApplicable: false,
    description: 'Card-not-present consumer credit. Higher than Merit I to reflect CNP risk.'
  },
  {
    id: 'mc-enhanced-merit1',
    network: 'Mastercard',
    name: 'Enhanced / Merit I',
    cardType: 'Consumer Credit',
    rate: 1.73,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip'],
    qualificationRules: [
      'Enhanced Value card (World, World Elite)',
      'Card-present',
      'Electronic authorization',
      'Settled within 1 day'
    ],
    downgradeTo: 'mc-merit3',
    cedpApplicable: false,
    description: 'World and World Elite cards at POS. Higher rate funds premium rewards.'
  },
  {
    id: 'mc-world-elite',
    network: 'Mastercard',
    name: 'World Elite',
    cardType: 'Consumer Credit',
    rate: 2.10,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce', 'keyed'],
    qualificationRules: [
      'World Elite card product',
      'Meets Merit I or Merit III base requirements'
    ],
    downgradeTo: 'mc-standard',
    cedpApplicable: false,
    description: 'Top-tier Mastercard. Highest consumer interchange for premium card benefits.'
  },
  {
    id: 'mc-supermarket',
    network: 'Mastercard',
    name: 'Supermarket',
    cardType: 'Consumer Credit',
    rate: 1.28,
    perTxn: 0.05,
    entryModes: ['swiped', 'contactless', 'chip'],
    qualificationRules: [
      'MCC 5411 (Grocery/Supermarket)',
      'Card-present',
      'Settled within 1 day'
    ],
    downgradeTo: 'mc-core-merit1',
    cedpApplicable: false,
    description: 'Reduced rate for grocery merchants. Similar to Visa CPS/Supermarket.'
  },
  {
    id: 'mc-restaurant',
    network: 'Mastercard',
    name: 'Restaurant',
    cardType: 'Consumer Credit',
    rate: 1.48,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip'],
    qualificationRules: [
      'MCC 5812 or 5814 (Restaurant/Fast Food)',
      'Card-present',
      'Settled within 1 day'
    ],
    downgradeTo: 'mc-core-merit1',
    cedpApplicable: false,
    description: 'Specific restaurant category. Slightly lower than Visa equivalent.'
  },
  {
    id: 'mc-digital-commerce',
    network: 'Mastercard',
    name: 'Digital Commerce',
    cardType: 'Consumer Credit',
    rate: 1.78,
    perTxn: 0.10,
    entryModes: ['ecommerce'],
    qualificationRules: [
      'Secure e-commerce (3D Secure or tokenized)',
      'Digital wallet or device authentication',
      'AVS and CVC provided',
      'Settled within 2 days'
    ],
    downgradeTo: 'mc-core-merit3',
    cedpApplicable: false,
    description: 'Lower CNP rate for authenticated digital commerce (tokenized, 3DS).'
  },
  {
    id: 'mc-recurring',
    network: 'Mastercard',
    name: 'Recurring Payment',
    cardType: 'Consumer Credit',
    rate: 1.80,
    perTxn: 0.10,
    entryModes: ['ecommerce'],
    qualificationRules: [
      'Recurring payment indicator set',
      'Cardholder agreement on file',
      'Settled within 2 days'
    ],
    downgradeTo: 'mc-core-merit3',
    cedpApplicable: false,
    description: 'Subscription billing with proper recurring flags set.'
  },

  // ==================== MASTERCARD COMMERCIAL ====================
  {
    id: 'mc-commercial-data-rate1',
    network: 'Mastercard',
    name: 'Commercial Data Rate I (Level II)',
    cardType: 'Commercial',
    rate: 2.65,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce', 'keyed'],
    qualificationRules: [
      'Corporate or purchasing card',
      'Sales tax included',
      'Customer reference number',
      'Settled within 2 days'
    ],
    downgradeTo: 'mc-commercial-base',
    cedpApplicable: true,
    description: 'Mastercard Level II equivalent. Tax and customer reference required.'
  },
  {
    id: 'mc-commercial-data-rate2',
    network: 'Mastercard',
    name: 'Commercial Data Rate II (Level III)',
    cardType: 'Commercial',
    rate: 2.10,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce', 'keyed'],
    qualificationRules: [
      'Corporate or purchasing card',
      'All Data Rate I fields',
      'Line-item detail: description, quantity, unit price',
      'Unit of measure and commodity code per line',
      'Line items sum to transaction total',
      'Settled within 2 days'
    ],
    downgradeTo: 'mc-commercial-data-rate1',
    cedpApplicable: true,
    description: 'Full line-item detail on Mastercard commercial. Largest savings tier.'
  },
  {
    id: 'mc-large-ticket',
    network: 'Mastercard',
    name: 'Large Ticket',
    cardType: 'Commercial',
    rate: 1.00,
    perTxn: 40.00,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce', 'keyed'],
    qualificationRules: [
      'Transaction amount over $5,000',
      'Commercial or purchasing card',
      'Large ticket program registration',
      'Settled within 2 days'
    ],
    downgradeTo: 'mc-commercial-base',
    cedpApplicable: true,
    description: 'High-value B2B transactions. Low percentage but high per-transaction fee.'
  },
  {
    id: 'mc-commercial-te',
    network: 'Mastercard',
    name: 'Commercial T&E',
    cardType: 'Commercial',
    rate: 2.45,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce', 'keyed'],
    qualificationRules: [
      'T&E MCC (airlines, hotels, rental cars)',
      'Corporate card',
      'Folio/ticket number',
      'Departure/arrival or check-in/check-out dates'
    ],
    downgradeTo: 'mc-commercial-base',
    cedpApplicable: true,
    description: 'Travel and entertainment on corporate cards with industry-specific addenda.'
  },
  {
    id: 'mc-commercial-base',
    network: 'Mastercard',
    name: 'Commercial Base',
    cardType: 'Commercial',
    rate: 3.00,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce', 'keyed'],
    qualificationRules: [
      'Commercial card transaction',
      'Does not meet Data Rate I or II requirements'
    ],
    downgradeTo: 'mc-standard',
    cedpApplicable: false,
    description: 'Default commercial rate without enhanced data. Most expensive Mastercard commercial tier.'
  },

  // ==================== MASTERCARD DOWNGRADE / FALLBACK ====================
  {
    id: 'mc-merit3',
    network: 'Mastercard',
    name: 'Merit III',
    cardType: 'Consumer Credit',
    rate: 2.30,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce', 'keyed'],
    qualificationRules: [
      'Electronic authorization obtained',
      'Does not qualify for Merit I or specific category',
      'Common causes: late settlement, missing data'
    ],
    downgradeTo: 'mc-standard',
    cedpApplicable: false,
    description: 'First downgrade tier. Auth was electronic but settlement or data failed qualification.'
  },
  {
    id: 'mc-standard',
    network: 'Mastercard',
    name: 'Standard',
    cardType: 'Consumer Credit',
    rate: 2.70,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce', 'keyed'],
    qualificationRules: [
      'Catch-all category',
      'Failed all other qualification criteria'
    ],
    downgradeTo: null,
    cedpApplicable: false,
    description: 'Worst-case Mastercard rate. Over 110 bps more than Merit I.'
  },

  // ==================== MASTERCARD DEBIT ====================
  {
    id: 'mc-regulated-debit',
    network: 'Mastercard',
    name: 'Regulated Debit',
    cardType: 'Regulated Debit',
    rate: 0.05,
    perTxn: 0.21,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce', 'keyed'],
    qualificationRules: [
      'Debit card from bank with $10B+ assets',
      'Subject to Durbin Amendment rate cap',
      'Electronic authorization'
    ],
    downgradeTo: null,
    cedpApplicable: false,
    description: 'Durbin-regulated debit. Same cap as Visa: 0.05% + $0.21.'
  },
  {
    id: 'mc-exempt-debit',
    network: 'Mastercard',
    name: 'Non-Regulated Debit',
    cardType: 'Non-Regulated Debit',
    rate: 0.85,
    perTxn: 0.15,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce', 'keyed'],
    qualificationRules: [
      'Debit card from bank under $10B assets',
      'Exempt from Durbin',
      'Electronic authorization'
    ],
    downgradeTo: null,
    cedpApplicable: false,
    description: 'Small-issuer debit. Not subject to Durbin cap.'
  },
  {
    id: 'mc-debit-merit',
    network: 'Mastercard',
    name: 'Debit Merit I',
    cardType: 'Non-Regulated Debit',
    rate: 1.05,
    perTxn: 0.15,
    entryModes: ['swiped', 'contactless', 'chip'],
    qualificationRules: [
      'Non-regulated debit',
      'Card-present',
      'Settled within 1 day'
    ],
    downgradeTo: null,
    cedpApplicable: false,
    description: 'Card-present non-regulated debit with qualified settlement timing.'
  },

  // ==================== VISA ADDITIONAL ====================
  {
    id: 'visa-small-ticket',
    network: 'Visa',
    name: 'Small Ticket',
    cardType: 'Consumer Credit',
    rate: 1.65,
    perTxn: 0.04,
    entryModes: ['swiped', 'contactless', 'chip'],
    qualificationRules: [
      'Transaction amount $15 or less',
      'Card-present',
      'Merchant enrolled in small ticket program',
      'Settled within 1 day'
    ],
    downgradeTo: 'visa-cps-retail',
    cedpApplicable: false,
    description: 'Reduced per-transaction fee for small-value purchases. Same percentage as CPS/Retail.'
  },
  {
    id: 'visa-utility',
    network: 'Visa',
    name: 'Utility',
    cardType: 'Consumer Credit',
    rate: 1.45,
    perTxn: 0.10,
    entryModes: ['ecommerce', 'keyed'],
    qualificationRules: [
      'MCC 4900 (Utilities)',
      'Account number on file',
      'Settled within 2 days'
    ],
    downgradeTo: 'visa-cps-card-not-present',
    cedpApplicable: false,
    description: 'Lower rate for utility bill payments.'
  },
  {
    id: 'visa-healthcare',
    network: 'Visa',
    name: 'Healthcare',
    cardType: 'Consumer Credit',
    rate: 1.55,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce'],
    qualificationRules: [
      'MCC 8011-8099 (Healthcare)',
      'IIAS-verified (if FSA/HSA)',
      'Settled within 2 days'
    ],
    downgradeTo: 'visa-cps-retail',
    cedpApplicable: false,
    description: 'Healthcare industry-specific rate.'
  },
  {
    id: 'visa-fleet-level3',
    network: 'Visa',
    name: 'Fleet Level III',
    cardType: 'Commercial',
    rate: 1.90,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip'],
    qualificationRules: [
      'Visa Fleet card',
      'Fuel/vehicle service data fields',
      'Odometer reading',
      'Vehicle number',
      'Driver ID',
      'Level III line items'
    ],
    downgradeTo: 'visa-commercial-standard',
    cedpApplicable: true,
    description: 'Fleet card transactions with vehicle-specific and Level III data.'
  },
  {
    id: 'visa-large-ticket',
    network: 'Visa',
    name: 'Large Ticket',
    cardType: 'Commercial',
    rate: 1.00,
    perTxn: 35.00,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce', 'keyed'],
    qualificationRules: [
      'Transaction over $5,000',
      'Commercial card',
      'Enrolled in large ticket program',
      'Level II data minimum',
      'Settled within 2 days'
    ],
    downgradeTo: 'visa-commercial-level2',
    cedpApplicable: true,
    description: 'High-value B2B. Low percentage with high flat fee. Breaks even around $5,800.'
  },

  // ==================== MASTERCARD ADDITIONAL ====================
  {
    id: 'mc-small-ticket',
    network: 'Mastercard',
    name: 'Small Ticket',
    cardType: 'Consumer Credit',
    rate: 1.55,
    perTxn: 0.04,
    entryModes: ['swiped', 'contactless', 'chip'],
    qualificationRules: [
      'Transaction $15 or less',
      'Card-present',
      'Small ticket program enrolled',
      'Settled within 1 day'
    ],
    downgradeTo: 'mc-core-merit1',
    cedpApplicable: false,
    description: 'Reduced per-transaction fee for low-value Mastercard purchases.'
  },
  {
    id: 'mc-utility',
    network: 'Mastercard',
    name: 'Utility',
    cardType: 'Consumer Credit',
    rate: 1.40,
    perTxn: 0.10,
    entryModes: ['ecommerce', 'keyed'],
    qualificationRules: [
      'MCC 4900 (Utilities)',
      'Account on file',
      'Settled within 2 days'
    ],
    downgradeTo: 'mc-core-merit3',
    cedpApplicable: false,
    description: 'Utility bill payment category on Mastercard.'
  },
  {
    id: 'mc-healthcare',
    network: 'Mastercard',
    name: 'Healthcare',
    cardType: 'Consumer Credit',
    rate: 1.50,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip', 'ecommerce'],
    qualificationRules: [
      'MCC 8011-8099 (Healthcare)',
      'Settled within 2 days'
    ],
    downgradeTo: 'mc-core-merit1',
    cedpApplicable: false,
    description: 'Healthcare-specific rate on Mastercard.'
  },
  {
    id: 'mc-fleet',
    network: 'Mastercard',
    name: 'Fleet',
    cardType: 'Commercial',
    rate: 1.95,
    perTxn: 0.10,
    entryModes: ['swiped', 'contactless', 'chip'],
    qualificationRules: [
      'Mastercard Fleet card',
      'Fuel/vehicle data',
      'Driver ID or vehicle number',
      'Level III line items'
    ],
    downgradeTo: 'mc-commercial-base',
    cedpApplicable: true,
    description: 'Fleet card with vehicle-specific addenda and line-item detail.'
  }
];

// Helper: find a category by ID
export function getCategoryById(id) {
  return INTERCHANGE_CATEGORIES.find(c => c.id === id);
}

// Helper: get all categories for a network
export function getCategoriesByNetwork(network) {
  return INTERCHANGE_CATEGORIES.filter(c => c.network === network);
}

// Helper: get unique card types
export function getCardTypes() {
  return [...new Set(INTERCHANGE_CATEGORIES.map(c => c.cardType))];
}

// Helper: get unique entry modes across all categories
export function getEntryModes() {
  const modes = new Set();
  INTERCHANGE_CATEGORIES.forEach(c => c.entryModes.forEach(m => modes.add(m)));
  return [...modes];
}

// Helper: calculate interchange cost
export function calculateInterchangeCost(category, amount) {
  const percentageCost = (amount * category.rate) / 100;
  return percentageCost + category.perTxn;
}

// Entry mode display labels
export const ENTRY_MODE_LABELS = {
  swiped: 'Swiped / Mag Stripe',
  contactless: 'Contactless / NFC',
  chip: 'Chip / EMV',
  ecommerce: 'E-Commerce',
  keyed: 'Keyed / MOTO'
};
