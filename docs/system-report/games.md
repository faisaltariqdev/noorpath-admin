# 9. Game Engine Documentation

The Noorani Qaida ships **7 mini-games** plus a shared **`GameShell`** wrapper. Games are pure
learning reinforcement: each receives a 6-letter window (`letterWindow(currentLetter.id)`) and reports
`onComplete(stars)`; `QaidaShell.handleGameComplete` then dispatches `game_completed`,
`earn_xp(stars×15)`, `earn_coins(stars×5)`, and fires confetti on 3★.

```mermaid
flowchart LR
  Shell["QaidaShell"] -->|letters, target, onComplete| Game["Game component"]
  Game --> GS["GameShell (HUD, timer, pause, result)"]
  Game -->|onComplete(stars)| Shell
  Shell --> Reward["+XP / +coins / confetti (3★)"]
```

> **Architectural note:** `rewards/rewardEngine.calculateGameReward()` (ratio-based stars) exists and is
> covered by contract tests, but the shell does **not** use it — each game computes its own stars.
> Consolidating these is a recommended refactor (see [code-quality.md](./code-quality.md)).

## 9.1 GameShell (shared wrapper)

`games/GameShell.tsx` — full-screen container providing:

- Header (title, instruction, icon), round progress bar (`round/totalRounds`), score/mistakes HUD.
- Optional timer bar with color thresholds (green >40%, amber >20%, red otherwise).
- Pause overlay (`P` key / button) and `Escape` to close.
- Completion modal ("MashaAllah!", filled/empty stars, result text, "Your reward is being added…").
- Entry/exit via `pageVariants` from the motion config.

Props: `title`, `instruction`, `icon`, `round`, `totalRounds`, `score`, `mistakes?`, `timeLeft?`,
`timeLimit?`, `finished?`, `stars?`, `resultText?`, `onClose`, `paused?`, `onPauseToggle?`, `children`.

## 9.2 Game comparison

| Game | Goal | Educational outcome | Rounds/Timer | Scoring (1★/2★/3★) | Single-letter focus |
|------|------|---------------------|--------------|--------------------|:-------------------:|
| **Bubble Pop** | Pop bubbles with the target letter | Visual recognition under motion/distractors | 5 pops / 45s | 0 mistakes→3★; ≤2→2★; else 1★ (timeout: score-based) | ✅ |
| **Find the Letter** | Pick the matching glyph from 4 | Shape discrimination + audio | 5 / 60s | 0 mistakes→3★; ≤2→2★; else 1★ | ✅ (`focusLetter`) |
| **Sound Match** | Hear pronunciation, pick glyph | Auditory→visual mapping | 5 / 60s | 5/5 & 0 mistakes→3★; ≥3→2★; else 1★ | ✅ (`focusLetter`) |
| **Memory Match** | Match Arabic glyph ↔ English name | Bilingual name association | 4 pairs / 90s | moves ≤6→3★; ≤8→2★; else 1★ | ❌ |
| **Letter Train** | Tap letters in ascending order | Alphabet sequencing | 5 slots / 45s | perfect→3★; ≤2 mistakes→2★; else 1★ | ❌ |
| **Letter Puzzle** | Choose the missing middle letter | Sequential awareness | 5 / 60s | 5/5 & 0 mistakes→3★; ≥3→2★; else 1★ | ❌ |
| **Quick Quiz** | Name the letter before timer | Letter–name recall under pressure | 5 / 15s each | ≥4→3★; ≥2→2★; else 1★ | ❌ |

`data/games.ts` marks `bubble-pop`, `find-letter`, `sound-match` as `singleLetter: true`. `GamesHub`
gates `letter-train`, `puzzle`, `sound-match` as "Coming Soon" (`stars === 0`), but **all 7 are fully
wired via the Practice Hub** and `practiceConfig`.

## 9.3 Per-game detail

### Bubble Pop (`BubblePop.tsx`)
Goal: pop 5 target bubbles. 5 animated bubbles/round (target guaranteed present), 70–100px, bobbing.
Correct → +score + "correct" sound + regenerate after 800ms; wrong → +mistake + Arabic retry feedback.
45s global timer. Educational: fast visual recognition amid distractors.

### Find the Letter (`FindLetter.tsx`)
Goal: select the target among 4 options. Target is `focusLetter` if set (letter-focused practice) else
random. Auto-pronounces each round; "Hear it" button; 1s lockout per pick; 60s timer.
> ⚠️ Final-round star calc reads `mistakes` from a stale closure — a last-round mistake may not count.

### Sound Match (`SoundMatch.tsx`)
Goal: hear a letter, pick its glyph from 4. Auto-plays on round; 🔊 (normal) + "Play slowly" (`mode:
"slow"`). `focusLetter` repeats the same target 5×. 60s timer. Educational: audio→visual mapping.

### Memory Match (`MemoryMatch.tsx`)
Goal: match glyph↔name pairs. 4 letters → 8 cards in a 4×2 grid with 3D flip. Match = same `id`,
different `type`. Pronounces the second flip. 90s timer. Educational: bilingual association + memory.

### Letter Train (`LetterTrain.tsx`)
Goal: fill train cars by tapping letters in ascending `id`. 5 letters, re-sorted; wrong pick →
+mistake, no placement. 45s timeout finishes with partial score; `completedRef` guards double-complete.
Educational: alphabet ordering.

### Letter Puzzle (`LetterPuzzle.tsx`)
Goal: pick the missing middle letter in `[prev, ?, next]`. Targets from `letters.slice(1,-1)`
(excludes endpoints); 4 options; 60s; hint on wrong ("Look at the letters on both sides").
Educational: sequential awareness.

### Quick Quiz (`QuickChallenge.tsx`)
Goal: choose the correct English name for a shown letter. 5 questions built at mount; 15s per question
(timeout counts wrong); 4 name options; pausable. Educational: recall under time pressure.

## 9.4 Difficulty & rewards summary

- **Difficulty levers:** timer length, distractor count, motion (bubbles), memory load (pairs),
  ordering constraints, and single-letter vs. window pools.
- **Reward:** stars → XP/coins; 3★ triggers confetti; games contribute to `gamesCompleted` and the
  `first-game`/`five-games` badges.

## 9.5 Progress integration

Game completion increments `gamesCompleted`, feeds XP/coins/level, and (via `gameCompletionCount`)
satisfies the lesson flow "Play" step in `LessonScreen`.

## 9.6 Future improvements

1. Route star calculation through `calculateGameReward()` to unify rules and fix stale-closure bugs.
2. Enable all 7 games in `GamesHub` (remove "Coming Soon" gating) to match Practice Hub.
3. Adaptive difficulty based on recent accuracy.
4. Per-game analytics (attempts, accuracy, time) once progress persists to Supabase.
5. Add haptics and richer audio feedback; accessibility pass for pointer-only games (keyboard play).

> Related: [noorani-qaida.md](./noorani-qaida.md) · [animations.md](./animations.md)
