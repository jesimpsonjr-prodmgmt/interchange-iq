# InterchangeIQ -- Specification

**Version:** 1.0
**Author:** John Simpson
**Date:** 2026-05-08
**Status:** Draft

---

## 1. Objective

Build a guided, interactive portfolio demo that showcases InterchangeIQ: an intelligent payment cost optimization platform. The demo runs entirely in the browser, uses synthetic transaction data, and is hosted on GitHub Pages at johnsimpson.io.

The demo proves product thinking and deep payments domain expertise by letting visitors interact with six core tools that represent the platform's four pillars: pre-flight data validation, downgrade detection, intelligent routing, and emerging payment rail evaluation.

**Target audience for the demo:** Hiring managers, product leaders, and payments industry peers evaluating John Simpson's portfolio. The demo should feel like a real product, not a toy.

**Success criteria:**
- Visitor can complete a guided walkthrough of all six tools in under 10 minutes
- Each tool demonstrates a distinct interchange optimization concept with real Visa/Mastercard rules
- The demo communicates domain expertise through contextual explanations, not walls of text
- Runs on GitHub Pages with no backend, no API keys, no build step

---

## 2. Features

Six interactive tools, each mapped to a product pillar:

### 2.1 Transaction Validator (Pillar 1)

**What it does:** User enters or selects a sample transaction. The validator checks all fields against interchange qualification rules and reports which fields pass, which fail, and what interchange category the transaction would qualify for.

**Inputs:**
- Transaction amount, currency
- Card type (Visa, Mastercard, Amex, Discover)
- Card product (consumer credit, commercial, purchasing, regulated debit, etc.)
- Entry mode (swiped, keyed, e-commerce, contactless)
- MCC code
- Level II fields (sales tax, customer code, merchant postal code)
- Level III line items (SKU, description, quantity, unit price, unit of measure, commodity code)
- AVS result, CVV result
- Authorization age (hours since auth)
- Initiation type (human or agent)

**Outputs:**
- Field-by-field validation results (pass/warn/fail with explanations)
- Predicted interchange category and rate
- Estimated cost on a sample transaction amount
- Specific recommendations to fix failing fields

**Guided demo behavior:** Pre-loaded with 3-4 scenario buttons (e.g., "Perfect B2B transaction," "Missing Level III data," "Stale authorization," "Agent-initiated purchase") that populate the form and show contrasting results.

### 2.2 Downgrade Simulator (Pillar 2)

**What it does:** Shows how removing or degrading specific data fields causes a transaction to "fall" through interchange qualification tiers, with cost impact at each level.

**Inputs:**
- A fully-qualified transaction (pre-populated)
- Toggle switches to remove individual fields or introduce data quality issues

**Outputs:**
- Visual waterfall showing the transaction moving through interchange tiers as fields are removed
- Dollar cost at each tier
- Cumulative annual cost impact extrapolated from a configurable monthly volume
- Root cause attribution (which system layer likely caused the issue: POS, gateway, processor, or ERP)

**Guided demo behavior:** A "Tell me a story" mode that walks through a realistic scenario: "Your POS vendor pushed a firmware update that stopped sending sales tax. Here is what happened to your interchange costs over the next 30 days."

### 2.3 Routing Comparison Calculator (Pillar 3)

**What it does:** Takes a transaction profile and compares total cost across 2-3 simulated processor configurations and payment rails.

**Inputs:**
- Transaction type and amount
- Card product
- Processor profiles (pre-configured with different interchange passthrough rates, per-transaction fees, and network fee structures)
- Optional: alternative rail (ACH, RTP, stablecoin)

**Outputs:**
- Side-by-side cost breakdown per processor/rail: interchange, network fees, processor markup, total
- Savings delta between options
- Annual savings projection at configurable volume
- Recommendation with rationale

**Guided demo behavior:** Pre-loaded comparison: "Same $25,000 B2B invoice across three options: commercial card via Processor A, commercial card via Processor B, ACH payment."

### 2.4 CEDP Readiness Checker (Pillar 1)

**What it does:** Evaluates whether a transaction's Level III data would pass Visa's Commercial Enhanced Data Program (CEDP) AI-driven audit, reflecting the April 2026 changes.

**Inputs:**
- Level III line items with all fields
- Data quality indicators (are values real or templated/placeholder?)

**Outputs:**
- CEDP compliance score
- Field-by-field assessment against CEDP requirements
- Flags for common CEDP failures: placeholder commodity codes, zero-value line items, mismatched totals, templated descriptions
- "Verified merchant" progress tracker (simulated): shows how many compliant transactions toward the 500-transaction or 20-day threshold

**Guided demo behavior:** Two side-by-side examples: one with real line-item data that passes CEDP, one with templated data that Visa's AI audit would reject. Contextual explainer about the April 2026 Level 2 retirement.

### 2.5 Interchange Rate Lookup (Reference)

**What it does:** Searchable reference table of 30-50 common Visa and Mastercard interchange categories.

