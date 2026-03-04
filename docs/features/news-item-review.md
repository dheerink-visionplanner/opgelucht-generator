# Feature: News Item Review & Selection

## Description

The system displays all fetched news items in a review screen where the user can browse, filter, and select the relevant 10–20% of items for further processing. This is the key human-in-the-loop step where editorial judgment determines which items become articles. Unselected items are marked as dismissed and won't reappear in future reviews.

## INVEST Analysis

| Criterion       | Assessment                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------- |
| **Independent** | ⚠️ Depends on RSS Feed Fetching (US-2) to have items to display. Can be developed with seed data. |
| **Negotiable**  | ✅ Filter options, sort order, batch selection, and dismissal behavior are all negotiable.        |
| **Valuable**    | ✅ Critical workflow step — the user needs an efficient way to review and curate content.         |
| **Estimable**   | ✅ Standard list/selection UI with filtering. Well-understood complexity.                         |
| **Small**       | ✅ Focused on display and selection only. No article generation or classification.                |
| **Testable**    | ✅ Clear criteria around selection, filtering, and state transitions of news items.               |

## User Stories

### US-3.1: View unprocessed news items

**As a** user,
**I want to** see a list of all unprocessed (new) news items,
**so that** I can review what has been fetched recently.

**Acceptance Criteria:**

- [ ] The review screen shows only news items that have not yet been selected or dismissed.
- [ ] Each item displays: title, source name, publication date, and a link to the original article.
- [ ] Items are sorted by publication date (most recent first).
- [ ] The total number of unprocessed items is displayed.

### US-3.2: Select news items for processing

**As a** user,
**I want to** select one or more news items as relevant,
**so that** they proceed to topic grouping and article generation.

**Acceptance Criteria:**

- [ ] The user can select individual items via a checkbox or selection control.
- [ ] The user can select multiple items at once.
- [ ] Selected items are marked with a "selected" status in the database.
- [ ] Selected items are removed from the unprocessed list and appear in the processing pipeline.

### US-3.3: Dismiss irrelevant news items

**As a** user,
**I want to** dismiss news items that are not relevant,
**so that** they no longer clutter the review list.

**Acceptance Criteria:**

- [ ] The user can dismiss individual items.
- [ ] The user can dismiss multiple items at once (bulk dismiss).
- [ ] Dismissed items are marked with a "dismissed" status and no longer appear in the unprocessed list.
- [ ] Dismissed items can be viewed in a separate "dismissed" view if needed.

### US-3.4: Filter news items

**As a** user,
**I want to** filter the news item list by feed/search term and date range,
**so that** I can focus on specific topics or time periods.

**Acceptance Criteria:**

- [ ] The user can filter by originating feed (search term).
- [ ] The user can filter by date range.
- [ ] Filters can be combined.
- [ ] The item count updates to reflect the filtered results.
- [ ] Filters can be cleared to show all unprocessed items again.

### US-3.5: Preview original article

**As a** user,
**I want to** open the original article in a new browser tab,
**so that** I can read the full article to judge its relevance.

**Acceptance Criteria:**

- [ ] Each news item has a clickable link that opens the original article URL in a new tab (`target="_blank"`).
- [ ] The link is clearly visible and accessible.
