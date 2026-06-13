---
name: design-system-the-ai-presentation-workspace
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

<!-- TYPEUI_SH_MANAGED_START -->

# The AI presentation workspace

## Mission
Deliver implementation-ready design-system guidance for The AI presentation workspace that can be applied consistently across marketing site interfaces.

## Brand
- Product/brand: The AI presentation workspace
- URL: https://pitch.com/
- Audience: buyers, teams, and decision-makers
- Product surface: marketing site

## Style Foundations
- Visual style: structured, accessible, implementation-first
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
concise, confident, implementation-focused

## Rules: Do
- Use semantic tokens, not raw hex values in component guidance.
- Every component must define required states: default, hover, focus-visible, active, disabled, loading, error.
- Responsive behavior and edge-case handling should be specified for every component family.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and tokens.
3. Define component anatomy, variants, and interactions.
4. Add accessibility acceptance criteria.
5. Add anti-patterns and migration notes.
6. End with QA checklist.

## Required Output Structure
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Prefer system consistency over local visual exceptions.

<!-- TYPEUI_SH_MANAGED_END -->