**Inputs:**
- Filter by: network, card type, entry mode, merchant category, transaction type

**Outputs:**
- Matching interchange categories with rate (percentage + per-transaction fee)
- Qualification requirements for each category
- Common downgrade paths (what happens if you miss qualification)

**Guided demo behavior:** Highlight the most impactful categories for mid-market merchants. Show the spread between best-case and worst-case rates for common transaction profiles.

### 2.6 Agentic Commerce Risk Simulator (Pillar 4)

**What it does:** Demonstrates how AI agent-initiated transactions introduce new interchange downgrade risks compared to human-initiated flows.

**Inputs:**
- Transaction scenario (B2C purchase, B2B procurement, subscription renewal)
- Initiation type toggle: human vs. AI agent
- Agent behavior toggles: omits AVS, skips Level III, delays settlement, uses incorrect MCC

**Outputs:**
- Side-by-side comparison: human-initiated vs. agent-initiated cost
- Specific downgrade risks introduced by the agent flow
- Recommendations for agent-initiated transaction guardrails
- Context on Visa's Agentic Ready program and why this matters

**Guided demo behavior:** Walk through a scenario: "An AI purchasing agent buys $10,000 in office supplies on a corporate card. Here is what happens when the agent skips Level III data."

---

## 3. Project Structure

```
interchange-iq/
  index.html          # Main entry point, app shell, navigation
  css/
    styles.css        # All styles
  js/
    app.js            # App initialization, routing, guided tour
    validator.js      # Transaction Validator logic and UI
    downgrade.js      # Downgrade Simulator logic and UI
    routing.js        # Routing Comparison Calculator logic and UI
    cedp.js           # CEDP Readiness Checker logic and UI
    lookup.js         # Interchange Rate Lookup logic and UI
    agentic.js        # Agentic Commerce Risk Simulator logic and UI
    data/
      interchange-tables.js   # Visa/MC rate tables (30-50 categories)
      scenarios.js            # Pre-built demo scenarios
      processors.js           # Simulated processor profiles
  assets/
    favicon.ico
  SPEC.md
  README.md
```

All files are static. No build step. GitHub Pages serves `index.html` from the repo root.

---

## 4. Code Style

- **HTML:** Semantic HTML5. No framework. Minimal inline styles.
- **CSS:** Custom properties for theming. Mobile-responsive. No CSS framework. Clean, professional fintech aesthetic with a unique visual identity. No gradients-on-everything SaaS look.
- **JavaScript:** Vanilla ES6+ modules (`type="module"` in script tags). No framework, no bundler, no transpiler. Strict mode. JSDoc comments on public functions only where the name is not self-explanatory.
- **Naming:** camelCase for JS variables and functions. kebab-case for CSS classes and file names. UPPER_SNAKE_CASE for constants.
- **Writing style:** No em-dashes. No AI-phrasing ("sits at the intersection of," "leverages," "harnesses the power of"). Write like a payments professional, not a marketing deck. Direct, precise, technical where appropriate, plain where possible.
- **Data:** All interchange rates, rules, and scenarios are defined in JS data files. No external API calls. No hardcoded values scattered across UI code.
- **Accessibility:** ARIA labels on interactive elements. Keyboard-navigable. Sufficient color contrast.

---

## 5. Testing Strategy

Since this is a client-side demo with no build step, testing is manual and visual:

- **Functional:** Each of the six tools produces correct output for all pre-built scenarios. Changing inputs changes outputs. No console errors.
- **Cross-browser:** Works in Chrome, Firefox, Safari (latest versions). No IE support.
- **Responsive:** Usable on tablet and desktop. Mobile is acceptable but not optimized (portfolio visitors are overwhelmingly on desktop).
- **Guided tour:** The walkthrough completes without errors and covers all six tools.
- **Data accuracy:** Interchange rates match published April 2026 Visa and Mastercard schedules for the included categories. CEDP rules reflect the April 2026 changes.
- **Performance:** Page loads in under 2 seconds on a typical connection. No perceptible lag on interactions.

---

## 6. Boundaries

### Always Do
- Use real, published interchange rates and network rules. The demo's credibility depends on accuracy.
- Provide contextual explanations that teach the visitor something about interchange. This is a portfolio piece -- it should demonstrate expertise.
- Keep the guided tour as the primary interaction mode. Visitors should not need to figure out what to do.
- Attribute AI-assisted code. Product thinking, domain logic, and strategic commentary are John's.

### Ask First
- Before adding any dependency or build tool
- Before changing the single-repo, static-file architecture
- Before adding any feature not listed in this spec
- Before making design decisions that significantly change the visual direction

### Never Do
- Use real card numbers, PANs, or BINs that could be mistaken for real payment data
- Make external API calls or require any backend service
- Use em-dashes or AI-phrasing in any user-facing copy
- Add PCI-scoped functionality or suggest the demo handles real payment data
- Over-explain obvious things in the UI. Trust the visitor's intelligence.
