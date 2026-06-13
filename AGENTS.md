<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure
may all differ from your training data. Read the relevant guide in
node_modules/next/dist/docs/ before writing any code.

<!-- END:nextjs-agent-rules -->

# CarbonVerse Agent Rules

## MANDATORY: Read These Files First (in order)

Before writing ANY code, read ALL of these:

1. BRAND.md (project root) — brand identity, colors, typography
2. .agents/skills/emil-design-eng/SKILL.md — animation standards
3. .agents/skills/high-end-visual-design/SKILL.md — visual quality bar
4. .agents/skills/design-motion-principles/SKILL.md — motion rules
5. .agents/skills/brandkit/SKILL.md — brand application
6. .agents/skills/adaline/DESIGN.md — warm illustrated style reference
7. .agents/skills/seed-style/DESIGN.md — botanical warm reference
8. .agents/skills/posthog/DESIGN.md — illustrated character warmth

## Stack (locked)

- Next.js App Router, TypeScript strict
- Tailwind CSS + shadcn/ui
- Framer Motion (ALL animations)
- GSAP (background parallax only)
- Zustand (session state)
- Tone.js (sound synthesis)
- Groq SDK (server-side only)
- @lottiefiles/dotlottie-react (Lottie animations)

## Visual Identity (locked — read BRAND.md for full details)

Style: 70% Flat Illustrated Storybook + 30% Magical whimsy
NOT dark. NOT generic AI gradients. NOT corporate SaaS.
Primary bg: #FFF8E7 (warm cream)
Accent: #F4A832 (sunrise gold)
Text: #2D5016 (deep forest, never black)
Full palette in BRAND.md.

## Hard Rules

1. NEVER dark backgrounds
2. NEVER black text — use #2D5016 minimum
3. NEVER <form> tags — onClick only
4. NEVER GROQ_API_KEY in client components
5. NEVER static pages — everything breathes
6. NEVER generic gradient purple/blue AI look
7. ALWAYS read BRAND.md before any UI work
8. ALWAYS Framer Motion for component animations
9. ALWAYS skeleton loading for data-fetching components
10. ALWAYS optimistic UI — apply state before API responds
11. Every click = visible animation, no exceptions
12. Progress bars follow illusion curve (fast→slow→complete)
