# Project APEX — Navigation 3.0

Navigation 3.0 is an **optional overlay**. Operational navigation remains the default; the user opts into executive workspaces via the sidebar footer switcher. Preference persists to `localStorage` under `ledgeros.nav-mode`.

## Five workspaces

| Workspace | Decision question |
|-----------|-------------------|
| Home | What requires my attention today? |
| Money | Where is the money, where is it going, and what can we safely use? |
| Growth | What is increasing company value? |
| People | What are our people costing, earning, producing, and needing? |
| Company | What does the company need to remain healthy, protected, and scalable? |

## Route mapping

The workspace-to-route map lives in `src/lib/mock/nav-executive.ts`. **No route path is renamed.** Executive nav references the same `to:` paths used by operational nav.

## Admin entry point

A single Admin entry — "Project APEX" — links to `/apex`. All `/apex/*` planning routes are gated on `implementation.view` and are hidden from the ordinary operational sidebar.

## Guarantees

- All existing routes remain functional in either navigation mode.
- Command palette continues to reach every route regardless of mode.
- Favorites and Recents remain shared across modes.
