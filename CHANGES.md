# What changed in this version

No new packages were added. `npm install` works exactly as before.

## Design
- New look: midnight sidebar, cool canvas, brass gold for money that has been won. Font is Schibsted Grotesk.
- Light and dark themes with a toggle. The choice is saved and applied before the page paints.
- On phones the sidebar becomes a bottom navigation bar.
- Dashboard leads with a **pipeline strip**: one bar split by stage value, from pale blue to deep indigo, ending in gold for Won.

## Features added
| Area | Feature |
|---|---|
| Everywhere | Ctrl/Cmd+K command palette (jump to a page, create a record, find a contact, deal or task) |
| Everywhere | Undo for deletes (6 seconds) instead of losing data |
| Everywhere | Edit for contacts, deals and tasks, using the same form as "New" |
| Dashboard | Weighted forecast, average deal size, change vs last month, overdue tasks, contacts by status, "needs a follow-up" list, tasks due today you can tick off |
| Contacts | Status filter pills with counts, phone number, call and email buttons, "Log contact today", linked deals in the drawer, follow-up warning after 14 days, CSV export |
| Deals | Drag and drop between stages (arrows still work, with keyboard support), forecast summary, close-date chips (overdue, closing soon), deal contact autocomplete |
| Tasks | Open / Today / Overdue / Done views, High / Medium / Low priority, "2 days late" labels |

## Backend
- `Task.priority` and `Contact.phone` fields added.
- `GET /api/stats` now returns `stages`, `weighted`, `avgDeal`, `totalDeals`, `wonPrevMonth`, `tasksOverdue` and `contactsByStatus`.
- Bug fix: moving a deal to Won now sets its close date to today. Before, it kept its old expected close date, so the dashboard did not count it as won this month.
- Seed data updated with phone numbers, task priorities and one overdue task.

## Code structure
`App.jsx` was one 300-line file. It is now split into pages, components and small helpers, which makes it easier to explain in the report.

## Accessibility
Dialogs trap focus and close with Escape, table rows and board controls work from the keyboard, charts have text alternatives, and animation is turned off for people who prefer reduced motion.
