# NoorPath Enterprise Arabic Pronunciation Engine — Engineering Report

**Date:** 2026-07-18  
**Scope:** Interactive Noorani Qaida pronunciation only (no UI redesign, lesson flow, ebook content, gamification rules, or admin business logic changes).  
**Codebase:** `noorpath-admin` → `src/features/noorani-qaida/audio/`

---

## 1. Root Cause Analysis

Pronunciation regressed after UI/architecture churn because speech was fragmented across multiple layers with conflicting voice policies:

| Failure mode | Root cause |
|---|---|
| Wrong / robotic / device-variable Arabic voice | First-available or English-primary voice selection; no wait for `voiceschanged`; no scoring |
| Overlap / duplicate speech | Parallel `speak()` calls from Rapid taps + React effects without a serial queue |
| Late start / hydration timing | Voices loaded after render; unlock not gated to user gesture on iOS/Android |
| Restart on spam clicks | Every tap cancelled and restarted the utterance |
| Animation desync | UI effects fired independently of speech `onstart` / `onend` |
| English letter names vs Arabic script | Product policy flip-flops (`spokenNames` / English TTS) vs Arabic-only requirement |

**Primary fix:** one singleton pipeline — `AudioManager → VoiceManager → QueueManager → BrowserCompat → SpeechAdapter → AnimationSync` — with Arabic-only letter lexicon and cached voice ranking.

---

## 2. Files Audited

Speech / audio usages found (repo-wide under Qaida):

- `speechSynthesis` / `SpeechSynthesisUtterance` / `getVoices` / `voiceschanged` — only in `engine/SpeechAdapter.ts`, `engine/VoiceManager.ts`, `engine/BrowserCompat.ts`
- `new Audio(...)` — `engine/AudioManager.ts` (optional file playback), `audio/manifest.ts` (capability probe)
- **No Howler.js**
- Call sites (all via `qaidaAudio` facade): LetterCard, LessonScreen, PracticeHub, QaidaEbook, TopicLessonScreen, SalahLessonScreen, CurriculumBook, NooraniBook, ReviewAssessmentScreen, games (FindLetter, SoundMatch, MemoryMatch, LetterPuzzle, BubblePop, LetterTrain, QuickChallenge), VoiceSetupWizard, QaidaShell unlock, useQaidaState configure

Dead / legacy:

- `audio/spokenNames.ts` — unused after Arabic-only engine (safe to delete in a follow-up)
- `audio/speech.ts` — thin deprecated wrappers → `audioManager`

---

## 3. Files Changed / Added

**Added**

- `audio/engine/types.ts`
- `audio/engine/letterLexicon.ts`
- `audio/engine/BrowserCompat.ts`
- `audio/engine/VoiceManager.ts`
- `audio/engine/QueueManager.ts`
- `audio/engine/SpeechAdapter.ts`
- `audio/engine/AnimationSync.ts`
- `audio/engine/AudioManager.ts`
- `audio/engine/index.ts`
- `audio/ENGINEERING_REPORT.md` (this file)

**Rewired**

- `audio/QaidaAudioService.ts` — thin facade over `audioManager`
- `audio/speech.ts` — deprecated redirects
- Intentional replay callers pass `policy: "replace"` (LessonScreen, PracticeHub, QaidaEbook, TopicLessonScreen, SalahLessonScreen, SoundMatch, VoiceSetupWizard)
- `LetterCard` — sparkles sync to speech `onStart` / `onEnd`
- Voice setup test speaks Arabic `ا`, not English “Alif”

---

## 4. Browser Compatibility Matrix

| Environment | Arabic voices | Notes |
|---|---|---|
| **Chrome Windows** | Often weak / silent unless Arabic pack installed | Resume-watch needed; prefer Edge for Microsoft Arabic |
| **Edge Windows** | Best for Microsoft Arabic (Saudi Arabia) | Recommended Windows target |
| **Chrome Android** | Google Arabic when installed | Requires user gesture unlock |
| **Safari iPhone / iPad** | Apple Arabic (e.g. Maged / Laila) | Strict gesture unlock; local voices preferred |
| **Mac Safari** | Apple Arabic | Generally reliable |
| **Firefox** | OS-dependent | Voice list can load late; polling + `voiceschanged` covered |
| **Samsung Internet** | Samsung Arabic when present | Ranked below Google/Apple/Microsoft |

