'use strict';

import { INTERCHANGE_CATEGORIES } from './data/interchange-tables.js';
import { AGENTIC_SCENARIOS } from './data/scenarios.js';
import { evaluateTransaction, formatCurrency, formatRate } from './utils.js';

export function initAgentic() {
  const container = document.getElementById('agentic-content');
  container.innerHTML = buildAgenticHTML();
  bindAgenticEvents();
}

function buildAgenticHTML() {
  return `
    <div class="scenario-buttons" aria-label="Load agentic scenario">
      ${AGENTIC_SCENARIOS.map(s => `
        <button class="scenario-btn" data-agentic-scenario="${s.id}">${s.name}</button>
      `).join('')}
    </div>

    <div id="ag-scenario-detail" class="hidden">
      <div class="grid-2">
        <div class="card">
          <h3 style="font-size:14px;font-weight:600;margin-bottom:4px">Agent Behavior Controls</h3>
          <p style="font-size:12px;color:var(--text-muted);margin-bottom:16px">Toggle switches to simulate common AI agent shortcuts.</p>

          <div id="ag-scenario-info" style="padding:12px 16px;background:var(--bg-secondary);border-radius:var(--radius-sm);margin-bottom:16px">
            <div style="font-size:14px;font-weight:600" id="ag-scenario-name"></div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px" id="ag-scenario-desc"></div>
            <div style="font-size:13px;color:var(--accent-primary);margin-top:6px" class="mono" id="ag-scenario-amount"></div>
          </div>

          <div id="ag-toggles">
            <div class="toggle-wrap">
              <span class="toggle-label">Agent omits AVS data</span>
              <label class="toggle">
                <input type="checkbox" data-behavior="omitsAvs" id="ag-omit-avs">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="toggle-wrap">
              <span class="toggle-label">Agent skips CVV verification</span>
              <label class="toggle">
                <input type="checkbox" data-behavior="skipsCvv" id="ag-skip-cvv">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="toggle-wrap">
              <span class="toggle-label">Agent skips Level III line items</span>
              <label class="toggle">
                <input type="checkbox" data-behavior="skipsLevelIII" id="ag-skip-l3">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="toggle-wrap">
              <span class="toggle-label">Agent skips Level II data (tax, PO)</span>
              <label class="toggle">
                <input type="checkbox" data-behavior="skipsLevelII" id="ag-skip-l2">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="toggle-wrap">
              <span class="toggle-label">Agent delays settlement (&gt; 48h)</span>
              <label class="toggle">
                <input type="checkbox" data-behavior="delaysSettlement" id="ag-delay">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="toggle-wrap">
              <span class="toggle-label">Agent uses incorrect MCC</span>
              <label class="toggle">
                <input type="checkbox" data-behavior="incorrectMcc" id="ag-bad-mcc">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <div class="card" id="ag-comparison">
            <h3 style="font-size:14px;font-weight:600;margin-bottom:16px">Human vs. Agent Cost</h3>
            <div id="ag-comparison-content"></div>
          </div>

          <div class="card mt-md" id="ag-risks">
            <h3 style="font-size:14px;font-weight:600;margin-bottom:12px">Downgrade Risks</h3>
            <div id="ag-risks-content"></div>
          </div>

          <div class="card mt-md" id="ag-guardrails">
            <h3 style="font-size:14px;font-weight:600;margin-bottom:12px">Recommended Guardrails</h3>
            <div id="ag-guardrails-content"></div>
          </div>
        </div>
      </div>
    </div>

    <div id="ag-empty-state" class="card text-center" style="padding:48px">
      <div style="font-size:32px;margin-bottom:12px">&#129302;</div>
      <h3 style="font-size:18px;font-weight:600;margin-bottom:8px">Select a Scenario</h3>
      <p style="color:var(--text-secondary);font-size:14px">Choose a scenario above to compare human and AI agent transaction costs.</p>
    </div>

    <div class="product-insight mt-lg">
      <p>AI agents will process an estimated $1.2 trillion in commerce transactions by 2028. Most agent frameworks today (LangChain tool calls, OpenAI function calling, Anthropic tool use) focus on completing the purchase, not on the payment data quality that determines interchange cost. An agent that buys $10,000 in office supplies without Level III data costs the merchant $85 more per transaction than a human buyer who provides the same data. Visa's Agentic Ready program, expected in late 2026, will create a formal certification for agent-initiated transactions. Merchants who build interchange-aware guardrails now will have a head start when those standards go live.</p>
    </div>
  `;
}

