'use strict';

import { initLookup } from './lookup.js';
import { initValidator } from './validator.js';
import { initDowngrade } from './downgrade.js';
import { initRouting } from './routing.js';
import { initCedp } from './cedp.js';
import { initAgentic } from './agentic.js';
import { TOUR_STEPS } from './data/scenarios.js';

// ============ TAB SWITCHING ============

function showSection(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const isActive = btn.dataset.tab === tabId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive);
  });

  document.querySelectorAll('.tool-section').forEach(section => {
    section.classList.toggle('active', section.id === `section-${tabId}`);
  });
}

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.tab));
  });

  const tabList = document.querySelector('.tab-nav');
  tabList.addEventListener('keydown', (e) => {
    const tabs = [...tabList.querySelectorAll('.tab-btn')];
    const current = tabs.findIndex(t => t.classList.contains('active'));
    let next = current;

    if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    else return;

    e.preventDefault();
    tabs[next].focus();
    tabs[next].click();
  });
}

// ============ GUIDED TOUR ============

class GuidedTour {
  constructor(steps) {
    this.steps = steps;
    this.currentStep = 0;
    this.active = false;

    this.overlay = document.getElementById('tour-overlay');
    this.tooltip = document.getElementById('tour-tooltip');
    this.titleEl = document.getElementById('tour-title');
    this.bodyEl = document.getElementById('tour-body');
    this.progressEl = document.getElementById('tour-progress');
    this.nextBtn = document.getElementById('tour-next');
    this.backBtn = document.getElementById('tour-back');
    this.skipBtn = document.getElementById('tour-skip');

    this.nextBtn.addEventListener('click', () => this.next());
    this.backBtn.addEventListener('click', () => this.back());
    this.skipBtn.addEventListener('click', () => this.end());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.active) this.end();
    });
  }

  start() {
    this.currentStep = 0;
    this.active = true;
    this.overlay.classList.add('active');
    this.overlay.setAttribute('aria-hidden', 'false');
    this.renderStep();
  }

  next() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.renderStep();
    } else {
      this.end();
    }
  }

  back() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.renderStep();
    }
  }

  end() {
    this.active = false;
    this.overlay.classList.remove('active');
    this.overlay.setAttribute('aria-hidden', 'true');
  }

  renderStep() {
    const step = this.steps[this.currentStep];

    if (step.tab) {
      showSection(step.tab);
    }

    if (step.action) {
      setTimeout(() => step.action(), 100);
    }

    this.titleEl.textContent = step.title;
    this.bodyEl.textContent = step.body;
    this.progressEl.textContent = `Step ${this.currentStep + 1} of ${this.steps.length}`;

    this.backBtn.style.display = this.currentStep === 0 ? 'none' : '';
    this.nextBtn.textContent = this.currentStep === this.steps.length - 1 ? 'Finish' : 'Next';

    if (step.target) {
      const target = document.querySelector(step.target);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => this.positionTooltip(target), 300);
        return;
      }
    }

    this.tooltip.style.top = '50%';
    this.tooltip.style.left = '50%';
    this.tooltip.style.transform = 'translate(-50%, -50%)';
  }

  positionTooltip(target) {
    const rect = target.getBoundingClientRect();
    const tooltipHeight = this.tooltip.offsetHeight;
    const viewportHeight = window.innerHeight;

    let top = rect.bottom + 16;
    if (top + tooltipHeight > viewportHeight - 20) {
      top = rect.top - tooltipHeight - 16;
    }
    top = Math.max(20, Math.min(top, viewportHeight - tooltipHeight - 20));

    this.tooltip.style.top = `${top}px`;
    this.tooltip.style.left = '50%';
    this.tooltip.style.transform = 'translateX(-50%)';
  }
}

// ============ INIT ============

let tour;

function init() {
  initTabs();

  // Wire up tour first so it works even if a tool init fails
  tour = new GuidedTour(TOUR_STEPS);

  const startTour = () => {
    dismissTourPrompt();
    tour.start();
  };

  document.getElementById('start-tour-btn').addEventListener('click', startTour);
  document.getElementById('tour-prompt-start').addEventListener('click', startTour);
  document.getElementById('tour-prompt-close').addEventListener('click', dismissTourPrompt);

  // Init each tool independently so one failure does not block the rest
  const tools = [
    ['Lookup', initLookup],
    ['Validator', initValidator],
    ['Downgrade', initDowngrade],
    ['Routing', initRouting],
    ['CEDP', initCedp],
    ['Agentic', initAgentic]
  ];

  for (const [name, fn] of tools) {
    try {
      fn();
    } catch (e) {
      console.error(`Failed to init ${name}:`, e);
    }
  }

  if (new URLSearchParams(window.location.search).get('tour') === '1') {
    setTimeout(startTour, 500);
  }
}

function dismissTourPrompt() {
  const prompt = document.getElementById('tour-prompt');
  if (prompt) prompt.classList.add('dismissed');
}

document.addEventListener('DOMContentLoaded', init);
