'use strict';

import { INTERCHANGE_CATEGORIES } from './data/interchange-tables.js';
import { PROCESSORS, calculateProcessorCost } from './data/processors.js';
import { ROUTING_SCENARIOS } from './data/scenarios.js';
import { evaluateTransaction, formatCurrency, formatNumber } from './utils.js';

let routingChart = null;

export function initRouting() {
  const container = document.getElementById('routing-content');
  container.innerHTML = buildRoutingHTML();
  bindRoutingEvents();
}

function buildRoutingHTML() {
  return `
    <div class="scenario-buttons" aria-label="Load routing scenario">
      ${ROUTING_SCENARIOS.map(s => `
        <button class="scenario-btn" data-routing-scenario="${s.id}">${s.name}</button>
      `).join('')}
    </div>

    <div class="grid-2">
      <div class="card">
        <h3 style="font-size:14px;font-weight:600;margin-bottom:16px">Transaction Profile</h3>
        <div class="grid-2" style="gap:12px">
          <div class="form-group">
            <label for="r-amount">Amount ($)</label>
            <input type="number" class="form-input mono" id="r-amount" value="25000" min="1">
          </div>
          <div class="form-group">
            <label for="r-network">Network</label>
            <select class="form-select" id="r-network">
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
            </select>
          </div>
          <div class="form-group">
            <label for="r-card-type">Card Type</label>
            <select class="form-select" id="r-card-type">
              <option value="Consumer Credit">Consumer Credit</option>
              <option value="Commercial">Commercial</option>
              <option value="Purchasing">Purchasing</option>
              <option value="Regulated Debit">Regulated Debit</option>
            </select>
          </div>
          <div class="form-group">
            <label for="r-entry-mode">Entry Mode</label>
            <select class="form-select" id="r-entry-mode">
              <option value="ecommerce">E-Commerce</option>
              <option value="chip">Chip / EMV</option>
              <option value="swiped">Swiped</option>
              <option value="contactless">Contactless</option>
              <option value="keyed">Keyed / MOTO</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Data Quality</label>
          <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">Does this transaction include Level II/III data?</div>
          <div class="btn-group">
            <button class="btn btn-sm active" data-data-quality="level3" id="r-dq-l3">Level III</button>
            <button class="btn btn-sm" data-data-quality="level2" id="r-dq-l2">Level II Only</button>
            <button class="btn btn-sm" data-data-quality="none" id="r-dq-none">No Enhanced Data</button>
          </div>
        </div>

        <div class="slider-group mt-md">
          <label>
            <span>Monthly Volume (transactions)</span>
            <span class="slider-value" id="r-volume-label">500</span>
          </label>
          <input type="range" id="r-volume" min="50" max="10000" step="50" value="500">
        </div>

        <button class="btn btn-primary mt-md" id="r-compare-btn" style="width:100%">Compare Routes</button>
      </div>

      <div>
        <div id="r-results"></div>
      </div>
    </div>

    <div class="chart-container mt-lg">
      <canvas id="r-chart"></canvas>
    </div>

    <div class="product-insight mt-lg">
      <p>Processor selection is the second-largest controllable cost in card acceptance after interchange itself. IC++ (interchange-plus-plus) pricing gives merchants full transparency into interchange, network fees, and processor markup as separate line items. Tiered pricing bundles everything into "qualified," "mid-qualified," and "non-qualified" buckets, which obscures the true cost and makes optimization harder. For B2B merchants processing commercial cards, the ability to pass Level III data through to the network is critical. Not all processors support it, and those that do not will quietly downgrade every commercial transaction.</p>
    </div>
  `;
}

