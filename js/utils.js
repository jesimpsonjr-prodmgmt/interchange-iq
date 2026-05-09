'use strict';

import { INTERCHANGE_CATEGORIES } from './data/interchange-tables.js';

// ============ QUALIFICATION ENGINE ============

export function evaluateTransaction(txn, categories) {
  const results = {
    fields: [],
    bestCategory: null,
    rate: 0,
    perTxn: 0,
    cost: 0,
    recommendations: []
  };

  results.fields.push(validateField('Transaction Amount', txn.amount, txn.amount > 0, 'Amount must be greater than zero'));
  results.fields.push(validateField('Card Network', txn.network, !!txn.network, 'Select a card network'));
  results.fields.push(validateField('Card Type', txn.cardType, !!txn.cardType, 'Select a card type'));
  results.fields.push(validateField('Entry Mode', txn.entryMode, !!txn.entryMode, 'Select an entry mode'));
  results.fields.push(validateField('MCC Code', txn.mcc, !!txn.mcc, 'Provide a merchant category code'));

  // AVS
  if (txn.entryMode === 'ecommerce' || txn.entryMode === 'keyed') {
    const avsOk = txn.avsResult === 'match' || txn.avsResult === 'partial';
    results.fields.push(validateField('AVS Result', txn.avsResult,
      avsOk,
      avsOk ? null : 'AVS mismatch or not provided. Will downgrade most CNP transactions.',
      txn.avsResult === 'partial' ? 'warn' : null
    ));
  }

  // CVV
  if (txn.entryMode === 'ecommerce') {
    results.fields.push(validateField('CVV/CVC Result', txn.cvvResult,
      txn.cvvResult === 'match',
      txn.cvvResult !== 'match' ? 'CVV mismatch blocks CPS/E-Commerce qualification.' : null
    ));
  }

  // Authorization age
  const authAgeOk = txn.authAge !== undefined ? txn.authAge <= 48 : true;
  const authAgeWarn = txn.authAge !== undefined && txn.authAge > 24 && txn.authAge <= 48;
  results.fields.push(validateField('Authorization Age', txn.authAge !== undefined ? `${txn.authAge}h` : 'N/A',
    authAgeOk,
    !authAgeOk ? 'Authorization older than 48 hours. Will downgrade to EIRF or Standard.' : (authAgeWarn ? 'Over 24 hours. Risk of downgrade on some categories.' : null),
    authAgeWarn ? 'warn' : null
  ));

  // Level II fields (for commercial)
  if (txn.cardType === 'Commercial' || txn.cardType === 'Purchasing') {
    const hasTax = txn.salesTax !== undefined && txn.salesTax !== null;
    const hasCustomerCode = !!txn.customerCode;
    const hasPostalCode = !!txn.merchantPostalCode;

    results.fields.push(validateField('Sales Tax', hasTax ? `$${txn.salesTax}` : 'Missing',
      hasTax, !hasTax ? 'Sales tax required for Level II qualification. Without it, defaults to Commercial Standard.' : null));
    results.fields.push(validateField('Customer Code / PO', hasCustomerCode ? txn.customerCode : 'Missing',
      hasCustomerCode, !hasCustomerCode ? 'Customer code or PO number required for Level II.' : null));
    results.fields.push(validateField('Merchant Postal Code', hasPostalCode ? txn.merchantPostalCode : 'Missing',
      hasPostalCode, !hasPostalCode ? 'Merchant postal code required for Level II.' : null));

    // Level III fields
    const hasLineItems = txn.lineItems && txn.lineItems.length > 0;
    const lineItemsComplete = hasLineItems && txn.lineItems.every(li =>
      li.description && li.quantity > 0 && li.unitPrice > 0 && li.commodityCode
    );

    results.fields.push(validateField('Level III Line Items', hasLineItems ? `${txn.lineItems.length} items` : 'Missing',
      hasLineItems,
      !hasLineItems ? 'Line items needed for Level III rate. Missing them costs 40+ bps.' : null,
      hasLineItems && !lineItemsComplete ? 'warn' : null
    ));

    if (hasLineItems && !lineItemsComplete) {
      results.fields.push(validateField('Line Item Completeness', 'Incomplete',
        false,
        'Each line item needs: description, quantity, unit price, commodity code. Incomplete items may fail CEDP audit.',
        'warn'
      ));
    }
  }

  // Initiation type
  if (txn.initiationType === 'agent') {
    results.fields.push(validateField('Initiation Type', 'AI Agent',
      true,
      'Agent-initiated transactions may lack AVS/CVV or skip Level III data. Check Visa Agentic Ready requirements.',
      'warn'
    ));
  }

  // Find best qualifying category
  const matchingCategories = categories.filter(cat => {
    if (txn.network && cat.network !== txn.network) return false;
    if (txn.entryMode && !cat.entryModes.includes(txn.entryMode)) return false;
    if (txn.cardType) {
      if (txn.cardType === 'Consumer Credit' && cat.cardType !== 'Consumer Credit') return false;
      if (txn.cardType === 'Commercial' && cat.cardType !== 'Commercial') return false;
      if (txn.cardType === 'Purchasing' && cat.cardType !== 'Purchasing' && cat.cardType !== 'Commercial') return false;
      if (txn.cardType === 'Regulated Debit' && cat.cardType !== 'Regulated Debit') return false;
      if (txn.cardType === 'Non-Regulated Debit' && cat.cardType !== 'Non-Regulated Debit') return false;
    }
    return true;
  });

  let bestScore = -1;
  for (const cat of matchingCategories) {
    let score = 0;
    const failCount = results.fields.filter(f => f.status === 'fail').length;
    const warnCount = results.fields.filter(f => f.status === 'warn').length;

    score = 100 - (failCount * 30) - (warnCount * 10);

    if (score > 50) {
      if (cat.id.includes('level3') || cat.id.includes('data-rate2')) {
        if (txn.lineItems && txn.lineItems.length > 0 && txn.salesTax !== undefined && txn.customerCode) {
          score += 20;
        } else {
          score -= 50;
        }
      } else if (cat.id.includes('level2') || cat.id.includes('data-rate1')) {
        if (txn.salesTax !== undefined && txn.customerCode) {
          score += 10;
        } else {
          score -= 30;
        }
      }

      if (txn.authAge > 48) score -= 40;
      else if (txn.authAge > 24) score -= 15;

      if (cat.id.includes('ecommerce') || cat.id.includes('digital')) {
        if (txn.avsResult === 'match' && txn.cvvResult === 'match') score += 10;
        else if (txn.avsResult !== 'match' || txn.cvvResult !== 'match') score -= 20;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      results.bestCategory = cat;
    }
  }

  // Fallback to standard/EIRF if score is too low
  if (bestScore < 40 && results.bestCategory) {
    const downgradePath = getDowngradePath(results.bestCategory, categories);
    if (downgradePath.length > 1) {
      results.bestCategory = downgradePath[downgradePath.length - 1];
    }
  }

  if (results.bestCategory) {
    results.rate = results.bestCategory.rate;
    results.perTxn = results.bestCategory.perTxn;
    results.cost = (txn.amount * results.rate / 100) + results.perTxn;
  }

  const failures = results.fields.filter(f => f.status === 'fail');
  const warnings = results.fields.filter(f => f.status === 'warn');
  failures.forEach(f => { if (f.detail) results.recommendations.push(f.detail); });
  warnings.forEach(f => { if (f.detail) results.recommendations.push(f.detail); });

  return results;
}

function validateField(name, value, passes, detail, overrideStatus) {
  let status = passes ? 'pass' : 'fail';
  if (overrideStatus) status = overrideStatus;
  return { name, value: value || 'N/A', status, detail: detail || null };
}

export function getDowngradePath(category, categories) {
  const path = [category];
  let current = category;
  const seen = new Set([current.id]);

  while (current.downgradeTo) {
    const next = categories.find(c => c.id === current.downgradeTo);
    if (!next || seen.has(next.id)) break;
    seen.add(next.id);
    path.push(next);
    current = next;
  }

  return path;
}

// ============ FORMAT HELPERS ============

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatRate(rate, perTxn) {
  return `${rate.toFixed(2)}% + $${perTxn.toFixed(2)}`;
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}
