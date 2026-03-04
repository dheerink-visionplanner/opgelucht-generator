---
description: "Assigns Copilot coding agent to unblocked stories based on the dependency graph"

on:
  issues:
    types: [closed]
  workflow_dispatch:

if: |
  github.event_name == 'workflow_dispatch' ||
  (github.event_name == 'issues' && contains(join(github.event.issue.labels.*.name, ','), 'story'))

concurrency:
  group: story-orchestrator

permissions:
  contents: read
  issues: read

tools:
  github:
    toolsets: [issues]
  bash: ["cat", "node", "echo"]

safe-outputs:
  assign-to-agent:
    name: "copilot"
    target: "*"
    max: 10
    custom-instructions: |
      Follow the implementation process described in `.github/prompts/implement-plan.prompt.md`.
      Read the implementation plan comment on this issue for the feature spec reference.
      Read the feature spec from `docs/features/` as referenced in the plan comment.
      Follow coding conventions in `.github/copilot-instructions.md`.
      Run all validation gates before committing: `npm run lint`, `npm test`, `npm run build`.
    github-token: ${{ secrets.GH_AW_AGENT_TOKEN }}
  add-comment:
    target: "*"
    max: 10
---

# Story Orchestrator

You are the project orchestrator for the **Opgelucht Generator** project. Your role is to analyze the story dependency graph and assign the Copilot coding agent to all stories that are ready for implementation.

## Context

This project has 32 user stories (GitHub issues #15–#46) organized into 10 features. Stories have dependencies — a story can only be worked on when all its dependency stories are completed (their issue is closed). Stories with no unmet dependencies can be implemented in parallel by separate Copilot coding agent sessions.

## Process

### Step 1: Read the dependency graph

Read the file `.github/story-dependencies.json`:

```bash
cat .github/story-dependencies.json
```

This file contains a `stories` object where each key is an issue number and each value has:
- `deps` — array of issue numbers that must be closed first
- `feature` — the feature spec filename in `docs/features/`
- `title` — human-readable story title

### Step 2: Get current issue status

Use the GitHub issues tools to list all issues in this repository with the `story` label. For each issue, determine if it is:
- **Closed** — the story is completed
- **Open and assigned to `copilot`** — the story is currently being worked on
- **Open and unassigned** — a candidate for assignment

### Step 3: Identify unblocked stories

For each open, unassigned story from the dependency graph, check whether ALL issue numbers in its `deps` array correspond to closed issues. If every dependency is closed (or the `deps` array is empty), the story is **unblocked** and ready for implementation.

### Step 4: Add implementation context

For each unblocked story that does not yet have any comments, add a comment with the following content (replacing `FEATURE_FILE` with the actual `feature` value from the dependency graph):

---

## Implementation Plan

**Feature spec:** Read `docs/features/FEATURE_FILE` for detailed acceptance criteria and user story context.

**Instructions:**
1. Read the feature spec file referenced above to understand the full acceptance criteria
2. Follow the coding conventions in `.github/copilot-instructions.md`
3. Follow the implementation process in `.github/prompts/implement-plan.prompt.md`
4. Check existing code patterns in the codebase before creating new ones
5. Create/modify files following the project structure conventions
6. Write unit tests for all new services and utilities
7. Write integration tests for API routes and database operations
8. Ensure `npm run lint`, `npm test`, and `npm run build` all pass

**Validation gates:**
```
npm run lint    # Zero errors
npm test        # All tests pass
npm run build   # Build succeeds
```

---

### Step 5: Assign Copilot

For each unblocked story identified in Step 3, assign the Copilot coding agent by providing the issue number. This triggers autonomous implementation.

### Step 6: Report summary

After processing, output a summary listing:
- Total completed stories (closed issues)
- Stories currently in progress (assigned to copilot)
- Stories newly assigned in this run
- Stories still blocked (with their blocking dependencies)

## Rules

- **Never assign a story whose dependencies are not ALL closed** — this is the critical invariant
- **Skip stories already assigned to copilot** — they are already being implemented
- **Assign ALL eligible unblocked stories** — independent stories run in parallel
- **Always add the implementation context comment before assigning** — so Copilot has the plan
- **Only process issues in the dependency graph** (issues #15–#46) — ignore other issues
