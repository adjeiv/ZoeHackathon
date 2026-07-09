# Handoff: ZoeCheck — Health Claim Fact-Checker (Streamlit → React)

## Overview
ZoeCheck lets people fact-check "wild health claims" against peer-reviewed research. A user submits a claim (by typing, recording audio, uploading a photo/video, or pasting a video link), the app processes it, and returns a clear verdict with a confidence score, plain-English explanation, and credibility-tagged sources. This package covers a polished redesign of the existing Streamlit app, intended to be rebuilt as a professional React application.

The design also includes a **Claims history** view and a **Personalisation** view (personal info that tailors results), both reached from the header menu.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype showing the intended look, layout, and behavior. They are **not production code to copy directly**. The runtime (`support.js`) is a lightweight prototyping framework; **do not port it**.

The task is to **recreate these designs in a real React codebase** (e.g. Vite + React or Next.js) using standard, idiomatic patterns (`useState`/`useEffect`, component files, CSS Modules / Tailwind / styled-components — whatever the target codebase prefers). Replace the existing Streamlit front end. The Python backend (transcription, claim extraction, evidence retrieval) can stay and be exposed as an API the React app calls.

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, and interactions are final. Recreate the UI to match. Exact tokens are listed at the bottom.

> Note: The prototype contains **two visual options** toggled by a floating "Design option" switcher (A · Playful, B · Credible). **Ship Option A (Playful).** The switcher and Option-B code are prototype-only and should be dropped. All measurements below describe Option A.

---

## Screens / Views

The app is a single centered column, `max-width: 600px`, horizontally centered on a full-height page. Page background is brand yellow `#FFD100`. Body font `Figtree`; display/headings `Fredoka`; monospace timers `Space Mono`. Persistent header at top on every screen.

### Header (persistent)
- Left: logo lockup — a stylized pink italic "z" glyph with two googly eyes, next to wordmark "ZoeCheck" (`Fredoka` 600, 23px, letter-spacing -0.3px).
- Right: round hamburger button — purple `#7C4DFF`, white `☰`, 52×38px, border-radius 22px. Hover: `brightness(1.08)`.
- Clicking the hamburger opens a **dropdown menu** (absolute, below the button, right-aligned): white card, width 250px, border-radius 16px, 1.5px border `rgba(0,0,0,0.10)`, shadow `0 18px 44px rgba(0,0,0,0.20)`, 7px padding. Three items (each: flex row, gap 12px, 12px padding, radius 11px, `Figtree` 600 15px, hover bg `rgba(0,0,0,0.06)`):
  1. `✧ New check` → resets and returns to Home
  2. `🕘 Claims history` → History screen
  3. `⚙ Personalisation` → Personalisation screen
- A transparent full-viewport overlay behind the menu closes it on outside click.

### 1. Home
- **Purpose:** submit a claim to check.
- **Layout:** centered column. Large animated mascot (see Assets) ~150×130px, gently bobbing. Headline `Fredoka` 700, 52px, line-height 1.02, centered: "Hear some wild health claims?". Subhead `Figtree`, 18px, color `#7a6a1e`, centered, max-width 400px: "Check it against real, peer-reviewed science — in seconds."
- **Input methods** (stacked, gap 22px). Each has a section label in `Fredoka` 600, 13px, letter-spacing 1.5px, color pink `#DB2A87`:
  - **PASTE IT HERE** — auto-growing textarea. Fill: light yellow `#FFF0A8`, 1.5px border `rgba(0,0,0,0.10)`, radius 16px, padding 18px, font 16.5px, soft shadow `0 6px 20px rgba(0,0,0,0.05)`. Focus: border → `#7C4DFF`. Placeholder: "e.g. Eating after 8pm makes you gain weight…"
  - **OR TAP TO RECORD** — dark bar (`#26232E`, radius 16px). Round mic button (46px circle): idle purple `#7C4DFF`, recording red `#EA3A5B`. A 26-bar waveform (white bars) that animates (`scaleY`) only while recording. Monospace timer `mm:ss` on the right (`Space Mono` 15px, white 85%).
  - **OR UPLOAD A PHOTO OR VIDEO** — light-yellow `#FFF0A8` box, 1.5px **dashed** border `rgba(0,0,0,0.20)`, radius 16px. Purple "↑ Upload" button + helper text "Drop a screenshot or clip — MP3, WAV, M4A, MP4, PNG. Up to 200MB." (color `#7a6a1e`).
  - Text link: "› 🔗 or check a video link".
- **Primary button** "Check the claim ✨" — full width, purple `#7C4DFF`, white text, `Fredoka` 600 20px, radius 18px, padding 19px, shadow `0 12px 28px rgba(124,77,255,0.32)`. Hover: `brightness(1.07)` + `translateY(-1px)`. → Processing.
- **Trust row** (wrapping, centered, gap 10px): three pills, bg `rgba(0,0,0,0.06)`, `Figtree` 600 13.5px, color `#7a6a1e`, each with a pink `✓`: "Peer-reviewed sources", "Nothing is stored", "Not medical advice".

