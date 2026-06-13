# The AI presentation workspace

## Mission
Create implementation-ready, token-driven UI guidance for The AI presentation workspace that is optimized for consistency, accessibility, and fast delivery across marketing site.

## Brand
- Product/brand: The AI presentation workspace
- URL: https://pitch.com/
- Audience: buyers, teams, and decision-makers
- Product surface: marketing site

## Style Foundations
- Visual style: clean, functional, implementation-oriented
- Main font style: `font.family.primary=Eina 03 Regular`, `font.family.stack=Eina 03 Regular, Eina 03 Regular Placeholder, sans-serif`, `font.size.base=16px`, `font.weight.base=400`, `font.lineHeight.base=25.6px`
- Typography scale: `font.size.xs=12px`, `font.size.sm=14px`, `font.size.md=16px`, `font.size.lg=20px`, `font.size.xl=28px`, `font.size.2xl=32px`, `font.size.3xl=48px`, `font.size.4xl=64px`
- Color palette: `color.text.primary=#0c021c`, `color.text.secondary=#ffffff`, `color.text.tertiary=#0000ee`, `color.text.inverse=#5318eb`, `color.surface.base=#000000`, `color.surface.muted=#f6f6f6`, `color.surface.raised=#ebe3fe`
- Spacing scale: `space.1=10px`, `space.2=12px`, `space.3=16px`, `space.4=20px`, `space.5=24px`
- Radius/shadow/motion tokens: `radius.xs=4px`, `radius.sm=30px`, `radius.md=40px`, `radius.lg=70px` | `motion.duration.instant=120ms`

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
- Include known page component density: links (95), lists (10), buttons (4), inputs (1), navigation (1).


## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
