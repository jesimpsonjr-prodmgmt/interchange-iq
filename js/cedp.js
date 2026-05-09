'use strict';

import { CEDP_SCENARIOS } from './data/scenarios.js';
import { formatCurrency } from './utils.js';

export function initCedp() {
  const container = document.getElementById('cedp-content');
  container.innerHTML = buildCedpHTML();
  bindCedpEvents();
  renderCedpComparison();
}

function buildCedpHTML() {
  return `
    <div class="grid-2">
      <div class="card">
        <h3 style="font-size:14px;font-weight:600;margin-bottom:4px">Line Item Editor</h3>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:16px">Edit line items to see how data quality affects CEDP compliance.</p>

        <div class="data-table-wrapper">
          <table class="line-items-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>UOM</th>
                <th>Commodity Code</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="cedp-line-items"></tbody>
          </table>
        </div>
        <button class="btn btn-sm mt-sm" id="cedp-add-item">+ Add Line Item</button>

        <div class="mt-lg">
          <h4 style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px">Data Quality Checks</h4>
          <div class="toggle-wrap">
            <span class="toggle-label">Descriptions are specific (not generic/templated)</span>
            <label class="toggle">
              <input type="checkbox" checked id="cedp-specific-desc">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="toggle-wrap">
            <span class="toggle-label">Commodity codes are valid UNSPSC</span>
            <label class="toggle">
              <input type="checkbox" checked id="cedp-valid-codes">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="toggle-wrap">
            <span class="toggle-label">No zero-value line items</span>
            <label class="toggle">
              <input type="checkbox" checked id="cedp-no-zero">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="toggle-wrap">
            <span class="toggle-label">Line item totals match transaction total</span>
            <label class="toggle">
              <input type="checkbox" checked id="cedp-totals-match">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <button class="btn btn-primary mt-lg" id="cedp-evaluate-btn" style="width:100%">Evaluate CEDP Readiness</button>
      </div>

      <div>
        <div class="card" id="cedp-results">
          <h3 style="font-size:14px;font-weight:600;margin-bottom:16px">CEDP Compliance Score</h3>
          <div id="cedp-score-display" class="text-center">
            <p style="color:var(--text-muted);font-size:13px">Load a scenario or enter line items and click Evaluate.</p>
          </div>
        </div>

        <div class="card mt-md" id="cedp-verified-merchant">
          <h3 style="font-size:14px;font-weight:600;margin-bottom:12px">Verified Merchant Progress</h3>
          <div id="cedp-merchant-progress"></div>
        </div>
      </div>
    </div>

    <div class="mt-lg">
      <h3 style="font-size:16px;font-weight:600;margin-bottom:16px">Side-by-Side: Pass vs. Fail</h3>
      <div class="grid-2" id="cedp-comparison"></div>
    </div>

    <div class="product-insight mt-lg">
      <p>Visa's Commercial Enhanced Data Program (CEDP) shifted from manual sampling to AI-driven validation in April 2026. Previously, Level III data was audited on roughly 2% of transactions. Now Visa's models evaluate every commercial transaction for data quality. Templated descriptions like "MISC MERCHANDISE" and placeholder commodity codes ("00000000") that passed for years will now trigger immediate downgrades. The 500-transaction "verified merchant" pathway gives merchants a window to prove data quality before full enforcement, but merchants who rely on placeholder data need to fix their ERP-to-gateway pipeline before that window closes.</p>
    </div>
  `;
}

function bindCedpEvents() {
  document.getElementById('cedp-evaluate-btn').addEventListener('click', runCedpEvaluation);
  document.getElementById('cedp-add-item').addEventListener('click', () => addCedpLineItem());

  // Data quality toggles
  document.querySelectorAll('#cedp-content .toggle input').forEach(toggle => {
    toggle.addEventListener('change', runCedpEvaluation);
  });

  // Load passing scenario by default
  loadCedpScenario(CEDP_SCENARIOS.passing);
  renderMerchantProgress(320, 500);
}

function loadCedpScenario(scenario) {
  const tbody = document.getElementById('cedp-line-items');
  tbody.innerHTML = '';
  scenario.lineItems.forEach(li => addCedpLineItem(li));
}

