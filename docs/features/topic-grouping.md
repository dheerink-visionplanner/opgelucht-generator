# Feature: Topic Grouping

## Description

The system automatically groups news items that cover the same topic, since multiple media outlets often report on the same event. Grouped items are presented as clusters so the user can review them together and generate a single, comprehensive article from multiple sources. The user can manually adjust groupings by merging or splitting groups.

## INVEST Analysis

| Criterion       | Assessment                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| **Independent** | ⚠️ Depends on News Item Review (US-3) for selected items. Can be developed with mock selected items.         |
| **Negotiable**  | ✅ The grouping algorithm (AI-based vs. keyword matching), threshold, and manual override UX are negotiable. |
| **Valuable**    | ✅ High value — prevents duplicate articles on the same topic and enables richer, multi-source articles.     |
| **Estimable**   | ⚠️ The AI-based grouping logic introduces some estimation uncertainty, but the scope is bounded.             |
| **Small**       | ✅ Focused on grouping selected items. No article generation or publishing.                                  |
| **Testable**    | ✅ Can be tested with known sets of related/unrelated articles and expected grouping outcomes.               |

## User Stories

### US-4.1: Automatic topic grouping

**As a** user,
**I want** the system to automatically group selected news items by topic,
**so that** I can see which articles cover the same event or subject.

**Acceptance Criteria:**

- [ ] After selecting news items, the system groups them by detected topic similarity.
- [ ] Each group has a suggested topic label derived from the article titles.
- [ ] Items that don't match any group are shown as standalone (group of one).
- [ ] The grouping is visible in the UI with clear visual separation between groups.

### US-4.2: Manually merge groups

**As a** user,
**I want to** merge two or more topic groups into one,
**so that** I can correct the automatic grouping when related articles were not detected as similar.

**Acceptance Criteria:**

- [ ] The user can select two or more groups and merge them into a single group.
- [ ] The merged group's label can be edited by the user.
- [ ] All items from the merged groups are combined into the resulting group.

### US-4.3: Manually split a group

**As a** user,
**I want to** remove an item from a group and place it in its own group or another group,
**so that** I can correct the automatic grouping when unrelated articles were incorrectly grouped.

**Acceptance Criteria:**

- [ ] The user can drag or move an individual item out of a group.
- [ ] The removed item becomes a standalone group or can be moved to another existing group.
- [ ] The original group remains intact with the remaining items.

### US-4.4: View grouped items

**As a** user,
**I want to** see all items within a topic group with their details,
**so that** I can verify the grouping is correct before generating an article.

**Acceptance Criteria:**

- [ ] Each group shows its topic label, the number of items, and all item details (title, source, date, link).
- [ ] Items within a group are sorted by publication date (most recent first).
- [ ] The user can expand/collapse groups.
