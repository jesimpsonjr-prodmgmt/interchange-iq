'use strict';

import { INTERCHANGE_CATEGORIES, ENTRY_MODE_LABELS, getCardTypes, calculateInterchangeCost } from './data/interchange-tables.js';
import { formatRate, formatCurrency } from './utils.js';

let currentSort = { column: 'name', direction: 'asc' };
let filteredCategories = [...INTERCHANGE_CATEGORIES];

export function initLookup() {
  const container = document.getElementById('lookup-content');
  container.innerHTML = buildLookupHTML();
  bindLookupEvents();
  renderTable();
}

function buildLookupHTML() {
  const cardTypes = getCardTypes();
  const entryModes = Object.entries(ENTRY_MODE_LABELS);

  return `
    <div class="filter-bar">
      <div class="search-input-wrap">
        <span class="search-icon" aria-hidden="true">&#128269;</span>
        <input type="text" class="form-input" id="lookup-search" placeholder="Search categories..." aria-label="Search interchange categories">
      </div>
      <div class="form-group">
        <label for="lookup-network">Network</label>
        <select class="form-select" id="lookup-network">
          <option value="">All Networks</option>
          <option value="Visa">Visa</option>
          <option value="Mastercard">Mastercard</option>
        </select>
      </div>
      <div class="form-group">
        <label for="lookup-card-type">Card Type</label>
        <select class="form-select" id="lookup-card-type">
          <option value="">All Types</option>
          ${cardTypes.map(t => `<option value="${t}">${t}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label for="lookup-entry-mode">Entry Mode</label>
        <select class="form-select" id="lookup-entry-mode">
          <option value="">All Modes</option>
          ${entryModes.map(([val, label]) => `<option value="${val}">${label}</option>`).join('')}
        </select>
      </div>
    </div>

    <div class="flex-between mb-sm">
      <div class="result-count" id="lookup-count"></div>
      <div class="form-group" style="margin-bottom:0; width: 140px;">
        <label for="lookup-amount">Sample Amount</label>
        <input type="number" class="form-input mono" id="lookup-amount" value="1000" min="1" step="100" aria-label="Sample transaction amount for cost calculation">
      </div>
    </div>

    <div class="data-table-wrapper">
      <table class="data-table" id="lookup-table">
        <thead>
          <tr>
            <th style="width:32px"></th>
            <th data-sort="network" style="width:100px">Network</th>
            <th data-sort="name">Category</th>
            <th data-sort="cardType">Card Type</th>
            <th data-sort="rate">Rate</th>
            <th data-sort="cost" style="width:100px">Cost @ Amount</th>
          </tr>
        </thead>
        <tbody id="lookup-tbody"></tbody>
      </table>
    </div>

    <div class="product-insight mt-lg">
      <p>Interchange is not a single number. The same $1,000 transaction can cost anywhere from $2.10 (regulated debit) to $30.00+ (downgraded commercial card) depending on card type, data quality, and settlement timing. The categories above represent published rates, but your effective rate also depends on your processor's markup model (IC++, tiered, or flat). Understanding where your transactions land in this table is the first step to meaningful cost reduction.</p>
    </div>
  `;
}

function bindLookupEvents() {
  // Filters
  document.getElementById('lookup-search').addEventListener('input', applyFilters);
  document.getElementById('lookup-network').addEventListener('change', applyFilters);
  document.getElementById('lookup-card-type').addEventListener('change', applyFilters);
  document.getElementById('lookup-entry-mode').addEventListener('change', applyFilters);
  document.getElementById('lookup-amount').addEventListener('input', renderTable);

  // Sort headers
  document.querySelectorAll('#lookup-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (currentSort.column === col) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
      } else {
        currentSort.column = col;
        currentSort.direction = 'asc';
      }
      renderTable();
    });
  });
}

function applyFilters() {
  const search = document.getElementById('lookup-search').value.toLowerCase().trim();
  const network = document.getElementById('lookup-network').value;
  const cardType = document.getElementById('lookup-card-type').value;
  const entryMode = document.getElementById('lookup-entry-mode').value;

  filteredCategories = INTERCHANGE_CATEGORIES.filter(cat => {
    if (network && cat.network !== network) return false;
    if (cardType && cat.cardType !== cardType) return false;
    if (entryMode && !cat.entryModes.includes(entryMode)) return false;
    if (search) {
      const haystack = `${cat.name} ${cat.network} ${cat.cardType} ${cat.description}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  renderTable();
}

