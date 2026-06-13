# Clay

## Mission

Create implementation-ready, token-driven UI guidance for Clay that is optimized for consistency, accessibility, and fast delivery across e-commerce storefront.

## Brand

- Product/brand: Clay
- URL: https://madewithclay.org/
- Audience: online shoppers and consumers
- Product surface: e-commerce storefront

## Style Foundations

- Visual style: clean, functional, implementation-oriented
- Main font style: `font.family.primary=__HafferSQ_12ad0b`, `font.family.stack=__HafferSQ_12ad0b, __HafferSQ_Fallback_12ad0b, Helvetica, ui-sans-serif`, `font.size.base=19.2px`, `font.weight.base=400`, `font.lineHeight.base=19.2px`
- Typography scale: `font.size.xs=16.8px`, `font.size.sm=19.2px`, `font.size.md=21.6px`, `font.size.lg=28.8px`, `font.size.xl=31.2px`, `font.size.2xl=38.4px`, `font.size.3xl=76.8px`, `font.size.4xl=108px`
- Color palette: `color.text.primary=#363636`, `color.text.secondary=#ffffff`, `color.text.tertiary=#f5efeb`, `color.text.inverse=#7b7a7a`, `color.surface.base=#000000`
- Spacing scale: `space.1=6px`, `space.2=7.2px`, `space.3=9.6px`, `space.4=12px`, `space.5=13.2px`, `space.6=18px`, `space.7=20.71px`, `space.8=20.73px`
- Radius/shadow/motion tokens: `radius.xs=12px`, `radius.sm=50px` | `motion.duration.instant=750ms`

## Accessibility

- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone

Concise, confident, implementation-focused.

## Rules: Do

- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't

- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow

1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure

- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations

- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: links (4), buttons (2), inputs (2), lists (2), navigation (1).

- Extraction diagnostics: Audience and product surface inference confidence is low; verify generated brand context.

## Quality Gates

- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
