# CRM (MERN)

A sales CRM built with React (Vite), Express and MongoDB (Mongoose). Track contacts, move deals through a pipeline, and keep follow-up tasks in one place.

## Features
- **Dashboard:** pipeline strip split by stage, weighted forecast, win rate, revenue per month, tasks due, and contacts who need a follow-up
- **Contacts:** server-side search, status filters, sortable columns, detail drawer, edit, "Log contact today", email and call links, CSV export
- **Deals:** drag-and-drop board (or use the arrows), edit, close-date warnings, forecast totals
- **Tasks:** Open / Today / Overdue / Done views, priorities, edit
- **Everywhere:** undo after delete, Ctrl/Cmd+K search and commands, light and dark theme (remembered), works on phones

## Setup
1. Install MongoDB locally, or create a free MongoDB Atlas cluster.
2. `cp server/.env.example server/.env` (already created) and set `MONGO_URI`.
3. From this folder:

```bash
npm install            # installs concurrently
npm run install:all    # installs server + client deps
npm run seed           # loads sample contacts, deals, tasks
npm run dev            # API on :5000, web on :5173
```

Run `npm run seed` again after updating from an older version so the sample data gets phone numbers and task priorities. It replaces all existing data.

## API
| Method | Route | Notes |
|---|---|---|
| GET | /api/contacts | `?q=` search, `?status=Lead` |
| GET | /api/deals | `?q=`, `?stage=Won` |
| GET | /api/tasks | `?q=`, `?done=false` |
| POST | /api/{resource} | create |
| GET / PATCH / DELETE | /api/{resource}/:id | read, update, delete |
| GET | /api/stats | pipeline by stage, weighted forecast, KPIs, revenue by month, contacts by status, activity |
| GET | /api/health | liveness check |

Moving a deal to **Won** sets its close date to today, so it counts toward "Won this month" and the revenue chart.

## Structure
```
server/src
  index.js · seed.js
  models/   Contact.js · Deal.js · Task.js
  routes/   crud.js (generic REST) · stats.js (dashboard numbers)
client/src
  App.jsx · api.js · utils.js · icons.jsx · ui.jsx · charts.jsx · index.css · main.jsx
  pages/        Dashboard · Contacts · Deals · Tasks
  components/   Drawer · FormModal · CommandPalette
```
