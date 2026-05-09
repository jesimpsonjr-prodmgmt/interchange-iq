'use strict';

import { INTERCHANGE_CATEGORIES, calculateInterchangeCost } from './data/interchange-tables.js';
import { DOWNGRADE_SCENARIOS } from './data/scenarios.js';
import { evaluateTransaction, getDowngradePath, formatCurrency, formatRate } from './utils.js';

let downgradeTxn = null;
let chartInstance = null;

export function initDowngrade() {
  const container = document.getElementById('downgrade-content');
  container.innerHTML = buildDowngradeHTML();
  loadDefaultTransaction();
  bindDowngradeEvents();
}

function buildDowngradeHTML() {
  return `
    <div class="grid-2">
      <div class="card">
        <h3 style="font-size:14px;font-weight:600;margin-bottom:4px">Qualified Transaction</h3>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:16px">Toggle fields off to simulate data quality issues. Watch the cost cascade.</p>

        <div class="flex-between mb-md">
          <div>
            <span class="mono" style="font-size:13px;color:var(--text-secondary)" id="dg-txn-summary"></span>
          </div>
          <button class="scenario-btn" id="dg-story-btn">Tell me a story</button>
        </div>

        <div id="dg-toggles">
          <div class="toggle-wrap">
            <span class="toggle-label">Sales Tax</span>
            <label class="toggle">
              <input type="checkbox" checked data-field="salesTax">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="toggle-wrap">
            <span class="toggle-label">Customer Code / PO Number</span>
            <label class="toggle">
              <input type="checkbox" checked data-field="customerCode">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="toggle-wrap">
            <span class="toggle-label">Merchant Postal Code</span>
            <label class="toggle">
              <input type="checkbox" checked data-field="merchantPostalCode">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="toggle-wrap">
            <span class="toggle-label">Level III Line Items</span>
            <label class="toggle">
              <input type="checkbox" checked data-field="lineItems">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="toggle-wrap">
            <span class="toggle-label">AVS Response</span>
            <label class="toggle">
              <input type="checkbox" checked data-field="avsResult">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="toggle-wrap">
            <span class="toggle-label">CVV Response</span>
            <label class="toggle">
              <input type="checkbox" checked data-field="cvvResult">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="toggle-wrap">
            <span class="toggle-label">Timely Settlement (&lt; 24h)</span>
            <label class="toggle">
              <input type="checkbox" checked data-field="authAge">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="slider-group mt-lg">
          <label>
            <span>Monthly Transaction Volume</span>
            <span class="slider-value" id="dg-volume-label">500</span>
          </label>
          <input type="range" id="dg-volume" min="100" max="10000" step="100" value="500">
        </div>
      </div>

      <div>
        <div class="card" id="dg-results">
          <h3 style="font-size:14px;font-weight:600;margin-bottom:16px">Downgrade Waterfall</h3>
          <div id="dg-waterfall"></div>
          <div id="dg-cost-comparison" class="mt-lg"></div>
          <div id="dg-annual-impact" class="mt-lg"></div>
          <div id="dg-root-cause" class="mt-md"></div>
        </div>
      </div>
    </div>

    <div class="chart-container mt-lg">
      <canvas id="dg-chart"></canvas>
    </div>

    <div id="dg-story-panel" class="hidden">
      <div class="card mt-lg" style="border-color:var(--accent-primary)">
        <h3 style="font-size:16px;font-weight:600;color:var(--accent-primary);margin-bottom:12px" id="dg-story-title"></h3>
        <div id="dg-story-content" style="font-size:13px;color:var(--text-secondary);line-height:1.8"></div>
      </div>
    </div>

    <div class="product-insight mt-lg">
      <p>Downgrade detection is the highest-ROI optimization in payments. Most merchants do not realize they are paying excess interchange until a quarterly review reveals the pattern. The root cause is almost always a system integration issue: an ERP update that drops a field, a gateway that truncates Level III data, or a batch processor that settles 48 hours late. Real-time downgrade monitoring would catch these within one settlement cycle instead of one billing cycle.</p>
    </div>
  `;
}

function loadDefaultTransaction() {
  const scenario = DOWNGRADE_SCENARIOS[0];
  downgradeTxn = { ...scenario.transaction };
  document.getElementById('dg-txn-summary').textContent =
    `${scenario.transaction.network} Commercial / ${formatCurrency(scenario.transaction.amount)}`;
}

