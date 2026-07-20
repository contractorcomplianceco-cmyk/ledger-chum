# Internal Customization (CCA)

> **Placeholder.** This document is the home for internal-only customizations
> layered on top of the shipping `release/production` branch. It lives on the
> `internal/cca` branch, which is branched from `release/production` and should
> be periodically re-synced from it (merge `release/production` in; never push
> internal changes down to `release/production` or `main`).

## Purpose

`internal/cca` carries configuration, branding, and workflow tweaks that are
specific to internal (CCA) operations and are **not** part of the general
product release. Keeping them on a dedicated branch keeps the public
`release/production` superset clean.

## What belongs here

- Internal-only branding / invoice style defaults.
- CCA-specific navigation, feature toggles, or demo-vs-production overrides.
- Internal operational runbooks and account-specific configuration notes.

## What does NOT belong here

- Anything that should ship to all customers — that goes on `release/production`.
- Secrets of any kind (use environment variables per
  [`PRODUCTION-WIRING-CHECKLIST.md`](./PRODUCTION-WIRING-CHECKLIST.md)).

## Branch hygiene

- Branch base: `release/production`.
- Re-sync: `git merge origin/release/production` (keep this branch a superset of
  release, plus internal deltas).
- Never merge, push to, or open a PR against `main`.

_TODO: fill in concrete internal customization details as they are defined._