function addCedpLineItem(data = {}) {
  const tbody = document.getElementById('cedp-line-items');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><input type="text" class="form-input" value="${data.sku || ''}" data-field="sku"></td>
    <td><input type="text" class="form-input" value="${data.description || ''}" data-field="description" style="min-width:160px"></td>
    <td><input type="number" class="form-input" value="${data.quantity || ''}" min="0" data-field="quantity" style="width:60px"></td>
    <td><input type="number" class="form-input" value="${data.unitPrice || ''}" min="0" step="0.01" data-field="unitPrice" style="width:90px"></td>
    <td><input type="text" class="form-input" value="${data.unitOfMeasure || 'EA'}" data-field="unitOfMeasure" style="width:50px"></td>
    <td><input type="text" class="form-input" value="${data.commodityCode || ''}" data-field="commodityCode" style="width:90px"></td>
    <td><button class="remove-btn" aria-label="Remove line item">&times;</button></td>
  `;
  row.querySelector('.remove-btn').addEventListener('click', () => row.remove());
  tbody.appendChild(row);
}

function getLineItemsFromEditor() {
  const items = [];
  document.querySelectorAll('#cedp-line-items tr').forEach(row => {
    const item = {};
    row.querySelectorAll('[data-field]').forEach(input => {
      const val = input.value;
      item[input.dataset.field] = input.type === 'number' ? (val ? parseFloat(val) : 0) : val;
    });
    if (item.description || item.sku) items.push(item);
  });
  return items;
}

function runCedpEvaluation() {
  const items = getLineItemsFromEditor();
  const specificDesc = document.getElementById('cedp-specific-desc').checked;
  const validCodes = document.getElementById('cedp-valid-codes').checked;
  const noZero = document.getElementById('cedp-no-zero').checked;
  const totalsMatch = document.getElementById('cedp-totals-match').checked;

  const checks = [];
  let score = 0;
  const maxScore = 100;

  // Check 1: Has line items
  if (items.length > 0) {
    checks.push({ name: 'Line items present', status: 'pass', detail: `${items.length} line items provided` });
    score += 15;
  } else {
    checks.push({ name: 'Line items present', status: 'fail', detail: 'No line items. CEDP requires itemized transaction data.' });
  }

  // Check 2: Descriptions are specific
  if (items.length > 0) {
    const genericPatterns = /^(misc|merchandise|product|item|goods|services|purchase|n\/a|na|test)/i;
    const hasGeneric = items.some(i => genericPatterns.test(i.description));
    if (specificDesc && !hasGeneric) {
      checks.push({ name: 'Specific descriptions', status: 'pass', detail: 'All descriptions are specific product identifiers.' });
      score += 20;
    } else {
      checks.push({ name: 'Specific descriptions', status: 'fail', detail: 'Generic or templated descriptions detected. Visa AI models flag "MISC MERCHANDISE," "PRODUCT," and similar placeholders.' });
    }
  }

  // Check 3: Valid commodity codes
  if (items.length > 0) {
    const placeholder = /^(0{4,}|9{4,}|1234|0000)/;
    const hasPlaceholder = items.some(i => placeholder.test(i.commodityCode));
    if (validCodes && !hasPlaceholder) {
      checks.push({ name: 'Valid commodity codes', status: 'pass', detail: 'Commodity codes appear to be valid UNSPSC codes.' });
      score += 20;
    } else {
      checks.push({ name: 'Valid commodity codes', status: 'fail', detail: 'Placeholder commodity codes detected (e.g., "00000000"). CEDP requires valid UNSPSC or NIGP codes.' });
    }
  }

  // Check 4: No zero-value items
  if (items.length > 0) {
    const hasZero = items.some(i => i.unitPrice === 0 || i.quantity === 0);
    if (noZero && !hasZero) {
      checks.push({ name: 'No zero-value items', status: 'pass', detail: 'All items have positive quantity and price.' });
      score += 15;
    } else {
      checks.push({ name: 'No zero-value items', status: 'fail', detail: 'Zero-value line items found. CEDP flags these as potential data quality issues.' });
    }
  }

  // Check 5: Totals match
  if (totalsMatch) {
    checks.push({ name: 'Totals reconcile', status: 'pass', detail: 'Line item totals match transaction amount.' });
    score += 15;
  } else {
    checks.push({ name: 'Totals reconcile', status: 'fail', detail: 'Line item sum does not match transaction total. This is a common CEDP failure.' });
  }

  // Check 6: Unit of measure
  if (items.length > 0) {
    const hasUom = items.every(i => i.unitOfMeasure && i.unitOfMeasure.length > 0);
    if (hasUom) {
      checks.push({ name: 'Unit of measure', status: 'pass', detail: 'All items include unit of measure.' });
      score += 15;
    } else {
      checks.push({ name: 'Unit of measure', status: 'warn', detail: 'Some items missing unit of measure. Required for full CEDP compliance.' });
      score += 7;
    }
  }

  renderCedpResults(score, checks);
}

function renderCedpResults(score, checks) {
  const container = document.getElementById('cedp-score-display');
  const scoreColor = score >= 80 ? 'var(--accent-green)' : score >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)';
  const circumference = 2 * Math.PI * 50;
  const offset = circumference - (score / 100) * circumference;

  const statusIcons = { pass: '\u2713', warn: '!', fail: '\u2717' };

  container.innerHTML = `
    <div class="score-ring mb-md">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle class="ring-bg" cx="60" cy="60" r="50"></circle>
        <circle class="ring-fill" cx="60" cy="60" r="50"
          stroke="${scoreColor}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${offset}"></circle>
      </svg>
      <div class="score-value" style="color:${scoreColor}">${score}</div>
    </div>
    <div style="font-size:13px;color:var(--text-secondary);margin-bottom:20px">
      ${score >= 80 ? 'CEDP compliant. This transaction would pass Visa AI audit.' :
        score >= 50 ? 'Partial compliance. Some fields need attention to avoid downgrades.' :
        'CEDP non-compliant. This transaction will downgrade under April 2026 rules.'}
    </div>

    <ul class="validation-list">
      ${checks.map(c => `
        <li class="validation-item">
          <div class="validation-icon ${c.status}">${statusIcons[c.status]}</div>
          <div>
            <div class="validation-field">${c.name}</div>
            <div class="validation-detail">${c.detail}</div>
          </div>
        </li>
      `).join('')}
    </ul>
  `;
}

function renderMerchantProgress(current, target) {
  const container = document.getElementById('cedp-merchant-progress');
  const pct = Math.min((current / target) * 100, 100);

  container.innerHTML = `
    <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">
      To achieve "verified merchant" status, submit ${target} consecutive CEDP-compliant transactions or maintain compliance for 20 business days.
    </div>
    <div style="background:var(--bg-secondary);border-radius:8px;overflow:hidden;height:24px;position:relative">
      <div style="background:linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));height:100%;width:${pct}%;border-radius:8px;transition:width 0.5s ease"></div>
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:var(--text-primary)" class="mono">${current} / ${target} transactions</div>
    </div>
    <div style="font-size:11px;color:var(--text-muted);margin-top:6px">
      Verified merchants receive reduced audit frequency and faster dispute resolution.
    </div>
  `;
}

function renderCedpComparison() {
  const container = document.getElementById('cedp-comparison');
  const passing = CEDP_SCENARIOS.passing;
  const failing = CEDP_SCENARIOS.failing;

  container.innerHTML = `
    <div class="card" style="border-color:var(--accent-green)">
      <div class="flex-between mb-sm">
        <h4 style="font-size:14px;font-weight:600">${passing.name}</h4>
        <span class="badge badge-pass">PASS</span>
      </div>
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:12px">Total: ${formatCurrency(passing.totalAmount)}</div>
      ${passing.lineItems.map(li => `
        <div style="padding:6px 0;border-bottom:1px solid var(--border);font-size:12px">
          <div style="font-weight:500">${li.description}</div>
          <div style="color:var(--text-muted);margin-top:2px" class="mono">
            ${li.quantity} x ${formatCurrency(li.unitPrice)} | Code: ${li.commodityCode}
          </div>
        </div>
      `).join('')}
      <div style="margin-top:12px;font-size:12px;color:var(--accent-green)">
        Specific product descriptions. Valid UNSPSC commodity codes. Real quantities and prices. This passes CEDP AI audit.
      </div>
    </div>

    <div class="card" style="border-color:var(--accent-red)">
      <div class="flex-between mb-sm">
        <h4 style="font-size:14px;font-weight:600">${failing.name}</h4>
        <span class="badge badge-fail">FAIL</span>
      </div>
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:12px">Total: ${formatCurrency(failing.totalAmount)}</div>
      ${failing.lineItems.map(li => `
        <div style="padding:6px 0;border-bottom:1px solid var(--border);font-size:12px">
          <div style="font-weight:500;color:var(--accent-red)">${li.description}</div>
          <div style="color:var(--text-muted);margin-top:2px" class="mono">
            ${li.quantity} x ${formatCurrency(li.unitPrice)} | Code: <span style="color:var(--accent-red)">${li.commodityCode}</span>
          </div>
        </div>
      `).join('')}
      <div style="margin-top:12px;font-size:12px;color:var(--accent-red)">
        "MISC MERCHANDISE" is a templated description. "00000000" is a placeholder code. Tax rolled into a line item instead of a separate field. This fails CEDP and downgrades to Commercial Standard.
      </div>
    </div>
  `;
}
