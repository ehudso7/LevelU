---
mode: "agent"
description: "Scaffold a focused coding agent task and implementation plan"
tools:
  - codebase
  - editFiles
  - search
  - runCommands
---
Create a focused coding agent workflow for this repository.

Inputs to ask for if missing:
- Goal: the exact outcome the user wants.
- Scope: files/folders allowed to change.
- Constraints: style, libraries, deadlines, and anything forbidden.
- Verification: tests, lint, and manual checks required.

Then do the following:
1. Summarize the task in one paragraph and list assumptions.
2. Create a short execution plan with ordered steps.
3. Implement the changes directly in the workspace.
4. Run relevant validation commands.
5. Provide a concise report with:
   - Files changed
   - Key decisions
   - Validation results
   - Follow-up options

Repository-specific defaults for LevelU:
- Frontend stack: Expo + React Native + TypeScript.
- Backend endpoints: Supabase Edge Functions under `supabase/functions`.
- Shared domain docs: `docs/product-rules` and `docs/api-contracts`.
- Preferred checks: `npm run lint` and `npm test` when changes are non-trivial.

Quality bar:
- Keep changes minimal and scoped.
- Preserve existing architecture and naming patterns.
- Add or update tests for behavior changes.
- Flag ambiguities before making risky assumptions.