### 2. Processing
- **Purpose:** loading state while the claim is analyzed.
- Centered mascot bobbing faster, with the magnifier ring **spinning** (`rotate` 2.2s linear infinite).
- Heading `Fredoka` 600 30px: "On the case…"
- Cycling status line (`Figtree` 17px, color `#7a6a1e`), advancing ~every 820ms through: "Transcribing what you shared…", "Isolating the exact claim…", "Searching peer-reviewed research…", "Weighing the evidence…".
- Progress bar: track bg `rgba(0,0,0,0.06)`, fill purple, animates 0→100% over 3s, then → Results.
- In the prototype this is a fixed 3s timer; in production, drive it from the real backend request lifecycle.

### 3. Results
- **Purpose:** show the verdict. Enters with a `fadeUp` animation.
- **Verdict card** — fill light yellow `#FFF0A8`, 1.5px border, radius 24px, padding 26px 24px, shadow `0 20px 50px rgba(0,0,0,0.08)`:
  - Top row: verdict tag pill (bg = verdict color, white, `Fredoka` 600 13px, e.g. "MYTH") + "82% confidence" (`Figtree` 700 15px, color `#7a6a1e`).
  - "The claim" label + the claim quoted (`Fredoka` 500 22px).
  - Verdict heading `Fredoka` 700 28px, colored by verdict (e.g. "Mostly a myth" in pink).
  - **Verdict scale:** 10px-tall bar with gradient `linear-gradient(90deg, <verdictColor>, #E0A33B 55%, #1E9E5A)` and a white circular marker (20px, 4px border in verdict color) positioned at `truthScore%` (myth ≈ 20%). Labels below: "Myth", "Needs context", "True".
  - Summary paragraph (`Figtree` 16.5px, line-height 1.55).
  - "WHAT THE SCIENCE SAYS" label (pink) + bullet list; each bullet a purple `●` + text.
- **Sources card** — fill light yellow `#FFF0A8`, radius 24px, padding 22px 24px, shadow `0 12px 30px rgba(0,0,0,0.05)`, margin-top 16px:
  - Title "Sources · N references".
  - Each source is a **white** row (`#FFFFFF`, 1.5px border, radius 14px, padding 13px 15px; hover border → purple): a rounded icon tile (bg `rgba(0,0,0,0.06)`), name (`Figtree` 700 15px) + note (13px, e.g. "Meta-analysis · 2022"), and a credibility tag pill on the right (pink text on `rgba(0,0,0,0.06)`, e.g. "PEER-REVIEWED", "INSTITUTIONAL").
- **Footer buttons** (flex, gap 12px): "Check another" (purple, full width, → Home) + "Share ↗" (white, bordered).
- Fine print, centered, 12.5px: "ZoeCheck is an educational tool, not medical advice."

### 4. Claims history
- **Purpose:** list of past checks (stored per-device).
- "‹ Back" text button → Home. Title `Fredoka` 700 38px "Claims history". Subhead: "Everything you've checked, saved on this device."
- List of rows (gap 12px). Each row is a **white** card (radius 16px, 1.5px border, padding 16px 18px, shadow `0 6px 18px rgba(0,0,0,0.05)`, hover: border → purple + `translateY(-1px)`): claim text (`Fredoka` 500 16px) + date (13px, `#7a6a1e`) on the left; a colored verdict pill + `›` chevron on the right. Verdict pill color follows the verdict (myth = pink, needs context = `#E0A33B`, supported/true = `#1E9E5A`). Clicking a row opens its result.
- Sample data used: "Eating after 8pm makes you gain weight" (MYTH, Today); "You must drink 8 glasses of water a day" (NEEDS CONTEXT, Yesterday); "Creatine is safe for healthy adults" (SUPPORTED, 2 days ago); "Detox teas cleanse your liver" (MYTH, 4 days ago); "Vitamin C prevents the common cold" (MOSTLY MYTH, Last week).

### 5. Personalisation
- **Purpose:** capture personal info that tailors how results are explained.
- "‹ Back" → Home. Title `Fredoka` 700 38px "Personalisation". Subhead: "Tell us a bit about you so ZoeCheck can tailor its answers to your body and goals."
- Privacy note box (light-yellow `#FFF0A8`, radius 14px, padding 14px 16px, `🔒` + 14px text): "This stays on your device and is never shared. It only shapes how results are explained — never medical advice."
- **Form card** — fill light yellow `#FFF0A8`, radius 22px, padding 24px, shadow `0 12px 30px rgba(0,0,0,0.05)`, fields gap 24px. Each field has a label `Figtree` 700 13.5px, color `#7a6a1e`:
  - **Age** — number input, **white** fill, width 140px, radius 12px.
  - **Biological sex** — chip group (single-select): Female / Male / Other.
  - **Activity level** — chips (single): Low / Moderate / High.
  - **Dietary pattern** — chips (single): None / Vegan / Vegetarian / Keto / Halal.
  - **Health conditions** — chips (**multi**-select), "Select all that apply": None / Diabetes / High blood pressure / Pregnant / IBS. ("None" is exclusive — selecting it clears others and vice-versa.)
  - **Allergies & intolerances** — text input, **white** fill, radius 12px, placeholder "e.g. peanuts, lactose, gluten…".
  - **Your goal** — chips (single): General wellbeing / Lose weight / Build muscle / Manage a condition.
