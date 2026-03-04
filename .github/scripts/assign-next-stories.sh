#!/usr/bin/env bash
# .github/scripts/assign-next-stories.sh
#
# Orchestrator script for the Copilot coding agent.
# Reads the dependency graph, checks which stories are completed,
# and assigns Copilot to all unblocked stories in parallel.
#
# Usage:
#   GH_TOKEN=<token> .github/scripts/assign-next-stories.sh [--dry-run]
#
# Requires: gh CLI, jq

set -euo pipefail

REPO="${GITHUB_REPOSITORY:-dheerink-visionplanner/opgelucht-generator}"
DEPS_FILE=".github/story-dependencies.json"
DRY_RUN=false

if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "🔍 DRY RUN — no assignments will be made"
fi

echo "📋 Reading dependency graph from $DEPS_FILE..."

if [[ ! -f "$DEPS_FILE" ]]; then
  echo "❌ Dependency file not found: $DEPS_FILE"
  exit 1
fi

# Get all closed issue numbers
echo "📦 Fetching closed issues..."
closed_issues=$(gh issue list --repo "$REPO" --state closed --label story --json number --jq '.[].number' 2>/dev/null || echo "")

# Get all open issues already assigned to copilot
echo "🤖 Checking existing Copilot assignments..."
assigned_to_copilot=$(gh issue list --repo "$REPO" --state open --label story --assignee copilot --json number --jq '.[].number' 2>/dev/null || echo "")

# Read all story keys from dependency graph
story_keys=$(jq -r '.stories | keys[]' "$DEPS_FILE")

assigned_count=0
blocked_count=0
already_done_count=0
already_assigned_count=0

echo ""
echo "═══════════════════════════════════════════"
echo "  Story Dependency Analysis"
echo "═══════════════════════════════════════════"

for story in $story_keys; do
  title=$(jq -r ".stories.\"$story\".title" "$DEPS_FILE")
  feature=$(jq -r ".stories.\"$story\".feature" "$DEPS_FILE")
  deps=$(jq -r ".stories.\"$story\".deps[]" "$DEPS_FILE" 2>/dev/null || echo "")

  # Skip if already closed
  if echo "$closed_issues" | grep -qw "$story" 2>/dev/null; then
    echo "  ✅ #$story $title — completed"
    already_done_count=$((already_done_count + 1))
    continue
  fi

  # Skip if already assigned to Copilot
  if echo "$assigned_to_copilot" | grep -qw "$story" 2>/dev/null; then
    echo "  🤖 #$story $title — already assigned to Copilot"
    already_assigned_count=$((already_assigned_count + 1))
    continue
  fi

  # Check if all dependencies are met
  all_deps_met=true
  blocking_deps=""
  for dep in $deps; do
    if ! echo "$closed_issues" | grep -qw "$dep" 2>/dev/null; then
      all_deps_met=false
      blocking_deps="$blocking_deps #$dep"
    fi
  done

  if [[ "$all_deps_met" == true ]]; then
    echo "  🚀 #$story $title — READY (no blockers)"

    if [[ "$DRY_RUN" == false ]]; then
      echo "     → Assigning Copilot to issue #$story..."

      # Add implementation context comment if no comments exist
      comment_count=$(gh issue view "$story" --repo "$REPO" --json comments --jq '.comments | length' 2>/dev/null || echo "0")

      if [[ "$comment_count" == "0" ]]; then
        gh issue comment "$story" --repo "$REPO" --body "## Implementation Plan

**Feature spec:** Read \`docs/features/$feature\` for detailed acceptance criteria and user story context.

**Instructions:**
1. Read the feature spec file referenced above to understand the full acceptance criteria
2. Follow the coding conventions in \`.github/copilot-instructions.md\`
3. Check existing code patterns in the codebase before creating new ones
4. Create/modify files following the project structure conventions
5. Write unit tests for all new services and utilities
6. Write integration tests for API routes and database operations
7. Ensure \`npm run lint\`, \`npm test\`, and \`npm run build\` all pass

**Validation gates:**
\`\`\`bash
npm run lint    # Zero errors
npm test        # All tests pass
npm run build   # Build succeeds
\`\`\`"
      fi

      # Assign Copilot
      gh issue edit "$story" --repo "$REPO" --add-assignee copilot 2>/dev/null || \
        echo "     ⚠️  Could not assign copilot to #$story (is Copilot coding agent enabled?)"
    fi

    assigned_count=$((assigned_count + 1))
  else
    echo "  ⏳ #$story $title — blocked by:$blocking_deps"
    blocked_count=$((blocked_count + 1))
  fi
done

echo ""
echo "═══════════════════════════════════════════"
echo "  Summary"
echo "═══════════════════════════════════════════"
echo "  ✅ Completed:        $already_done_count"
echo "  🤖 Already assigned: $already_assigned_count"
echo "  🚀 Newly assigned:   $assigned_count"
echo "  ⏳ Blocked:          $blocked_count"
echo "═══════════════════════════════════════════"

if [[ "$DRY_RUN" == true ]]; then
  echo ""
  echo "Run without --dry-run to assign Copilot to the $assigned_count ready stories."
fi
