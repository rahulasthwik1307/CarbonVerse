# CarbonVerse — Brand Identity

## Project

Name: CarbonVerse: Rewrite Your Future
Tagline: Every choice writes the next chapter of your planet's story
Guide character: Verd (glowing golden-green seed orb)
Category: Interactive storytelling + carbon awareness

## Visual Philosophy

This is a STORYBOOK, not a dashboard.
70% Flat Illustrated Storybook + 30% Magical whimsy
Inspired by: PostHog's illustrated warmth, Ghibli's morning light,
paper-cut layered landscapes, interactive children's books
NOT inspired by: dark SaaS, corporate analytics, climate warning sites

## 60-30-10 Color Rule (STRICT)

60% BACKGROUND — warm cream and soft mint:
Primary bg: #FFF8E7 (warm cream — use this everywhere)
Secondary bg: #F0FAF0 (soft mint — cards, panels)
Sky top: #B8E0F7 (soft morning blue)
Sky sunrise: #FFE5A0 (golden sunrise glow)
Ground: #C8E6A0 (soft grass green)
Hills far: #A8D878 (distant hill)
Hills mid: #88C060 (middle hill)
Hills near: #6AAB45 (near hill)

30% CONTENT — sage and forest greens:
Text primary: #2D5016 (deep forest, NEVER black)
Text secondary:#4A7C2F (moss green)
Text muted: #6B8F5E (sage)
Card border: #B8D4A8 (soft green border)
Panel bg: rgba(255,255,255,0.85) (warm white glass)

10% HIGHLIGHT — gold and coral accents:
Gold primary: #F4A832 (Verd's glow, CTA buttons)
Gold light: #FFD166 (button hover, sparkles)
Coral accent: #FF6B6B (high impact warning — used rarely)
Eco green: #4CAF50 (positive choice reward)
Verd color: #7BC67E (character primary)

## Typography

Font: Plus Jakarta Sans (Google Fonts) — warm, rounded, friendly
Fallback: system-ui
Scale:
Display: 64-80px, weight 800, tracking -0.03em (chapter titles)
H1: 40-52px, weight 700, tracking -0.02em  
 H2: 28-36px, weight 600
Body: 16-18px, weight 400, line-height 1.7
Caption: 13px, weight 500, tracking 0.05em
Narrator: 20-22px, weight 300, italic, line-height 1.8
NEVER use: black color for text. Use #2D5016 minimum.
NEVER use: system default fonts. Always Plus Jakarta Sans.

## Border Radius (rounded and warm, never sharp)

Cards: 24px (rounded-3xl)
Buttons: 16px (rounded-2xl)
Badges: 999px (fully rounded pills)
Inputs: 12px (rounded-xl)

## Shadows (warm, soft, NO cold grays)

Card shadow: 0 4px 24px rgba(45,80,22,0.08)
Card hover: 0 12px 40px rgba(45,80,22,0.15)
Button glow: 0 0 20px rgba(244,168,50,0.4)
Verd glow: 0 0 30px rgba(123,198,126,0.6)
Panel: 0 2px 16px rgba(45,80,22,0.06)

## Animation Rules (Emil Kowalski standards)

Max UI animation: 300ms
Easing out: cubic-bezier(0.23, 1, 0.32, 1) ← use for enters
Easing in-out: cubic-bezier(0.77, 0, 0.175, 1) ← use for movement
Spring: stiffness 300, damping 25 ← use for cards
NEVER: ease-in (feels sluggish)
NEVER: linear (feels robotic)
NEVER: animate color directly (use opacity + transform only)

Decision sequence timing:

1. Card press: 80ms ease-out
2. Card expand: 150ms spring
3. World update: 400ms ease-in-out
4. Narration fade: 200ms ease-out
5. Next cards enter: 200ms staggered (50ms between each)

## Optimistic UI Rules

Every user click must feel INSTANT:

- Apply state change immediately (before API responds)
- Start animation at click moment (not after API)
- API response only affects narration text
- If API fails: smoothly revert with kind error message

## Progress Illusion Pattern

Loading bars always follow this curve:
0-60%: Fast (600ms) — feels responsive
60-85%: Medium (800ms) — feels like processing  
85-99%: Slow (1200ms) — almost there...
99-100%: Only on actual completion
Never show 100% before task completes.

## Skeleton Loading

Every component that loads data shows skeleton first.
Skeleton color: #E8F5E3 (soft mint, NOT gray)
Skeleton shimmer: left-to-right, warm cream to white
Duration: 1.5s infinite

## Component Identity

Glass panels:
background: rgba(255,255,255,0.85)
backdrop-filter: blur(12px)
border: 1px solid rgba(184,212,168,0.6)
border-radius: 24px

Decision cards:
background: white
border: 2px solid #B8D4A8
border-radius: 24px
shadow: card shadow above
hover: translateY(-4px) + card hover shadow
selected: border-color #4CAF50, bg #F0FAF0

Verd character:
Shape: 32px circle, golden-green gradient
Glow: Verd glow shadow above
Animation: translateY -8px to 0px, 3s ease-in-out infinite
Leaves: 2 tiny SVG leaves on top, sway gently
Reaction: scale 1.2 pulse on eco choice, dim to 0.7 on high impact

## World State → Visual Mapping

skyQuality 80-100: sky #B8E0F7 clear blue + #FFE5A0 sunrise
skyQuality 50-80: sky #D4E8C2 soft green-blue (stable)
skyQuality 20-50: sky #E8D4A0 hazy golden-brown
skyQuality 0-20: sky #C4A882 smoggy orange-brown

treeDensity 80-100: hills lush #6AAB45, full of trees
treeDensity 40-80: hills medium green #88C060
treeDensity 0-40: hills sparse #A89060 (dry)

planetMood colors:
Thriving: gold glow, bright sky, many birds
Stable: soft mint, calm sky, few birds  
 Recovering: warm glow, clearing sky, growing trees
Under Stress: hazy brown, no birds, sparse hills

## What NEVER to build

- Dark backgrounds of any kind
- Charts, graphs, pie charts as primary UI
- Form-heavy screens (use card choices instead)
- Corporate or clinical looking layouts
- Pure black text (#000000)
- Generic gradient purple/blue AI look
- Identical-height cards in a boring grid
- Static pages (everything must breathe)