function bindRoutingEvents() {
  // Scenarios
  document.querySelectorAll('[data-routing-scenario]').forEach(btn => {
    btn.addEventListener('click', () => {
      const scenario = ROUTING_SCENARIOS.find(s => s.id === btn.dataset.routingScenario);
      if (scenario) {
        loadRoutingScenario(scenario);
        runRoutingComparison();
        document.querySelectorAll('[data-routing-scenario]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });

  // Data quality toggle
  document.querySelectorAll('[data-data-quality]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-data-quality]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Volume slider
  const volumeSlider = document.getElementById('r-volume');
  volumeSlider.addEventListener('input', () => {
    document.getElementById('r-volume-label').textContent = parseInt(volumeSlider.value).toLocaleString();
  });

  // Compare button
  document.getElementById('r-compare-btn').addEventListener('click', runRoutingComparison);
}

function loadRoutingScenario(scenario) {
  const txn = scenario.transaction;
  document.getElementById('r-amount').value = txn.amount;
  document.getElementById('r-network').value = txn.network;
  document.getElementById('r-card-type').value = txn.cardType;
  document.getElementById('r-entry-mode').value = txn.entryMode;

  // Set data quality
  const quality = txn.lineItems && txn.lineItems.length > 0 ? 'level3' :
                   txn.salesTax !== undefined ? 'level2' : 'none';
  document.querySelectorAll('[data-data-quality]').forEach(b => {
    b.classList.toggle('active', b.dataset.dataQuality === quality);
  });
}

function getInterchangeForQuality(network, cardType, entryMode, dataQuality) {
  // Find the appropriate interchange category based on data quality
  let matchingCats = INTERCHANGE_CATEGORIES.filter(c =>
    c.network === network &&
    c.entryModes.includes(entryMode)
  );

  // Filter by card type
  if (cardType === 'Commercial' || cardType === 'Purchasing') {
    const commercialCats = matchingCats.filter(c =>
      c.cardType === 'Commercial' || c.cardType === 'Purchasing'
    );

    if (dataQuality === 'level3') {
      const l3 = commercialCats.find(c => c.id.includes('level3') || c.id.includes('data-rate2') || c.id.includes('purchasing'));
      if (l3) return l3;
    }
    if (dataQuality === 'level2' || dataQuality === 'level3') {
      const l2 = commercialCats.find(c => c.id.includes('level2') || c.id.includes('data-rate1'));
      if (l2) return l2;
    }
    const standard = commercialCats.find(c => c.id.includes('standard') || c.id.includes('base'));
    if (standard) return standard;
  }

  if (cardType === 'Regulated Debit') {
    const reg = matchingCats.find(c => c.cardType === 'Regulated Debit');
    if (reg) return reg;
  }

  // Consumer credit fallback
  const consumerCats = matchingCats.filter(c => c.cardType === 'Consumer Credit');
  if (['swiped', 'contactless', 'chip'].includes(entryMode)) {
    const retail = consumerCats.find(c => c.id.includes('retail') || c.id.includes('merit1'));
    if (retail) return retail;
  }
  const ecom = consumerCats.find(c => c.id.includes('ecommerce') || c.id.includes('merit3'));
  if (ecom) return ecom;

  return consumerCats[0] || matchingCats[0];
}

function runRoutingComparison() {
  const amount = parseFloat(document.getElementById('r-amount').value) || 1000;
  const network = document.getElementById('r-network').value;
  const cardType = document.getElementById('r-card-type').value;
  const entryMode = document.getElementById('r-entry-mode').value;
  const dataQualityBtn = document.querySelector('[data-data-quality].active');
  const dataQuality = dataQualityBtn ? dataQualityBtn.dataset.dataQuality : 'level3';
  const volume = parseInt(document.getElementById('r-volume').value) || 500;

  const interchangeCat = getInterchangeForQuality(network, cardType, entryMode, dataQuality);
  if (!interchangeCat) return;

  // For Processor B, if it does not support Level III, use Level II rate
  const interchangeCatB = (!PROCESSORS[1].supportsLevelIII && dataQuality === 'level3')
    ? getInterchangeForQuality(network, cardType, entryMode, 'level2')
    : interchangeCat;

  const results = PROCESSORS.map((proc, i) => {
    const cat = (i === 1) ? interchangeCatB : interchangeCat;
    const cost = calculateProcessorCost(proc, cat ? cat.rate : 0, cat ? cat.perTxn : 0, amount);
    return { processor: proc, category: cat, cost };
  });

  // Find cheapest
  const minTotal = Math.min(...results.map(r => r.cost.total));

  renderRoutingResults(results, minTotal, amount, volume, interchangeCat);
  renderRoutingChart(results, amount);
}

function renderRoutingResults(results, minTotal, amount, volume, baseCat) {
  const container = document.getElementById('r-results');

  container.innerHTML = `
    <div class="comparison-grid">
      ${results.map(r => {
        const isBest = r.cost.total === minTotal;
        const delta = r.cost.total - minTotal;
        const annualSavings = delta * volume * 12;

        return `
          <div class="comparison-card ${isBest ? 'best' : ''}">
            <div class="card-title">${r.processor.name}</div>
            <div class="card-subtitle">${r.processor.subtitle}</div>

            ${r.processor.isAlternativeRail ? `
              <div class="cost-line">
                <span>Transaction Fee</span>
                <span class="cost-value">${formatCurrency(r.cost.perTxnFees)}</span>
              </div>
            ` : `
              <div class="cost-line">
                <span>Interchange (${r.category ? r.category.name : 'N/A'})</span>
                <span class="cost-value">${formatCurrency(r.cost.interchange)}</span>
              </div>
              <div class="cost-line">
                <span>Network / Assessment Fees</span>
                <span class="cost-value">${formatCurrency(r.cost.networkFees)}</span>
              </div>
              <div class="cost-line">
                <span>Processor Markup (${r.processor.processorMarkup} bps + ${formatCurrency(r.processor.perTxnFee)})</span>
                <span class="cost-value">${formatCurrency(r.cost.processorMarkup)}</span>
              </div>
            `}

            <div class="cost-line total">
              <span>Total Cost</span>
              <span class="cost-value">${formatCurrency(r.cost.total)}</span>
            </div>

            ${isBest
              ? '<span class="savings-badge savings-positive">Best Option</span>'
              : `<span class="savings-badge savings-negative">+${formatCurrency(delta)} per txn</span>
                 <div style="font-size:11px;color:var(--text-muted);margin-top:8px">Annual excess cost: ${formatCurrency(annualSavings)} at ${formatNumber(volume)} txns/mo</div>`
            }

            <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
              <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Features</div>
              ${r.processor.features.map(f => `<div style="font-size:11px;color:var(--text-secondary);padding:2px 0">&#8226; ${f}</div>`).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderRoutingChart(results, amount) {
  const canvas = document.getElementById('r-chart');
  const ctx = canvas.getContext('2d');

  if (routingChart) routingChart.destroy();

  const labels = results.map(r => r.processor.name);
  const interchangeData = results.map(r => r.cost.interchange);
  const networkData = results.map(r => r.cost.networkFees);
  const markupData = results.map(r => r.cost.processorMarkup || r.cost.perTxnFees);

  routingChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Interchange',
          data: interchangeData,
          backgroundColor: 'rgba(16,185,129,0.7)',
          borderRadius: 4
        },
        {
          label: 'Network Fees',
          data: networkData,
          backgroundColor: 'rgba(59,130,246,0.7)',
          borderRadius: 4
        },
        {
          label: 'Processor Markup',
          data: markupData,
          backgroundColor: 'rgba(139,92,246,0.7)',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#64748b', font: { family: 'DM Sans', size: 12 } }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          ticks: { color: '#64748b', font: { family: 'DM Sans', size: 12 } },
          grid: { display: false }
        },
        y: {
          stacked: true,
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
