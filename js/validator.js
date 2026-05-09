'use strict';

import { INTERCHANGE_CATEGORIES, ENTRY_MODE_LABELS } from './data/interchange-tables.js';
import { VALIDATOR_SCENARIOS } from './data/scenarios.js';
import { evaluateTransaction, formatCurrency, formatRate } from './utils.js';

export function initValidator() {
  const container = document.getElementById('validator-content');
  container.innerHTML = buildValidatorHTML();
  bindValidatorEvents();
}

function buildValidatorHTML() {
  return `
    <div class="scenario-buttons" aria-label="Load a pre-built scenario">
      ${VALIDATOR_SCENARIOS.map(s => `
        <button class="scenario-btn" data-scenario="${s.id}">${s.name}</button>
      `).join('')}
    </div>

    <div class="grid-2">
      <div class="card">
        <h3 style="font-size:14px;font-weight:600;margin-bottom:16px;">Transaction Details</h3>

        <div class="grid-2" style="gap:12px">
          <div class="form-group">
            <label for="v-amount">Amount ($)</label>
            <input type="number" class="form-input mono" id="v-amount" value="1000" min="0" step="0.01">
          </div>
          <div class="form-group">
            <label for="v-network">Network</label>
            <select class="form-select" id="v-network">
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
            </select>
          </div>
          <div class="form-group">
            <label for="v-card-type">Card Type</label>
            <select class="form-select" id="v-card-type">
              <option value="Consumer Credit">Consumer Credit</option>
              <option value="Commercial">Commercial</option>
              <option value="Purchasing">Purchasing</option>
              <option value="Regulated Debit">Regulated Debit</option>
              <option value="Non-Regulated Debit">Non-Regulated Debit</option>
            </select>
          </div>
          <div class="form-group">
            <label for="v-entry-mode">Entry Mode</label>
            <select class="form-select" id="v-entry-mode">
              ${Object.entries(ENTRY_MODE_LABELS).map(([val, label]) =>
                `<option value="${val}">${label}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="v-mcc">MCC Code</label>
            <input type="text" class="form-input mono" id="v-mcc" value="5311" placeholder="e.g. 5311">
          </div>
          <div class="form-group">
            <label for="v-auth-age">Auth Age (hours)</label>
            <input type="number" class="form-input mono" id="v-auth-age" value="4" min="0" max="168">
          </div>
        </div>

        <div class="grid-2" style="gap:12px;margin-top:4px">
          <div class="form-group">
            <label for="v-avs">AVS Result</label>
            <select class="form-select" id="v-avs">
              <option value="match">Full Match</option>
              <option value="partial">Partial Match</option>
              <option value="mismatch">Mismatch</option>
              <option value="none">Not Provided</option>
            </select>
          </div>
          <div class="form-group">
            <label for="v-cvv">CVV Result</label>
            <select class="form-select" id="v-cvv">
              <option value="match">Match</option>
              <option value="mismatch">Mismatch</option>
              <option value="none">Not Provided</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="v-initiation">Initiation Type</label>
          <select class="form-select" id="v-initiation">
            <option value="human">Human</option>
            <option value="agent">AI Agent</option>
          </select>
        </div>

        <div id="v-level2-section">
          <h4 style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.8px;margin:16px 0 8px">Level II Data</h4>
          <div class="grid-2" style="gap:12px">
            <div class="form-group">
              <label for="v-tax">Sales Tax ($)</label>
              <input type="number" class="form-input mono" id="v-tax" placeholder="0.00" min="0" step="0.01">
            </div>
            <div class="form-group">
              <label for="v-customer-code">Customer Code / PO</label>
              <input type="text" class="form-input" id="v-customer-code" placeholder="PO-2026-XXXX">
            </div>
          </div>
          <div class="form-group">
            <label for="v-postal">Merchant Postal Code</label>
            <input type="text" class="form-input" id="v-postal" placeholder="e.g. 60601">
          </div>
        </div>

        <div id="v-level3-section">
          <h4 style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.8px;margin:16px 0 8px">Level III Line Items</h4>
          <div class="data-table-wrapper">
            <table class="line-items-table" id="v-line-items-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>UOM</th>
                  <th>Commodity</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="v-line-items-body"></tbody>
            </table>
          </div>
          <button class="btn btn-sm mt-sm" id="v-add-line-item">+ Add Line Item</button>
        </div>

        <button class="btn btn-primary btn-lg mt-lg" id="v-validate-btn" style="width:100%">Validate Transaction</button>
      </div>

      <div>
        <div class="card" id="v-results-panel">
          <h3 style="font-size:14px;font-weight:600;margin-bottom:16px;">Validation Results</h3>
          <div id="v-results-content">
            <p style="color:var(--text-muted);font-size:13px">Enter transaction details and click Validate, or choose a scenario above.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="product-insight mt-lg">
      <p>Most merchants never see their field-level qualification results. Processor statements show aggregate categories but not why a specific transaction landed where it did. This validator reproduces the logic that networks apply at clearing time: entry mode, data completeness, settlement timing, and card product all factor into the final rate. A single missing field -- tax amount, customer code, or AVS -- can push a $5,000 B2B transaction from 2.10% to 2.95%: an $42.50 swing on one transaction.</p>
    </div>
  `;
}

function bindValidatorEvents() {
  // Scenario buttons
  document.querySelectorAll('[data-scenario]').forEach(btn => {
    btn.addEventListener('click', () => {
      const scenario = VALIDATOR_SCENARIOS.find(s => s.id === btn.dataset.scenario);
      if (scenario) {
        loadScenario(scenario);
        runValidation();
        // Update active state
        document.querySelectorAll('[data-scenario]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });

  // Validate button
  document.getElementById('v-validate-btn').addEventListener('click', runValidation);

  // Add line item
  document.getElementById('v-add-line-item').addEventListener('click', () => addLineItemRow());

  // Show/hide Level II/III based on card type
  document.getElementById('v-card-type').addEventListener('change', updateLevelVisibility);
  updateLevelVisibility();
}

function updateLevelVisibility() {
  const cardType = document.getElementById('v-card-type').value;
  const isCommercial = cardType === 'Commercial' || cardType === 'Purchasing';
  document.getElementById('v-level2-section').style.display = isCommercial ? '' : 'none';
  document.getElementById('v-level3-section').style.display = isCommercial ? '' : 'none';
}

function loadScenario(scenario) {
  const txn = scenario.transaction;
  document.getElementById('v-amount').value = txn.amount;
  document.getElementById('v-network').value = txn.network;
  document.getElementById('v-card-type').value = txn.cardType;
  document.getElementById('v-entry-mode').value = txn.entryMode;
  document.getElementById('v-mcc').value = txn.mcc;
  document.getElementById('v-auth-age').value = txn.authAge || 4;
  document.getElementById('v-avs').value = txn.avsResult || 'match';
  document.getElementById('v-cvv').value = txn.cvvResult || 'match';
  document.getElementById('v-initiation').value = txn.initiationType || 'human';

  // Level II
  document.getElementById('v-tax').value = txn.salesTax !== null && txn.salesTax !== undefined ? txn.salesTax : '';
  document.getElementById('v-customer-code').value = txn.customerCode || '';
  document.getElementById('v-postal').value = txn.merchantPostalCode || '';

  // Level III line items
  const tbody = document.getElementById('v-line-items-body');
  tbody.innerHTML = '';
  if (txn.lineItems && txn.lineItems.length > 0) {
    txn.lineItems.forEach(li => addLineItemRow(li));
  }

  updateLevelVisibility();
}

function addLineItemRow(data = {}) {
  const tbody = document.getElementById('v-line-items-body');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><input type="text" class="form-input" value="${data.sku || ''}" data-field="sku"></td>
    <td><input type="text" class="form-input" value="${data.description || ''}" data-field="description"></td>
    <td><input type="number" class="form-input" value="${data.quantity || ''}" min="0" data-field="quantity" style="width:60px"></td>
    <td><input type="number" class="form-input" value="${data.unitPrice || ''}" min="0" step="0.01" data-field="unitPrice" style="width:90px"></td>
    <td><input type="text" class="form-input" value="${data.unitOfMeasure || 'EA'}" data-field="unitOfMeasure" style="width:50px"></td>
    <td><input type="text" class="form-input" value="${data.commodityCode || ''}" data-field="commodityCode" style="width:90px"></td>
    <td><button class="remove-btn" aria-label="Remove line item">&times;</button></td>
  `;
  row.querySelector('.remove-btn').addEventListener('click', () => row.remove());
  tbody.appendChild(row);
}

