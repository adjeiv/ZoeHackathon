# Zoe — React starter (hackathon)

## What this is
A working Vite + React scaffold recreating the Zoe mobile flow, ready to hand to Claude Code (or any dev) to wire up real logic, state, and backend calls.

Run it:
```
npm install
npm run dev
```

## Fidelity
High-fidelity visual recreation of the provided screens (colors, type, spacing, mascot illustration). The **flow/logic beyond onboarding is a rough draft** — the user has explicitly said the exact screen order and behavior after onboarding is open to Claude Code's judgement. Treat everything past the quiz as a starting sketch, not a spec.

## Confirmed flow
1. **Name** (`NameScreen`) — asks for the user's name.
2. **Quiz** (`QuizScreen`) — "Take a quick quiz to know your body and PMOS", 3 grouped questions with 3 options each (currently placeholder colored bars — needs real answer copy + selection state).

These two are the only confirmed-order screens. Everything after (Hear-something-new, Loading, Profile, Score, Suggestions, Home) is included as visual reference in `src/screens/` but the sequencing, navigation, and interactions are undecided — feel free to rework.

## Structure
- `src/App.jsx` — screen switcher + prev/next dev nav (temporary — replace with real routing/navigation as the flow solidifies).
- `src/screens/*.jsx` — one component per screen, plain inline styles + `index.css` tokens.
- `src/index.css` — design tokens (colors, font) as CSS variables, plus shared classes (`.card`, `.primary-btn`, `.field`).
- `src/assets/` — mascot illustration (logo, walk frame, static frame — the walk/static pair are crossfaded for the loading-screen animation).

## Design tokens
- Peach background: `#FDE7DE`
- Lavender background: `#E1DCFB`
- Coral/brand accent: `#FF5A40`
- Navy (buttons/text accents): `#241242`
- Ink (headline text): `#1a1523`
- Magenta (small accent, "OR" divider): `#E91E8C`
- Font: Plus Jakarta Sans (Google Fonts), weights 400–800

## Known gaps / TODO for Claude Code
- All quiz/profile "options" are placeholder colored bars, not real answer text or selectable inputs — needs real copy + form state.
- No real data/state management, no backend calls, no persistence.
- Navigation is a linear dev-mode next/back stepper — replace with real app navigation once flow is decided.
- Loading screen auto-advances on a timer — replace with real "fetch complete" trigger.

## Also included
An interactive HTML click-through prototype of the full flow is available in the design tool for visual reference alongside this code.
