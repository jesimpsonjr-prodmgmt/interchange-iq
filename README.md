# InterchangeIQ

**An interactive interchange fee optimization platform demo for [johnsimpson.io](https://johnsimpson.io)**

## Problem Statement

Mid-market merchants overpay on interchange by 15-40 basis points because they lack visibility into qualification rules, downgrade causes, and processor pricing differences. The tools to diagnose these problems exist inside enterprise payment platforms, but they are locked behind six-figure contracts and consultant engagements. InterchangeIQ makes interchange optimization concepts tangible and interactive.

## Target User

Payment operations teams at mid-market merchants ($10M-$500M annual card volume) who process a mix of consumer and commercial card transactions. Secondary audience: product managers evaluating payments infrastructure, and hiring managers reviewing John Simpson's portfolio.

## Product Decisions

**Built:** Six tools covering four optimization pillars.

1. **Transaction Validator** -- Field-by-field interchange qualification check. Shows exactly why a transaction lands at a given rate.
2. **Downgrade Simulator** -- Toggle data fields off and watch cost cascade through tiers. Includes a narrative mode that tells a real-world downgrade story.
3. **Routing Comparison Calculator** -- Side-by-side cost comparison across processors and payment rails. Breaks down interchange, network fees, and processor markup separately.
4. **CEDP Readiness Checker** -- Evaluates Level III data against Visa's April 2026 AI-driven Commercial Enhanced Data Program rules. Side-by-side pass/fail comparison.
5. **Interchange Rate Lookup** -- Searchable reference of 50 Visa and Mastercard interchange categories with qualification rules, downgrade paths, and cost calculations.
6. **Agentic Commerce Risk Simulator** -- Compares human-initiated vs. AI agent-initiated transaction costs. Quantifies the interchange impact of agent shortcuts.

**Excluded:** Real-time BIN lookup (would require API), actual processor integrations, PCI-scoped functionality, multi-currency support. These are out of scope for a portfolio demo and would require production infrastructure.

**Guided Tour:** The primary interaction mode. A 17-step walkthrough covers all six tools with pre-loaded scenarios. Visitors who do not want the tour can explore tools independently via tab navigation.

## Architecture Decisions

- **Client-side only.** No backend, no API keys, no build step. Runs on GitHub Pages from static files.
- **Multi-file structure.** Separate JS modules for each tool, shared data files, extracted CSS. Chosen over single-file for maintainability given the scope (6 tools, 50+ interchange categories, multiple scenarios).
- **ES6 modules with no bundler.** `type="module"` script tags. Browsers handle module resolution natively.
- **Chart.js via CDN** for cost comparison visualizations. Same library used across other portfolio demos for consistency.
- **Synthetic data reflecting real rules.** 50 interchange categories based on published April 2026 Visa and Mastercard rate schedules. Rates, qualification rules, and downgrade paths are accurate. No real card numbers or BINs.

## Domain Context

Interchange is the fee a merchant's bank (acquirer) pays the cardholder's bank (issuer) on every card transaction. It is the largest component of card acceptance cost, typically 70-80% of the total. The rate depends on: card type (consumer, commercial, purchasing, debit), data quality (Level I/II/III), entry mode (chip, e-commerce, keyed), settlement timing, and merchant category.

Key concepts demonstrated in this demo:

- **Downgrade cascade:** When a transaction fails qualification for its best-fit category, it falls to progressively more expensive tiers. A missing sales tax field on a $5,000 commercial card transaction can cost an extra $42.50.
- **Level III data:** Line-item detail (SKU, description, quantity, unit price, commodity code) that reduces commercial card interchange by 40-85 basis points. Most merchants either do not send it or send placeholder data that fails network audits.
- **CEDP (April 2026):** Visa replaced manual sampling with AI-driven validation of Level III data. Templated descriptions and placeholder commodity codes that passed for years now trigger automatic downgrades.
- **Agentic commerce risk:** AI agents initiating purchases tend to skip AVS, CVV, and Level III data because agent frameworks prioritize task completion over payment data quality. This creates a new category of interchange cost exposure.

## File Structure

```
interchange-iq/
  index.html              # App shell, header, hero, tab nav, footer
  css/styles.css          # Theme, layout, components, responsive
  js/
    app.js                # Init, tab switching, guided tour
    utils.js              # Shared qualification engine, format helpers
    validator.js          # Tool 1: Transaction Validator
    downgrade.js          # Tool 2: Downgrade Simulator
    routing.js            # Tool 3: Routing Comparison Calculator
    cedp.js               # Tool 4: CEDP Readiness Checker
    lookup.js             # Tool 5: Interchange Rate Lookup
    agentic.js            # Tool 6: Agentic Commerce Risk Simulator
    data/
      interchange-tables.js  # 50 Visa/MC categories
      scenarios.js           # Pre-built scenarios + tour steps
      processors.js          # Simulated processor profiles
  SPEC.md                 # Full specification
  README.md               # This file
```

## Running Locally

```bash
cd interchange-iq
python3 -m http.server 8080
# Open http://localhost:8080
```

No npm, no build, no dependencies beyond Chart.js (loaded via CDN).

---

Built by John Simpson. Senior Product Manager. 20 years in enterprise fintech and payments.

Code is AI-assisted. Product thinking, domain expertise, and strategic commentary are mine.