function getTransactionFromForm() {
  const taxVal = document.getElementById('v-tax').value;
  const lineItems = [];
  document.querySelectorAll('#v-line-items-body tr').forEach(row => {
    const li = {};
    row.querySelectorAll('[data-field]').forEach(input => {
      const val = input.value;
      if (input.type === 'number') {
        li[input.dataset.field] = val ? parseFloat(val) : 0;
      } else {
        li[input.dataset.field] = val;
      }
    });
    if (li.description || li.sku) lineItems.push(li);
  });

  return {
    amount: parseFloat(document.getElementById('v-amount').value) || 0,
    network: document.getElementById('v-network').value,
    cardType: document.getElementById('v-card-type').value,
    entryMode: document.getElementById('v-entry-mode').value,
    mcc: document.getElementById('v-mcc').value,
    authAge: parseInt(document.getElementById('v-auth-age').value) || 0,
    avsResult: document.getElementById('v-avs').value,
    cvvResult: document.getElementById('v-cvv').value,
    initiationType: document.getElementById('v-initiation').value,
    salesTax: taxVal !== '' ? parseFloat(taxVal) : undefined,
    customerCode: document.getElementById('v-customer-code').value,
    merchantPostalCode: document.getElementById('v-postal').value,
    lineItems
  };
}