function sortCategories(cats) {
  const col = currentSort.column;
  const dir = currentSort.direction === 'asc' ? 1 : -1;

  return [...cats].sort((a, b) => {
    let aVal, bVal;
    if (col === 'cost') {
      const amount = parseFloat(document.getElementById('lookup-amount').value) || 1000;
      aVal = calculateInterchangeCost(a, amount);
      bVal = calculateInterchangeCost(b, amount);
    } else {
      aVal = a[col];
      bVal = b[col];
    }

    if (typeof aVal === 'string') return dir * aVal.localeCompare(bVal);
    return dir * (aVal - bVal);
  });
}

function renderTable() {
  const tbody = document.getElementById('lookup-tbody');
  const amount = parseFloat(document.getElementById('lookup-amount').value) || 1000;
  const sorted = sortCategories(filteredCategories);

  // Update count
  document.getElementById('lookup-count').textContent =
    `Showing ${sorted.length} of ${INTERCHANGE_CATEGORIES.length} categories`;

  // Update sort indicators
  document.querySelectorAll('#lookup-table th[data-sort]').forEach(th => {
    th.classList.remove('sorted-asc', 'sorted-desc');
    if (th.dataset.sort === currentSort.column) {
      th.classList.add(`sorted-${currentSort.direction}`);
    }
  });

  tbody.innerHTML = sorted.map(cat => {
    const cost = calculateInterchangeCost(cat, amount);
    const networkClass = cat.network === 'Visa' ? 'network-visa' : 'network-mastercard';
    const downgradeCat = cat.downgradeTo
      ? INTERCHANGE_CATEGORIES.find(c => c.id === cat.downgradeTo)
      : null;

    return `
      <tr>
        <td><button class="expand-btn" data-id="${cat.id}" aria-label="Expand details for ${cat.name}" aria-expanded="false">&#9654;</button></td>
        <td><span class="network-badge ${networkClass}">${cat.network}</span></td>
        <td><strong>${cat.name}</strong><br><span style="font-size:11px;color:var(--text-muted)">${cat.description}</span></td>
        <td>${cat.cardType}</td>
        <td class="rate-cell">${formatRate(cat.rate, cat.perTxn)}</td>
        <td class="rate-cell">${formatCurrency(cost)}</td>
      </tr>
      <tr class="expand-row" id="expand-${cat.id}">
        <td colspan="6">
          <div class="expand-content">
            <div>
              <h4>Qualification Requirements</h4>
              <ul>
                ${cat.qualificationRules.map(r => `<li>${r}</li>`).join('')}
              </ul>
            </div>
            <div>
              <h4>Details</h4>
              <ul>
                <li>Entry modes: ${cat.entryModes.map(m => ENTRY_MODE_LABELS[m] || m).join(', ')}</li>
                <li>CEDP applicable: ${cat.cedpApplicable ? 'Yes' : 'No'}</li>
                ${downgradeCat ? `<li>Downgrades to: <strong>${downgradeCat.name}</strong> (${formatRate(downgradeCat.rate, downgradeCat.perTxn)}) -- cost increase of ${formatCurrency(calculateInterchangeCost(downgradeCat, amount) - cost)} on $${amount}</li>` : '<li>No further downgrade (terminal category)</li>'}
              </ul>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Bind expand buttons
  tbody.querySelectorAll('.expand-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const expandRow = document.getElementById(`expand-${btn.dataset.id}`);
      const isVisible = expandRow.classList.contains('visible');
      expandRow.classList.toggle('visible');
      btn.classList.toggle('expanded');
      btn.setAttribute('aria-expanded', !isVisible);
    });
  });
}
