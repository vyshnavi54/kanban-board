# 📋 Kanban Board – Next.js Intern Assignment

A Trello-inspired Kanban Board built with **Next.js 15 (App Router)**, **TypeScript**, and **Tailwind CSS**, featuring a distinctive deep-space aurora UI.

---

## ✨ All Features

### Core
- **Create cards** — title, description, priority (High/Medium/Low), optional deadline
- **Three columns** — Pending → In Progress → Completed
- **Move cards** — arrow buttons or drag & drop
- **Edit** cards — all fields editable
- **Delete** with two-step confirmation

### Priority & Deadlines
- **High-priority cards always appear first** within each column
- Red corner ribbon on HIGH cards
- **Deadline countdown** shown on Pending and In Progress cards:
  - 🔴 Overdue / 🔴 < 3h left / 🟠 today / 🟡 1–3 days / 🟢 4+ days

### Visual Effects
| Trigger | Effect |
|---|---|
| **Hover any card** | Sparkle particles ✦✧⊹ float around the card |
| **Add a card** | ✨ Golden burst particles rise in the Pending column + toast |
| **Move to In Progress** | ⚡ Blue lightning glow on the column + bolt particles + toast |
| **Move to Completed** | 🎉 Full-screen canvas confetti (only here!) + encouragement toast |

### Bonus
- **Drag & Drop** — native HTML5 API, no library needed
- **localStorage persistence** — board survives page refresh
- **Search/filter** — real-time across all columns
- **Stats bar** — total, done, and high-priority counts
- **Loading & empty states** per column

---

## 🚀 Quick Start

```bash
unzip kanban-board.zip
cd kanban-board
npm install
npm run dev
```

Open **http://localhost:3000**

---

## 🏗️ Architecture

```
kanban-board/
├── app/
│   ├── layout.tsx          # Root layout (Server Component)
│   ├── page.tsx            # Page shell (Server Component)
│   └── globals.css         # Aurora bg, CSS variables, keyframes
├── components/
│   ├── KanbanBoard.tsx     # State management, effects hub (Client)
│   ├── Column.tsx          # Drop zone, spark/lightning effects (Client)
│   ├── KanbanCard.tsx      # Card with sparkle hover, ribbon, deadline (Client)
│   ├── CardModal.tsx       # Create/edit modal (Client)
│   ├── ConfettiCanvas.tsx  # Canvas confetti — completion only (Client)
│   └── Toast.tsx           # Encouragement notifications (Client)
├── types/
│   └── index.ts            # Card, Status, Priority types
└── ...config files
```

### Server vs Client components
`app/page.tsx` and `app/layout.tsx` are Server Components rendering static shells. Every interactive element (`'use client'`) sits in the `components/` folder, pushed to the leaves of the tree per Next.js App Router best practices.

---

## 🎨 Design Choices
- **Font**: Outfit (display) + JetBrains Mono (mono)
- **Background**: `#04070e` + CSS aurora (animated radial gradients)
- **Column**: `#080e1e` — clearly darker than cards
- **Card**: `#0f1829` — lighter than column, with hover state `#152038`
- Clear three-tier depth: page → column → card

---

## 🌐 Deploy to Vercel

```bash
npm i -g vercel && vercel
```