function runValidation() {
  const txn = getTransactionFromForm();
  const results = evaluateTransaction(txn, INTERCHANGE_CATEGORIES);
  renderResults(results, txn);
}

function renderResults(results, txn) {
  const container = document.getElementById('v-results-content');

  const passCount = results.fields.filter(f => f.status === 'pass').length;
  const warnCount = results.fields.filter(f => f.status === 'warn').length;
  const failCount = results.fields.filter(f => f.status === 'fail').length;

  const statusIcons = { pass: '\u2713', warn: '!', fail: '\u2717' };

  container.innerHTML = `
    <div class="flex-between mb-md">
      <div>
        <span class="badge badge-pass">${passCount} Pass</span>
        <span class="badge badge-warn" style="margin-left:4px">${warnCount} Warn</span>
        <span class="badge badge-fail" style="margin-left:4px">${failCount} Fail</span>
      </div>
    </div>

    ${results.bestCategory ? `
      <div class="card" style="background:var(--bg-secondary);margin-bottom:16px;padding:20px">
        <div class="flex-between">
          <div>
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px">Predicted Category</div>
            <div style="font-size:16px;font-weight:600">${results.bestCategory.name}</div>
            <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">${results.bestCategory.network} / ${results.bestCategory.cardType}</div>
          </div>
          <div class="text-right">
            <div class="rate-cell mono" style="font-size:18px">${formatRate(results.rate, results.perTxn)}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">on ${formatCurrency(txn.amount)}</div>
            <div class="mono" style="font-size:20px;font-weight:700;color:var(--accent-primary);margin-top:4px">${formatCurrency(results.cost)}</div>
          </div>
        </div>
      </div>
    ` : ''}

    <ul class="validation-list">
      ${results.fields.map(f => `
        <li class="validation-item">
          <div class="validation-icon ${f.status}">${statusIcons[f.status]}</div>
          <div>
            <div class="validation-field">${f.name}: <span class="mono" style="font-size:12px">${f.value}</span></div>
            ${f.detail ? `<div class="validation-detail">${f.detail}</div>` : ''}
          </div>
        </li>
      `).join('')}
    </ul>

    ${results.recommendations.length > 0 ? `
      <div style="margin-top:20px;padding:16px;background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.15);border-radius:var(--radius-sm)">
        <h4 style="font-size:12px;font-weight:600;color:var(--accent-primary);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px">Recommendations</h4>
        <ul style="list-style:none;font-size:12px;color:var(--text-secondary)">
          ${results.recommendations.map(r => `<li style="padding:3px 0;padding-left:14px;position:relative"><span style="position:absolute;left:0">&#8227;</span> ${r}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
  `;
}