- **Chip style:** radius 999px, padding 10px 18px, `Figtree` 600 14.5px, 1.5px border. Unselected: white bg, dark text, border `rgba(0,0,0,0.10)`. Selected: purple `#7C4DFF` bg, white text, purple border. Transition `all .12s`.
- "Save preferences" button (purple, full width) → Home. Persist to `localStorage` (per-device).

---

## Interactions & Behavior
- **Navigation:** header menu switches between Home / Claims history / Personalisation; "New check" resets Home. Back buttons and "Check another" return to Home.
- **Recording:** mic button toggles recording; while recording, a 1s timer increments (`mm:ss`) and the waveform animates. Wire to the MediaRecorder API in production.
- **Check flow:** Home → Processing (status cycling + progress bar) → Results. In production, replace the fixed 3s timer with the actual backend call; keep the cycling status messages as progress feedback.
- **Chips:** single-select groups set one value; the conditions group is multi-select with an exclusive "None".
- **Hover states:** buttons brighten and/or lift; cards/rows shift border to purple.
- **Animations (keyframes):** `zbob` (mascot bob), `zpupil` (googly-eye drift), `zspin` (magnifier ring on Processing), `wave` (waveform bars, running only while recording), `grow` (progress bar 0→100% over 3s), `fadeUp` (Results/History/Personalise entrance).

## State Management
- `screen`: 'home' | 'processing' | 'results' | 'history' | 'personalise'
- `menuOpen`: boolean
- `text`: current typed claim
- `recording`: boolean; `seconds`: elapsed record time
- `status`: current processing status string
- `person`: { age, sex, activity, diet, conditions[], allergies, goal } — persist to `localStorage`
- Results data (verdict, tag, color, confidence, truthScore, summary, points[], sources[]) — from the backend. Claims-history list — from stored past checks.

## Design Tokens
**Colors**
- Background (brand yellow): `#FFD100`
- Light yellow (input fills + large cards): `#FFF0A8`
- White (source rows, age/allergies inputs, history rows): `#FFFFFF`
- Text: `#1A1A1A`; muted text: `#7a6a1e`
- Accent pink: `#DB2A87`
- Primary purple: `#7C4DFF`; primary shadow: `rgba(124,77,255,0.32)`
- Record bar: `#26232E`; recording mic: `#EA3A5B`
- Verdict colors: myth `#DB2A87`, needs context `#E0A33B`, true/supported `#1E9E5A`
- Border: `rgba(0,0,0,0.10)`; dashed border: `rgba(0,0,0,0.20)`; chip/track: `rgba(0,0,0,0.06)`

**Typography**
- Display / headings: **Fredoka** (400–700). Headline 52px, screen titles 38px, verdict 28px.
- Body / UI: **Figtree** (400–800). Body 16–18px, labels 13–15px.
- Monospace (timers): **Space Mono**.
- Section labels: `Fredoka` 600, letter-spacing 1.5px, uppercase, pink.

**Radii:** buttons/inputs 12–18px; cards 16–24px; pills/chips 999px.

**Spacing:** column max-width 600px; input stack gap 22px; form field gap 24px; chip gap 9–10px.

**Shadows:** buttons `0 12px 28px rgba(124,77,255,0.32)`; cards `0 12px–20px 30–50px rgba(0,0,0,0.05–0.08)`.

## Assets
- **Mascot / logo glyph:** currently built with CSS/HTML (a `Fredoka` italic "z" in pink `#DB2A87` + two white googly-eye circles with black pupils + a black magnifier ring & handle). This is a **placeholder stand-in** for ZoeCheck's real brand mascot (the pink magnifying-glass creature) — replace with the official SVG/PNG asset from the brand.
- **Fonts:** Google Fonts — Fredoka, Figtree, Space Mono.
- **Icons:** currently emoji (☰ ✧ 🕘 ⚙ 🎙 ↑ 🔒 ✓ 📊 🏛 📄). Swap for a proper icon set (e.g. Lucide) in production.

## Files
- `ZoeCheck.dc.html` — the full interactive prototype (all screens, both design options). Read this for exact markup, values, and interaction logic. Build **Option A**.
- `support.js` — prototype runtime only; **do not port**.