Engine mitigations: user-gesture unlock, voice wait/poll, Chromium cancel→speak gap, Chrome/Edge pause/resume watchdog, Windows slightly longer post-cancel delay.

---

## 5. Voice Ranking Algorithm

1. Wait until voices are available (`getVoices` + `voiceschanged` + poll, ≤4s).
2. Discard non-`ar*` languages.
3. Score Arabic voices:

| Priority | Boost |
|---|---|
| Microsoft Arabic (Saudi / Naayf / `ar-SA`) | +500 |
| Microsoft Arabic | +400 |
| Google Arabic | +300 |
| Apple / Siri / Maged / Laila | +280 |
| Samsung Arabic | +250 |
| Any other `ar*` | +150 |
| `ar-SA` locale | +40 |
| `ar-EG` locale | +20 |
| `localService` | +60 |
| English / hybrid | −800 |

4. Cache winning `voiceURI` in `localStorage` (`noorpath.qaida.arabicVoice.v2`).
5. Reuse cache unless the browser voice list changes (`refreshIfChanged`).

---

## 6. Queue System

Policies:

- **`enqueue`** (default for letter exploration) — Alif → Ba → Ta play in order, no overlap
- **`replace`** — intentional replay / lesson “listen again” (cancels active + pending)
- **`ignore-if-busy`** — same letter while already speaking that letter (anti-spam)

Also:

- 180ms debounce on identical keys
- Single pump loop; AbortController cancels in-flight speech
- Effects enqueue; feedback replaces (guidance interrupts)

---

## 7. Performance Improvements

- Singleton managers (no per-render SpeechSynthesis clients)
- Lazy voice readiness; cached selection
- No English dual-utterance path for letters
- Components never import `speechSynthesis`
- Optional MP3 path via manifest when assets exist (prefers file over TTS)

---

## 8. Memory Optimizations

- Abort + cancel clears pending jobs
- Resume watchdog cleared on end/error/cancel
- Audio elements nulled after play/error
- Short-lived `AudioContext` tones closed after use
- Generation counter drops stale utterance callbacks

---

## 9. Accessibility

- Existing focus rings / min touch targets preserved (no UI redesign)
- Speech disabled when settings mute audio
- Reduced-motion paths in LetterCard / lessons unchanged
- Screen readers still see Arabic glyphs; TTS speaks Arabic script (not English spelling)

---

## 10. Future Recommendations

1. **Recorded Qari CDN** — ship verified MP3/OGG per letter + harakat; use TTS only as fallback. This is the Duolingo/Lingokids-quality path.
2. Delete `spokenNames.ts` once confirmed unused in CI.
3. Expose a tiny “Audio health” debug panel (selected voice, queue length, last error) for support.
4. Consider `ignore-if-busy` for auto-play on lesson mount vs user replay differentiation (already using `replace` for replay).

---

## 11. Technical Debt Removed

- Multiple competing speech helpers / English-primary letter policy
- Direct component-level synthesis (now forbidden by architecture)
- Unscored first-voice selection
- Uncontrolled overlap from parallel `speak()` calls

Remaining debt: empty pronunciation files in manifest (TTS fallback always used until assets land).

---

## 12. Remaining Limitations of Browser `SpeechSynthesis` (Honest)

**Browser TTS is not enterprise Quran audio.** Evidence:

- Voice inventory and quality differ by OS/browser; Chrome on Windows frequently reports Arabic while producing silence or robotic output.
- No tajweed control, consistent makharij, or child-appropriate pacing guarantees.
- Rate/pitch are approximate; cannot certify pedagogical pronunciation.
- Autoplay / gesture policies block speech until unlock.
- Some engines skip bare isolated letters without diacritics (mitigated with fatha in lexicon — still an engine quirk).

**Recommended upgrade path**

1. Commission or license a Qari (or certified teacher) recording pack for all 28 letters + common forms.
2. Host on CDN; wire keys already defined in `QAIDA_AUDIO_MANIFEST`.
3. Keep this engine as orchestration (queue, unlock, effects, animation sync) with `HTMLAudioElement` primary and TTS as last-resort fallback.
4. Optional later: streaming TTS API with a fixed Arabic neural voice for non-letter phrases only.

Until recorded audio ships, the product can be *consistent and controlled*, but cannot match studio Quran learning apps on absolute pronunciation fidelity.