function bindDowngradeEvents() {
  // Toggle switches
  document.querySelectorAll('#dg-toggles input[type="checkbox"]').forEach(toggle => {
    toggle.addEventListener('change', runDowngradeSimulation);
  });

  // Volume slider
  const volumeSlider = document.getElementById('dg-volume');
  volumeSlider.addEventListener('input', () => {
    document.getElementById('dg-volume-label').textContent = parseInt(volumeSlider.value).toLocaleString();
    runDowngradeSimulation();
  });

  // Story button
  document.getElementById('dg-story-btn').addEventListener('click', showStory);

  // Initial render
  runDowngradeSimulation();
}

function getCurrentTransaction() {
  const txn = { ...downgradeTxn };
  const toggles = document.querySelectorAll('#dg-toggles input[type="checkbox"]');

  toggles.forEach(toggle => {
    const field = toggle.dataset.field;
    if (!toggle.checked) {
      switch (field) {
        case 'salesTax':
          txn.salesTax = undefined;
          break;
        case 'customerCode':
          txn.customerCode = '';
          break;
        case 'merchantPostalCode':
          txn.merchantPostalCode = '';
          break;
        case 'lineItems':
          txn.lineItems = [];
          break;
        case 'avsResult':
          txn.avsResult = 'none';
          break;
        case 'cvvResult':
          txn.cvvResult = 'none';
          break;
        case 'authAge':
          txn.authAge = 72;
          break;
      }
    }
  });

  return txn;
}

function runDowngradeSimulation() {
  const txn = getCurrentTransaction();
  const results = evaluateTransaction(txn, INTERCHANGE_CATEGORIES);
  const bestFullTxn = evaluateTransaction(downgradeTxn, INTERCHANGE_CATEGORIES);

  // Build waterfall from best possible to current
  const currentCategory = results.bestCategory;
  const bestCategory = bestFullTxn.bestCategory;

  if (!currentCategory || !bestCategory) return;

  const downgradePath = getDowngradePath(bestCategory, INTERCHANGE_CATEGORIES);
  const volume = parseInt(document.getElementById('dg-volume').value) || 500;
  const amount = downgradeTxn.amount;

  // Render waterfall
  renderWaterfall(downgradePath, currentCategory, amount);

  // Cost comparison
  const bestCost = calculateInterchangeCost(bestCategory, amount);
  const currentCost = calculateInterchangeCost(currentCategory, amount);
  const delta = currentCost - bestCost;
  const annualDelta = delta * volume * 12;

  renderCostComparison(bestCategory, currentCategory, bestCost, currentCost, delta);
  renderAnnualImpact(delta, volume, annualDelta);
  renderRootCause(txn);
  renderChart(downgradePath, currentCategory, amount);
}

function renderWaterfall(path, currentCategory, amount) {
  const container = document.getElementById('dg-waterfall');
  container.innerHTML = path.map((cat, i) => {
    const cost = calculateInterchangeCost(cat, amount);
    const isCurrent = cat.id === currentCategory.id;
    const isAboveCurrent = path.indexOf(currentCategory) > i;
    const stateClass = isCurrent ? 'current' : (isAboveCurrent ? 'active' : '');

    return `
      ${i > 0 ? '<div class="waterfall-arrow">&darr;</div>' : ''}
      <div class="waterfall-tier ${stateClass}">
        <span class="waterfall-tier-name">${cat.name} ${isCurrent ? '<span class="badge badge-warn" style="margin-left:8px">Current</span>' : ''}</span>
        <span class="waterfall-tier-rate">${formatRate(cat.rate, cat.perTxn)}</span>
        <span class="waterfall-tier-cost">${formatCurrency(cost)}</span>
      </div>
    `;
  }).join('');
}

