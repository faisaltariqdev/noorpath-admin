# 19. User Journey Documentation

Mermaid flowcharts for every major journey. Render on GitHub or any Mermaid-aware viewer.

## 19.1 Admin journey

```mermaid
flowchart TD
  L["/login (select admin)"] --> Auth{"authorizeAdmin"}
  Auth -->|ok| D["/admin dashboard"]
  Auth -->|fail| L
  D --> Users["Manage users + availability"]
  D --> Students["Manage students"] --> Detail["Student hub"]
  D --> Sessions["Schedule sessions"]
  D --> Fees["Invoices"]
  D --> Earn["Tutor earnings"]
  D --> Reports["Review reports"]
  D --> Analytics["Analytics (charts)"]
  D --> Notif["Broadcast notifications"]
  D --> Msg["Messages"]
  D --> Qaida["Noorani Qaida (fullscreen)"]
```

## 19.2 Teacher journey

```mermaid
flowchart TD
  L["/login (tutor)"] --> T["/tutor dashboard"]
  T --> Classes["Today's classes"]
  Classes --> Teach["Deliver 1:1 class"]
  Teach --> Att["Mark attendance"]
  Teach --> Rep["Write progress report + audio"]
  Rep --> HW["Assign homework"]
  T --> Road["Update roadmap"]
  T --> Voice["Voice tracker"]
  T --> Earn["Earnings"]
  T --> QaidaT["Qaida teacher view (placeholder)"]
```

## 19.3 Parent journey

```mermaid
flowchart TD
  L["/login (parent)"] --> P["/parent home"]
  P --> Sw["Switch child"]
  Sw --> Prog["Progress + audio"]
  Sw --> Att["Attendance calendar"]
  Sw --> HW["Homework (mark done)"]
  Sw --> Sess["Sessions + links"]
  Sw --> Fees["Fees"]
  Sw --> Journey["Gamified journey"]
  Sw --> QaidaP["Qaida view (device-local)"]
  P --> Msg["Messages"]
```

## 19.4 Student (learner) journey

```mermaid
flowchart TD
  Open["Open Qaida"] --> Hub["Dashboard / Book / Journey"]
  Hub --> Letter["Letter lesson"]
  Letter --> Meet --> Hear --> Trace --> Play --> Reward --> Done["complete_screen"]
  Done -->|more| Letter
  Done -->|marks & reading| Topics["Harakaat → … → Quranic"]
  Topics --> Revise["Revision"] --> Assess["Assessment ≥80%"] --> Cert["Certificate"]
```

## 19.5 Public visitor journey

```mermaid
flowchart TD
  Site["noorpath.online (marketing)"] --> CTA["Click Live Demo / video"]
  CTA --> Prev["/qaida-preview (no login)"]
  Prev --> Alif["Alif lesson unlocked"]
  Alif --> Try["Meet/Hear/Trace/Play"]
  Try --> Locked{"Tap another module?"}
  Locked -->|yes| Enrol["Enrol prompt modal"]
  Enrol --> Course["noorpath.online/courses/noorani-qaida-online"]
  Locked -->|no| Alif
```

## 19.6 Interactive demo journey (preview internals)

```mermaid
flowchart TD
  Route["/qaida-preview page (force-static)"] --> Client["QaidaPreviewClient"]
  Client --> Shell["QaidaShell preview enrolUrl"]
  Shell --> Banner["Preview banner + enrol CTA"]
  Shell --> Unlock["PREVIEW_UNLOCKED_VIEWS = lessons"]
  Unlock --> AlifOnly["Only letter-1 reachable"]
  AlifOnly --> Lock{"Locked nav/screen?"}
  Lock -->|yes| Modal["Enrol prompt"]
  Lock -->|finish Alif| Modal
```

## 19.7 Lesson journey (state machine)

```mermaid
stateDiagram-v2
  [*] --> welcome
  welcome --> introduce: auto
  introduce --> listen: Hear
  listen --> trace: Trace
  trace --> repeat: Repeat
  repeat --> game: Play
  game --> reward: Reward
  reward --> complete: onComplete
  complete --> [*]
```

## 19.8 Game journey

```mermaid
flowchart TD
  Launch["Select game (PracticeHub/GamesHub)"] --> Play["Rounds within timer"]
  Play --> Score["Score + mistakes tracked"]
  Score --> End{"Complete or timeout"}
  End --> Stars["Compute 1–3★"]
  Stars --> Reward["+XP/+coins, game_completed"]
  Reward -->|3★| Confetti["Confetti"]
  Reward --> Close["Return to hub"]
```

## 19.9 Enrollment journey (business)

```mermaid
flowchart TD
  Visitor["Prospective family"] --> Demo["/qaida-preview"]
  Demo --> Interest["Enrol prompt / marketing CTA"]
  Interest --> Contact["Book trial / contact"]
  Contact --> AdminCreate["Admin creates parent + student"]
  AdminCreate --> Assign["Assign tutor + schedule sessions"]
  Assign --> Learn["Live classes + Qaida practice"]
  Learn --> Reports["Reports → parent visibility"]
  Reports --> Billing["Fees + earnings"]
```

## 19.10 Authentication decision tree

```mermaid
flowchart TD
  R["Request"] --> M{"/admin or /api/admin?"}
  M -->|no| Open["No middleware"]
  M -->|yes| A{"authorizeAdmin"}
  A -->|admin| OK["Allow"]
  A -->|anonymous| RL["→ /login (page) or 401 (api)"]
  A -->|wrong role| RR["→ /{role} (page) or 403 (api)"]
  A -->|inactive| RL
```

> Related: [authentication.md](./authentication.md) · [noorani-qaida.md](./noorani-qaida.md)
