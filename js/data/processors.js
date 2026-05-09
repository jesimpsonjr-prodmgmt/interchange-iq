'use strict';

// Simulated processor profiles for the Routing Comparison Calculator

export const PROCESSORS = [
  {
    id: 'processor-a',
    name: 'Processor A',
    subtitle: 'IC++ Pricing, Full Data Passthrough',
    pricingModel: 'IC++',
    description: 'Interchange-plus-plus pricing with full Level III data passthrough and CEDP support. Best for high-volume B2B merchants who can provide complete transaction data.',
    interchangePassthrough: 1.0,   // 100% passthrough (IC++)
    processorMarkup: 0.15,         // 15 bps markup
    perTxnFee: 0.10,
    networkFeeRate: 0.04,          // 4 bps network/assessment fees
    networkPerTxn: 0.02,
    monthlyFee: 50,
    supportsLevelIII: true,
    supportsCEDP: true,
    features: ['Full IC++ transparency', 'Level III passthrough', 'CEDP certified', 'Same-day settlement option']
  },
  {
    id: 'processor-b',
    name: 'Processor B',
    subtitle: 'Tiered Pricing, Limited Passthrough',
    pricingModel: 'Tiered',
    description: 'Tiered (qualified/mid-qualified/non-qualified) pricing with limited Level II support. Simpler for small merchants but obscures true interchange costs.',
    interchangePassthrough: 1.0,
    processorMarkup: 0.35,          // 35 bps markup (blended into tiers)
    perTxnFee: 0.15,
    networkFeeRate: 0.04,
    networkPerTxn: 0.02,
    monthlyFee: 25,
    supportsLevelIII: false,
    supportsCEDP: false,
    features: ['Simple tiered structure', 'Level II support only', 'No CEDP', 'Next-day settlement']
  },
  {
    id: 'ach-rtp',
    name: 'ACH / RTP Rail',
    subtitle: 'Bank-to-Bank Transfer',
    pricingModel: 'Flat',
    description: 'Direct bank transfer via ACH (1-2 days) or RTP (instant). No interchange. Best for large B2B invoices where card rewards and float are not priorities.',
    interchangePassthrough: 0,
    processorMarkup: 0,
    perTxnFee: 0.50,
    networkFeeRate: 0,
    networkPerTxn: 0,
    monthlyFee: 15,
    supportsLevelIII: false,
    supportsCEDP: false,
    isAlternativeRail: true,
    features: ['No interchange', 'Flat per-transaction fee', 'ACH: 1-2 day settlement', 'RTP: instant settlement', 'No card rewards or purchase controls']
  }
];

// Calculate total cost for a transaction on a given processor
export function calculateProcessorCost(processor, interchangeRate, interchangePerTxn, amount) {
  if (processor.isAlternativeRail) {
    return {
      interchange: 0,
      networkFees: 0,
      processorMarkup: 0,
      perTxnFees: processor.perTxnFee,
      total: processor.perTxnFee,
      breakdown: {
        interchange: 0,
        networkAssessment: 0,
        processorBps: 0,
        processorPerTxn: processor.perTxnFee,
        total: processor.perTxnFee
      }
    };
  }

  const interchange = (amount * interchangeRate / 100) + interchangePerTxn;
  const networkFees = (amount * processor.networkFeeRate / 100) + processor.networkPerTxn;
  const processorMarkup = (amount * processor.processorMarkup / 100) + processor.perTxnFee;
  const total = interchange + networkFees + processorMarkup;

  return {
    interchange,
    networkFees,
    processorMarkup,
    perTxnFees: processor.perTxnFee,
    total,
    breakdown: {
      interchange,
      networkAssessment: networkFees,
      processorBps: amount * processor.processorMarkup / 100,
      processorPerTxn: processor.perTxnFee,
      total
    }
  };
}
