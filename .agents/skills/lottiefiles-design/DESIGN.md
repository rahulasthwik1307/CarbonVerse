# LottieFiles: Download Free lightweight animations for website & apps.

## Mission
Create implementation-ready, token-driven UI guidance for LottieFiles: Download Free lightweight animations for website & apps. that is optimized for consistency, accessibility, and fast delivery across marketing site.

## Brand
- Product/brand: LottieFiles: Download Free lightweight animations for website & apps.
- URL: https://lottiefiles.com/
- Audience: buyers, teams, and decision-makers
- Product surface: marketing site

## Style Foundations
- Visual style: structured, tokenized, content-first
- Main font style: `font.family.primary=Inter`, `font.family.stack=Inter, sans-serif`, `font.size.base=16px`, `font.weight.base=400`, `font.lineHeight.base=24px`
- Typography scale: `font.size.xs=14px`, `font.size.sm=16px`, `font.size.md=20px`, `font.size.lg=24px`, `font.size.xl=32px`, `font.size.2xl=48px`, `font.size.3xl=64px`, `font.size.4xl=96px`
- Color palette: `color.text.primary=oklch(0.141 0.005 285.823)`, `color.text.secondary=oklch(0.705 0.015 286.067)`, `color.text.tertiary=oklch(0.552 0.016 285.938)`, `color.text.inverse=oklch(0.985 0 0)`, `color.surface.base=#000000`, `color.surface.muted=oklch(0.967 0.001 286.375)`, `color.surface.raised=oklch(0.626 0.11 185.333)`, `color.surface.strong=oklch(1 0 0)`, `color.border.default=oklch(0.92 0.004 286.32)`, `color.focus.ring=oklab(0.21 0.00164225 -0.00577088 / 0.5)`
- Spacing scale: `space.1=8px`, `space.2=12px`, `space.3=16px`, `space.4=20px`, `space.5=24px`, `space.6=32px`, `space.7=40px`, `space.8=48px`
- Radius/shadow/motion tokens: `radius.xs=6px`, `radius.sm=8px`, `radius.md=12px`, `radius.lg=16px` | `shadow.1=rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px` | `motion.duration.instant=150ms`, `motion.duration.fast=300ms`

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
- Include known page component density: links (204), buttons (57), lists (7), inputs (1), navigation (1).


## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