function renderCostComparison(bestCat, currentCat, bestCost, currentCost, delta) {
  const container = document.getElementById('dg-cost-comparison');
  if (delta <= 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:16px;background:rgba(34,197,94,0.08);border-radius:var(--radius-sm)">
        <span class="badge badge-pass">Fully Qualified</span>
        <div style="font-size:13px;color:var(--text-secondary);margin-top:8px">Transaction is at the best available rate: ${formatRate(bestCat.rate, bestCat.perTxn)}</div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="grid-2" style="gap:12px">
      <div style="text-align:center;padding:16px;background:var(--bg-secondary);border-radius:var(--radius-sm)">
        <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.8px">Best Rate</div>
        <div class="mono" style="font-size:20px;font-weight:700;color:var(--accent-green);margin-top:4px">${formatCurrency(bestCost)}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${bestCat.name}</div>
      </div>
      <div style="text-align:center;padding:16px;background:var(--bg-secondary);border-radius:var(--radius-sm)">
        <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.8px">Current Rate</div>
        <div class="mono" style="font-size:20px;font-weight:700;color:var(--accent-red);margin-top:4px">${formatCurrency(currentCost)}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${currentCat.name}</div>
      </div>
    </div>
    <div style="text-align:center;margin-top:12px">
      <span class="savings-badge savings-negative">+${formatCurrency(delta)} per transaction</span>
    </div>
  `;
}

function renderAnnualImpact(delta, volume, annualDelta) {
  const container = document.getElementById('dg-annual-impact');
  if (delta <= 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div style="padding:16px;background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15);border-radius:var(--radius-sm);text-align:center">
      <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.8px">Projected Annual Cost of Downgrade</div>
      <div class="mono" style="font-size:28px;font-weight:700;color:var(--accent-red);margin-top:8px">${formatCurrency(annualDelta)}</div>
      <div style="font-size:12px;color:var(--text-secondary);margin-top:4px">at ${volume.toLocaleString()} transactions/month</div>
    </div>
  `;
}

function renderRootCause(txn) {
  const container = document.getElementById('dg-root-cause');
  const causes = [];

  if (txn.salesTax === undefined) causes.push({ layer: 'ERP / Gateway', issue: 'Sales tax field missing from transaction data' });
  if (!txn.customerCode) causes.push({ layer: 'ERP / Order System', issue: 'Customer code or PO number not passed to gateway' });
  if (!txn.merchantPostalCode) causes.push({ layer: 'Gateway Config', issue: 'Merchant postal code not configured in gateway profile' });
  if (!txn.lineItems || txn.lineItems.length === 0) causes.push({ layer: 'ERP / Gateway', issue: 'Level III line items not transmitted. Check addendum record support.' });
  if (txn.avsResult === 'none') causes.push({ layer: 'Gateway', issue: 'AVS data not sent with authorization request' });
  if (txn.cvvResult === 'none') causes.push({ layer: 'Gateway', issue: 'CVV not collected or not passed to acquirer' });
  if (txn.authAge > 48) causes.push({ layer: 'Batch Settlement', issue: 'Settlement delayed beyond 48 hours. Check batch close schedule.' });

  if (causes.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <h4 style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px">Root Cause Attribution</h4>
    ${causes.map(c => `
      <div style="display:flex;gap:12px;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px">
        <span class="badge badge-fail" style="flex-shrink:0">${c.layer}</span>
        <span style="color:var(--text-secondary)">${c.issue}</span>
      </div>
    `).join('')}
  `;
}

function renderChart(path, currentCategory, amount) {
  const canvas = document.getElementById('dg-chart');
  const ctx = canvas.getContext('2d');

  if (chartInstance) chartInstance.destroy();

  const labels = path.map(c => c.name);
  const costs = path.map(c => calculateInterchangeCost(c, amount));
  const colors = path.map(c => c.id === currentCategory.id ? '#ef4444' : 'rgba(16,185,129,0.3)');
  const borderColors = path.map(c => c.id === currentCategory.id ? '#ef4444' : '#10b981');

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: `Cost on ${formatCurrency(amount)} transaction`,
        data: costs,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => formatCurrency(ctx.raw)
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#64748b', font: { family: 'DM Sans', size: 11 } },
          grid: { color: 'rgba(226,229,235,0.8)' }
        },
        y: {
          ticks: {
            color: '#64748b',
            font: { family: 'JetBrains Mono', size: 11 },
            callback: (val) => '$' + val.toFixed(2)
          },
          grid: { color: 'rgba(226,229,235,0.8)' }
        }
      }
    }
  });
}

function showStory() {
  const panel = document.getElementById('dg-story-panel');
  const scenario = DOWNGRADE_SCENARIOS[0];

  panel.classList.remove('hidden');
  document.getElementById('dg-story-title').textContent = scenario.name;

  const content = document.getElementById('dg-story-content');
  content.innerHTML = '';

  // Animate paragraphs
  scenario.narrative.forEach((text, i) => {
    const p = document.createElement('p');
    p.textContent = text;
    p.style.opacity = '0';
    p.style.transform = 'translateY(10px)';
    p.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    p.style.marginBottom = '12px';
    content.appendChild(p);

    setTimeout(() => {
      p.style.opacity = '1';
      p.style.transform = 'translateY(0)';
    }, 300 * (i + 1));
  });

  // Animate toggle sequence
  if (scenario.toggleSequence) {
    // First reset all toggles to on
    document.querySelectorAll('#dg-toggles input[type="checkbox"]').forEach(t => {
      t.checked = true;
    });
    runDowngradeSimulation();

    scenario.toggleSequence.forEach((field, i) => {
      setTimeout(() => {
        const toggle = document.querySelector(`#dg-toggles input[data-field="${field}"]`);
        if (toggle) {
          toggle.checked = false;
          toggle.dispatchEvent(new Event('change'));
        }
      }, 1500 + (i * 1500));
    });
  }

  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