function bindAgenticEvents() {
  // Scenario buttons
  document.querySelectorAll('[data-agentic-scenario]').forEach(btn => {
    btn.addEventListener('click', () => {
      const scenario = AGENTIC_SCENARIOS.find(s => s.id === btn.dataset.agenticScenario);
      if (scenario) {
        loadAgenticScenario(scenario);
        document.querySelectorAll('[data-agentic-scenario]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });

  // Behavior toggles
  document.querySelectorAll('#ag-toggles input[type="checkbox"]').forEach(toggle => {
    toggle.addEventListener('change', () => {
      const activeBtn = document.querySelector('[data-agentic-scenario].active');
      if (activeBtn) {
        const scenario = AGENTIC_SCENARIOS.find(s => s.id === activeBtn.dataset.agenticScenario);
        if (scenario) runAgenticComparison(scenario);
      }
    });
  });
}

function loadAgenticScenario(scenario) {
  // Show detail panel, hide empty state
  document.getElementById('ag-scenario-detail').classList.remove('hidden');
  document.getElementById('ag-empty-state').classList.add('hidden');

  // Set scenario info
  document.getElementById('ag-scenario-name').textContent = scenario.name;
  document.getElementById('ag-scenario-desc').textContent = scenario.description;
  document.getElementById('ag-scenario-amount').textContent = formatCurrency(scenario.transaction.amount);

  // Set default toggles
  const defaults = scenario.agentDefaults;
  document.getElementById('ag-omit-avs').checked = defaults.omitsAvs;
  document.getElementById('ag-skip-cvv').checked = defaults.skipsCvv;
  document.getElementById('ag-skip-l3').checked = defaults.skipsLevelIII;
  document.getElementById('ag-skip-l2').checked = defaults.skipsLevelII;
  document.getElementById('ag-delay').checked = defaults.delaysSettlement;
  document.getElementById('ag-bad-mcc').checked = defaults.incorrectMcc;

  runAgenticComparison(scenario);
}

function buildTransaction(scenario, isAgent) {
  const base = scenario.transaction;
  const human = scenario.humanBehavior;

  if (!isAgent) {
    // Human transaction: fully qualified
    return {
      amount: base.amount,
      network: base.network,
      cardType: base.cardType,
      entryMode: base.entryMode,
      mcc: base.mcc,
      avsResult: human.avsResult,
      cvvResult: human.cvvResult,
      authAge: human.authAge,
      salesTax: human.salesTax,
      customerCode: human.customerCode,
      merchantPostalCode: human.merchantPostalCode,
      lineItems: human.lineItems || [],
      initiationType: 'human'
    };
  }

  // Agent transaction: apply behavior toggles
  const txn = {
    amount: base.amount,
    network: base.network,
    cardType: base.cardType,
    entryMode: base.entryMode,
    mcc: base.mcc,
    initiationType: 'agent'
  };

  // Apply toggles
  txn.avsResult = document.getElementById('ag-omit-avs').checked ? 'none' : human.avsResult;
  txn.cvvResult = document.getElementById('ag-skip-cvv').checked ? 'none' : human.cvvResult;

  if (document.getElementById('ag-skip-l2').checked) {
    txn.salesTax = undefined;
    txn.customerCode = '';
    txn.merchantPostalCode = '';
  } else {
    txn.salesTax = human.salesTax;
    txn.customerCode = human.customerCode;
    txn.merchantPostalCode = human.merchantPostalCode;
  }

  if (document.getElementById('ag-skip-l3').checked) {
    txn.lineItems = [];
  } else {
    txn.lineItems = human.lineItems || [];
  }

  txn.authAge = document.getElementById('ag-delay').checked ? 72 : human.authAge;

  if (document.getElementById('ag-bad-mcc').checked) {
    txn.mcc = '5999'; // Miscellaneous retail
  }

  return txn;
}

function runAgenticComparison(scenario) {
  const humanTxn = buildTransaction(scenario, false);
  const agentTxn = buildTransaction(scenario, true);

  const humanResults = evaluateTransaction(humanTxn, INTERCHANGE_CATEGORIES);
  const agentResults = evaluateTransaction(agentTxn, INTERCHANGE_CATEGORIES);

  renderComparison(humanResults, agentResults, scenario.transaction.amount);
  renderRisks(agentResults, humanResults);
  renderGuardrails();
}

function renderComparison(humanResults, agentResults, amount) {
  const container = document.getElementById('ag-comparison-content');
  const delta = agentResults.cost - humanResults.cost;

  container.innerHTML = `
    <div class="grid-2" style="gap:12px">
      <div style="text-align:center;padding:20px;background:var(--bg-secondary);border-radius:var(--radius-sm);border:1px solid var(--accent-green)">
        <div style="font-size:20px;margin-bottom:6px">&#128100;</div>
        <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.8px">Human-Initiated</div>
        <div class="mono" style="font-size:22px;font-weight:700;color:var(--accent-green);margin-top:6px">${formatCurrency(humanResults.cost)}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${humanResults.bestCategory ? humanResults.bestCategory.name : 'N/A'}</div>
        <div style="font-size:11px;color:var(--text-muted)">${humanResults.bestCategory ? formatRate(humanResults.rate, humanResults.perTxn) : ''}</div>
      </div>
      <div style="text-align:center;padding:20px;background:var(--bg-secondary);border-radius:var(--radius-sm);border:1px solid ${delta > 0 ? 'var(--accent-red)' : 'var(--accent-green)'}">
        <div style="font-size:20px;margin-bottom:6px">&#129302;</div>
        <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.8px">Agent-Initiated</div>
        <div class="mono" style="font-size:22px;font-weight:700;color:${delta > 0 ? 'var(--accent-red)' : 'var(--accent-green)'};margin-top:6px">${formatCurrency(agentResults.cost)}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${agentResults.bestCategory ? agentResults.bestCategory.name : 'N/A'}</div>
        <div style="font-size:11px;color:var(--text-muted)">${agentResults.bestCategory ? formatRate(agentResults.rate, agentResults.perTxn) : ''}</div>
      </div>
    </div>

    ${delta > 0 ? `
      <div style="text-align:center;margin-top:16px">
        <span class="savings-badge savings-negative" style="font-size:14px;padding:8px 20px">Agent costs ${formatCurrency(delta)} more per transaction</span>
      </div>
      <div style="text-align:center;margin-top:8px;font-size:12px;color:var(--text-muted)">
        At 500 transactions/month: ${formatCurrency(delta * 500 * 12)} annual excess interchange
      </div>
    ` : `
      <div style="text-align:center;margin-top:16px">
        <span class="savings-badge savings-positive">Agent matches human cost</span>
      </div>
    `}
  `;
}

function renderRisks(agentResults, humanResults) {
  const container = document.getElementById('ag-risks-content');
  const risks = [];

  const agentFails = agentResults.fields.filter(f => f.status === 'fail');
  const agentWarns = agentResults.fields.filter(f => f.status === 'warn');

  agentFails.forEach(f => {
    // Check if this was a pass for human
    const humanField = humanResults.fields.find(h => h.name === f.name);
    if (humanField && humanField.status === 'pass') {
      risks.push({ field: f.name, severity: 'high', detail: f.detail || `${f.name} missing in agent flow but present in human flow` });
    }
  });

  agentWarns.forEach(f => {
    const humanField = humanResults.fields.find(h => h.name === f.name);
    if (humanField && humanField.status === 'pass') {
      risks.push({ field: f.name, severity: 'medium', detail: f.detail || `${f.name} degraded in agent flow` });
    }
  });

  if (risks.length === 0) {
    container.innerHTML = '<p style="font-size:13px;color:var(--accent-green)">No additional downgrade risks from agent behavior with current settings.</p>';
    return;
  }

  container.innerHTML = risks.map(r => `
    <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px">
      <span class="badge ${r.severity === 'high' ? 'badge-fail' : 'badge-warn'}">${r.severity.toUpperCase()}</span>
      <div>
        <div style="font-weight:500">${r.field}</div>
        <div style="color:var(--text-muted);margin-top:2px">${r.detail}</div>
      </div>
    </div>
  `).join('');
}

function renderGuardrails() {
  const container = document.getElementById('ag-guardrails-content');
  const toggles = {
    avs: document.getElementById('ag-omit-avs').checked,
    cvv: document.getElementById('ag-skip-cvv').checked,
    l3: document.getElementById('ag-skip-l3').checked,
    l2: document.getElementById('ag-skip-l2').checked,
    delay: document.getElementById('ag-delay').checked,
    mcc: document.getElementById('ag-bad-mcc').checked
  };

  const guardrails = [];

  if (toggles.avs) {
    guardrails.push({
      action: 'Require billing address in agent purchase flow',
      detail: 'Store billing addresses in merchant profile. Agent must pass AVS data on every authorization request.'
    });
  }

  if (toggles.cvv) {
    guardrails.push({
      action: 'Use tokenized credentials with CVV bypass',
      detail: 'For recurring agent purchases, use network tokens that satisfy CVV requirements without storing the code.'
    });
  }

  if (toggles.l3) {
    guardrails.push({
      action: 'Map product catalog to Level III fields',
      detail: 'Agent should pull SKU, description, commodity code, and UOM from product catalog. Build this into the purchase tool definition.'
    });
  }

  if (toggles.l2) {
    guardrails.push({
      action: 'Inject Level II data from order context',
      detail: 'Tax calculation, PO number, and merchant postal code should be part of the agent tool schema, not optional parameters.'
    });
  }

  if (toggles.delay) {
    guardrails.push({
      action: 'Auto-settle within 24 hours',
      detail: 'Agent should trigger batch settlement immediately after purchase confirmation. Do not wait for human review on routine orders.'
    });
  }

  if (toggles.mcc) {
    guardrails.push({
      action: 'Lock MCC to correct category',
      detail: 'Agent should not have the ability to override MCC. Set it based on the merchant profile, not the transaction type.'
    });
  }

  if (guardrails.length === 0) {
    container.innerHTML = '<p style="font-size:13px;color:var(--accent-green)">No guardrails needed. Agent behavior matches human data quality.</p>';
    return;
  }

  container.innerHTML = `
    ${guardrails.map(g => `
      <div style="padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="font-size:13px;font-weight:500;color:var(--accent-primary)">${g.action}</div>
        <div style="font-size:12px;color:var(--text-secondary);margin-top:4px">${g.detail}</div>
      </div>
    `).join('')}

    <div style="margin-top:16px;padding:12px 16px;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.15);border-radius:var(--radius-sm)">
      <div style="font-size:11px;font-weight:600;color:var(--accent-blue);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px">Visa Agentic Ready</div>
      <div style="font-size:12px;color:var(--text-secondary)">
        Visa's forthcoming Agentic Ready certification will require agents to meet minimum data quality standards for interchange qualification. Early adopters who build these guardrails now will qualify faster when the program launches.
      </div>
    </div>
  `;
}
